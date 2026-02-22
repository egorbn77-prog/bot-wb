// ============================================
// БЛОК 10: Ядро бота
// ============================================

import type { Review, WbReview } from '@/types/review';
import type { BotStatus, BotLogEntry, BotStats } from '@/types/settings';
import { createWbApiClient } from '@/lib/wb-api/client';
import { processReview, findMatchingScenario, generateAnswer } from '@/lib/scenarios/engine';
import { generateAiAnswer } from '@/lib/ai/generator';
import { getSettings, updateSettings, generateId, isAiConfigured } from '@/lib/data/json-storage';
import { getContextForReview } from '@/lib/knowledge-base/searcher';

// ============================================
// Глобальное состояние бота
// ============================================

let botState: {
  isRunning: boolean;
  startedAt: Date | null;
  lastPollAt: Date | null;
  intervalId: NodeJS.Timeout | null;
  reviewsProcessed: number;
  answersSent: number;
  errorsCount: number;
  logs: BotLogEntry[];
  pendingReviews: Map<string, Review>;
} = {
  isRunning: false,
  startedAt: null,
  lastPollAt: null,
  intervalId: null,
  reviewsProcessed: 0,
  answersSent: 0,
  errorsCount: 0,
  logs: [],
  pendingReviews: new Map(),
};

// ============================================
// Логирование
// ============================================

function addLog(
  level: 'info' | 'warning' | 'error',
  message: string,
  details?: Record<string, unknown>
): void {
  const entry: BotLogEntry = {
    id: generateId('log'),
    timestamp: new Date(),
    level,
    message,
    details,
  };
  
  botState.logs.unshift(entry);
  
  // Храним только последние 100 записей
  if (botState.logs.length > 100) {
    botState.logs.pop();
  }
  
  // Вывод в консоль
  const logMethod = level === 'error' ? console.error : level === 'warning' ? console.warn : console.log;
  logMethod(`[${level.toUpperCase()}] ${message}`, details || '');
}

// ============================================
// Преобразование данных
// ============================================

function wbReviewToReview(wbReview: WbReview): Review {
  return {
    id: generateId('review'),
    wbId: wbReview.id,
    productId: wbReview.productId.toString(),
    productName: wbReview.productName,
    productArticle: wbReview.productArticle,
    rating: wbReview.rating,
    text: wbReview.text,
    pros: wbReview.pros,
    cons: wbReview.cons,
    author: wbReview.userName,
    authorId: wbReview.userId?.toString(),
    createdAt: new Date(wbReview.createdAt),
    status: 'new',
  };
}

// ============================================
// Обработка отзывов
// ============================================

async function processReviewWithBot(review: Review): Promise<{
  answer: string;
  scenarioId?: string;
  isAiGenerated: boolean;
}> {
  const settings = getSettings();
  const aiEnabled = settings.ai.isEnabled && isAiConfigured();
  
  // Сначала пробуем найти подходящий сценарий
  const match = findMatchingScenario(review);
  
  if (match) {
    // Если сценарий требует AI
    if (match.scenario.useAi && aiEnabled) {
      const context = getContextForReview(review.text, review.productArticle);
      const result = await generateAiAnswer(review, settings.ai, match.scenario, context);
      return {
        answer: result.answer,
        scenarioId: match.scenario.id,
        isAiGenerated: true,
      };
    }
    
    // Используем шаблон сценария
    const answer = generateAnswer(review, match);
    return {
      answer,
      scenarioId: match.scenario.id,
      isAiGenerated: false,
    };
  }
  
  // Если сценарий не найден, используем AI как fallback
  if (settings.ai.useAsFallback && aiEnabled) {
    const context = getContextForReview(review.text, review.productArticle);
    const result = await generateAiAnswer(review, settings.ai, undefined, context);
    return {
      answer: result.answer,
      isAiGenerated: true,
    };
  }
  
  // Если ничего не подошло, возвращаем стандартный ответ
  return {
    answer: 'Спасибо за ваш отзыв! Мы ценим ваше мнение и обязательно учтём его в нашей работе.',
    isAiGenerated: false,
  };
}

// ============================================
// Основной цикл бота
// ============================================

async function pollReviews(): Promise<void> {
  const settings = getSettings();
  
  if (!settings.wbApi.isEnabled) {
    addLog('warning', 'Бот отключён в настройках');
    return;
  }
  
  try {
    addLog('info', 'Запуск опроса отзывов');
    botState.lastPollAt = new Date();
    
    const client = createWbApiClient();
    
    // Получаем неотвеченные отзывы
    const response = await client.getReviews({
      isAnswered: false,
      limit: 50,
    });
    
    addLog('info', `Получено ${response.reviews.length} отзывов`);
    
    for (const wbReview of response.reviews) {
      try {
        // Преобразуем в наш формат
        const review = wbReviewToReview(wbReview);
        
        // Проверяем, не обрабатывали ли уже
        if (botState.pendingReviews.has(review.wbId)) {
          continue;
        }
        
        // Обрабатываем отзыв
        const result = await processReviewWithBot(review);
        
        // Сохраняем в pending
        botState.pendingReviews.set(review.wbId, {
          ...review,
          answer: result.answer,
          scenarioId: result.scenarioId,
          isAiGenerated: result.isAiGenerated,
          status: 'pending',
        });
        
        botState.reviewsProcessed++;
        
        addLog('info', `Обработан отзыв ${review.wbId}`, {
          productName: review.productName,
          rating: review.rating,
          isAiGenerated: result.isAiGenerated,
        });
        
        // Если включена автоотправка
        if (settings.bot.autoSend) {
          await sendAnswer(review.wbId, result.answer);
        }
        
      } catch (error) {
        botState.errorsCount++;
        addLog('error', `Ошибка обработки отзыва ${wbReview.id}`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
  } catch (error) {
    botState.errorsCount++;
    addLog('error', 'Ошибка опроса отзывов', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function sendAnswer(reviewWbId: string, answer: string): Promise<boolean> {
  try {
    const client = createWbApiClient();
    const result = await client.sendAnswer(reviewWbId, answer);
    
    if (result.success) {
      botState.answersSent++;
      
      // Обновляем статус в pending
      const review = botState.pendingReviews.get(reviewWbId);
      if (review) {
        review.status = 'answered';
        review.answeredAt = new Date();
      }
      
      addLog('info', `Ответ отправлен для отзыва ${reviewWbId}`);
      return true;
    } else {
      botState.errorsCount++;
      addLog('error', `Ошибка отправки ответа для ${reviewWbId}`, {
        error: result.error,
      });
      return false;
    }
  } catch (error) {
    botState.errorsCount++;
    addLog('error', `Ошибка отправки ответа для ${reviewWbId}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

// ============================================
// Управление ботом
// ============================================

/**
 * Запускает бота
 */
export function startBot(): { success: boolean; message: string } {
  if (botState.isRunning) {
    return { success: false, message: 'Бот уже запущен' };
  }
  
  const settings = getSettings();
  
  if (!settings.wbApi.apiKey) {
    return { success: false, message: 'API ключ не настроен. Бот запущен в тестовом режиме с заглушкой.' };
  }
  
  botState.isRunning = true;
  botState.startedAt = new Date();
  
  // Запускаем периодический опрос
  const intervalMs = settings.wbApi.pollIntervalMinutes * 60 * 1000;
  botState.intervalId = setInterval(pollReviews, intervalMs);
  
  // Запускаем первый опрос сразу
  pollReviews();
  
  addLog('info', 'Бот запущен');
  
  return { success: true, message: 'Бот успешно запущен' };
}

/**
 * Останавливает бота
 */
export function stopBot(): { success: boolean; message: string } {
  if (!botState.isRunning) {
    return { success: false, message: 'Бот не запущен' };
  }
  
  if (botState.intervalId) {
    clearInterval(botState.intervalId);
    botState.intervalId = null;
  }
  
  botState.isRunning = false;
  addLog('info', 'Бот остановлен');
  
  return { success: true, message: 'Бот успешно остановлен' };
}

/**
 * Получает статус бота
 */
export function getBotStatus(): BotStatus {
  return {
    isRunning: botState.isRunning,
    lastPollAt: botState.lastPollAt || undefined,
    lastError: botState.logs.find(l => l.level === 'error')?.message,
    reviewsProcessed: botState.reviewsProcessed,
    answersSent: botState.answersSent,
    errorsCount: botState.errorsCount,
    startedAt: botState.startedAt || undefined,
  };
}

/**
 * Получает логи бота
 */
export function getBotLogs(limit: number = 50): BotLogEntry[] {
  return botState.logs.slice(0, limit);
}

/**
 * Получает отзывы, ожидающие обработки
 */
export function getPendingReviews(): Review[] {
  return Array.from(botState.pendingReviews.values());
}

/**
 * Получает отзыв по ID
 */
export function getPendingReview(wbId: string): Review | undefined {
  return botState.pendingReviews.get(wbId);
}

/**
 * Подтверждает и отправляет ответ
 */
export async function confirmAnswer(wbId: string, editedAnswer?: string): Promise<{
  success: boolean;
  message: string;
}> {
  const review = botState.pendingReviews.get(wbId);
  
  if (!review) {
    return { success: false, message: 'Отзыв не найден' };
  }
  
  const answer = editedAnswer || review.answer;
  
  if (!answer) {
    return { success: false, message: 'Ответ не сформирован' };
  }
  
  const sent = await sendAnswer(wbId, answer);
  
  if (sent) {
    return { success: true, message: 'Ответ успешно отправлен' };
  } else {
    return { success: false, message: 'Ошибка отправки ответа' };
  }
}

/**
 * Отклоняет ответ
 */
export function rejectAnswer(wbId: string): { success: boolean; message: string } {
  const review = botState.pendingReviews.get(wbId);
  
  if (!review) {
    return { success: false, message: 'Отзыв не найден' };
  }
  
  review.status = 'error';
  review.error = 'Ответ отклонён пользователем';
  
  botState.pendingReviews.delete(wbId);
  
  addLog('info', `Ответ отклонён для отзыва ${wbId}`);
  
  return { success: true, message: 'Ответ отклонён' };
}

/**
 * Редактирует ответ
 */
export function editAnswer(wbId: string, newAnswer: string): { success: boolean; message: string } {
  const review = botState.pendingReviews.get(wbId);
  
  if (!review) {
    return { success: false, message: 'Отзыв не найден' };
  }
  
  review.answer = newAnswer;
  
  return { success: true, message: 'Ответ обновлён' };
}

/**
 * Получает статистику
 */
export function getBotStats(): BotStats {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  
  // Простая статистика (в реальном проекте нужно хранить в БД)
  return {
    today: {
      newReviews: botState.reviewsProcessed,
      answered: botState.answersSent,
      errors: botState.errorsCount,
    },
    week: {
      newReviews: botState.reviewsProcessed,
      answered: botState.answersSent,
      errors: botState.errorsCount,
    },
    total: {
      reviewsProcessed: botState.reviewsProcessed,
      answersSent: botState.answersSent,
      errors: botState.errorsCount,
    },
    lastActivityAt: botState.lastPollAt || undefined,
  };
}

/**
 * Принудительный опрос
 */
export async function forcePoll(): Promise<{ success: boolean; message: string }> {
  if (!botState.isRunning) {
    return { success: false, message: 'Бот не запущен' };
  }
  
  await pollReviews();
  
  return { success: true, message: 'Опрос выполнен' };
}
