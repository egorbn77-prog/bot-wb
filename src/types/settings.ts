// ============================================
// БЛОК 4: Типы данных настроек и API
// ============================================

/**
 * Настройки API Wildberries
 */
export interface WbApiSettings {
  // API ключ (будет получен позже)
  apiKey: string;
  
  // Базовый URL API
  baseUrl: string;
  
  // Интервал опроса в минутах
  pollIntervalMinutes: number;
  
  // Максимальное количество запросов в минуту
  rateLimitPerMinute: number;
  
  // Включен ли бот
  isEnabled: boolean;
}

/**
 * Настройки AI генерации
 */
export interface AiSettings {
  // Провайдер AI
  provider: 'openai' | 'anthropic' | 'google' | 'yandex' | 'deepseek' | 'openrouter' | 'custom' | 'none';
  
  // API ключ
  apiKey: string;
  
  // Базовый URL (для custom провайдера)
  baseUrl?: string;
  
  // Модель
  model: string;
  
  // Максимальное количество токенов
  maxTokens: number;
  
  // Температура генерации
  temperature: number;
  
  // Включена ли AI генерация
  isEnabled: boolean;
  
  // Использовать AI только когда нет подходящего сценария
  useAsFallback: boolean;
}

/**
 * Общие настройки бота
 */
export interface BotSettings {
  // Режим работы
  mode: 'auto' | 'manual' | 'hybrid';
  
  // Автоматически отправлять ответы
  autoSend: boolean;
  
  // Требовать подтверждение перед отправкой
  requireConfirmation: boolean;
  
  // Сохранять историю ответов
  keepHistory: boolean;
  
  // Количество дней хранения истории
  historyRetentionDays: number;
  
  // Уведомления
  notifications: {
    email?: string;
    telegram?: string;
    onNewReview: boolean;
    onError: boolean;
    onAnswerSent: boolean;
  };
}

/**
 * Полные настройки приложения
 */
export interface AppSettings {
  wbApi: WbApiSettings;
  ai: AiSettings;
  bot: BotSettings;
  updatedAt: string;  // ISO строка для JSON
}

/**
 * Статус бота
 */
export interface BotStatus {
  isRunning: boolean;
  lastPollAt?: Date;
  lastError?: string;
  reviewsProcessed: number;
  answersSent: number;
  errorsCount: number;
  startedAt?: Date;
}

/**
 * Лог работы бота
 */
export interface BotLogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  reviewId?: string;
  scenarioId?: string;
  details?: Record<string, unknown>;
}

/**
 * Статистика работы бота
 */
export interface BotStats {
  // За сегодня
  today: {
    newReviews: number;
    answered: number;
    errors: number;
  };
  
  // За неделю
  week: {
    newReviews: number;
    answered: number;
    errors: number;
  };
  
  // За всё время
  total: {
    reviewsProcessed: number;
    answersSent: number;
    errors: number;
  };
  
  // Последняя активность
  lastActivityAt?: Date;
}

/**
 * Экспорт типов по умолчанию
 */
export interface ExportData {
  version: string;
  exportedAt: Date;
  scenarios: unknown[];
  knowledgeBase: unknown[];
  settings: Partial<AppSettings>;
}
