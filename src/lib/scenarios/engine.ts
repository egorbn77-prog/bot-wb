// ============================================
// БЛОК 7: Движок сценариев ответов
// ============================================

import type { Review } from '@/types/review';
import type { Scenario, ScenarioMatchResult, ScenarioCondition } from '@/types/scenario';
import { getActiveScenarios } from '@/lib/data/json-storage';
import { searchKnowledge } from '@/lib/knowledge-base/searcher';

// ============================================
// Сопоставление условий
// ============================================

/**
 * Проверяет, соответствует ли отзыв условиям сценария
 */
function matchesCondition(review: Review, condition: ScenarioCondition): {
  matches: boolean;
  matchedKeywords: string[];
} {
  const matchedKeywords: string[] = [];
  
  // Проверка по оценке
  if (condition.ratingFilter && condition.ratingFilter.length > 0) {
    if (!condition.ratingFilter.includes(review.rating)) {
      return { matches: false, matchedKeywords: [] };
    }
  }
  
  // Проверка наличия текста
  if (condition.hasText !== undefined) {
    const hasText = review.text.trim().length > 0;
    if (condition.hasText !== hasText) {
      return { matches: false, matchedKeywords: [] };
    }
  }
  
  // Проверка ключевых слов
  if (condition.keywords && condition.keywords.length > 0) {
    const reviewText = `${review.text} ${review.pros || ''} ${review.cons || ''}`.toLowerCase();
    
    const foundKeywords = condition.keywords.filter(keyword => 
      reviewText.includes(keyword.toLowerCase())
    );
    
    // Проверка режима поиска
    switch (condition.keywordMode) {
      case 'all':
        // Все ключевые слова должны быть найдены
        if (foundKeywords.length !== condition.keywords.length) {
          return { matches: false, matchedKeywords: [] };
        }
        break;
      
      case 'exact':
        // Точное совпадение фразы
        const exactMatch = condition.keywords.some(keyword => 
          reviewText.includes(keyword.toLowerCase())
        );
        if (!exactMatch) {
          return { matches: false, matchedKeywords: [] };
        }
        break;
      
      case 'any':
      default:
        // Хотя бы одно ключевое слово
        if (foundKeywords.length === 0) {
          return { matches: false, matchedKeywords: [] };
        }
        break;
    }
    
    matchedKeywords.push(...foundKeywords);
  }
  
  // Проверка исключающих ключевых слов
  if (condition.excludeKeywords && condition.excludeKeywords.length > 0) {
    const reviewText = `${review.text} ${review.pros || ''} ${review.cons || ''}`.toLowerCase();
    const hasExcluded = condition.excludeKeywords.some(keyword => 
      reviewText.includes(keyword.toLowerCase())
    );
    
    if (hasExcluded) {
      return { matches: false, matchedKeywords: [] };
    }
  }
  
  // Проверка артикулов товаров
  if (condition.productArticles && condition.productArticles.length > 0) {
    if (!review.productArticle || !condition.productArticles.includes(review.productArticle)) {
      return { matches: false, matchedKeywords: [] };
    }
  }
  
  return { matches: true, matchedKeywords };
}

/**
 * Вычисляет оценку релевантности сценария для отзыва
 */
function calculateScore(review: Review, scenario: Scenario, matchedKeywords: string[]): number {
  let score = 0.5; // Базовая оценка
  
  // Бонус за количество совпавших ключевых слов
  if (scenario.conditions.keywords && scenario.conditions.keywords.length > 0) {
    const keywordRatio = matchedKeywords.length / scenario.conditions.keywords.length;
    score += keywordRatio * 0.3;
  }
  
  // Бонус за точное совпадение оценки
  if (scenario.conditions.ratingFilter && scenario.conditions.ratingFilter.includes(review.rating)) {
    score += 0.1;
  }
  
  // Бонус за приоритет (меньший приоритет = выше в списке)
  score += (100 - scenario.priority) / 1000;
  
  // Нормализация
  return Math.min(1, Math.max(0, score));
}

// ============================================
// Подстановка переменных
// ============================================

/**
 * Извлекает переменные из шаблона
 */
export function extractVariables(template: string): string[] {
  const regex = /\{(\w+)\}/g;
  const variables: string[] = [];
  let match;
  
  while ((match = regex.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  
  return variables;
}

/**
 * Подставляет значения переменных в шаблон
 */
export function substituteVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  
  return result;
}

/**
 * Генерирует переменные для отзыва
 */
function generateVariables(review: Review): Record<string, string> {
  return {
    productName: review.productName,
    productArticle: review.productArticle || '',
    authorName: review.author,
    rating: review.rating.toString(),
    date: new Date().toLocaleDateString('ru-RU'),
    reviewText: review.text,
  };
}

// ============================================
// Основные функции движка
// ============================================

/**
 * Находит подходящий сценарий для отзыва
 */
export function findMatchingScenario(review: Review): ScenarioMatchResult | null {
  const scenarios = getActiveScenarios();
  
  let bestMatch: ScenarioMatchResult | null = null;
  
  for (const scenario of scenarios) {
    const { matches, matchedKeywords } = matchesCondition(review, scenario.conditions);
    
    if (matches) {
      const score = calculateScore(review, scenario, matchedKeywords);
      
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = {
          scenario,
          score,
          matchedKeywords,
          variables: generateVariables(review),
        };
      }
    }
  }
  
  return bestMatch;
}

/**
 * Генерирует ответ на отзыв по сценарию
 */
export function generateAnswer(
  review: Review,
  matchResult: ScenarioMatchResult
): string {
  const { scenario, variables } = matchResult;
  
  // Подставляем переменные в шаблон
  let answer = substituteVariables(scenario.template.text, variables);
  
  // Обрезаем до максимальной длины
  const maxLength = scenario.template.maxLength || 500;
  if (answer.length > maxLength) {
    answer = answer.substring(0, maxLength - 3) + '...';
  }
  
  return answer;
}

/**
 * Обрабатывает отзыв и возвращает ответ
 */
export function processReview(review: Review): {
  answer: string | null;
  scenario: Scenario | null;
  isAiGenerated: boolean;
  confidence: number;
} {
  // Ищем подходящий сценарий
  const match = findMatchingScenario(review);
  
  if (match) {
    const answer = generateAnswer(review, match);
    
    return {
      answer,
      scenario: match.scenario,
      isAiGenerated: false,
      confidence: match.score,
    };
  }
  
  // Если сценарий не найден, возвращаем null
  // (AI генерация будет вызвана отдельно, если включена)
  return {
    answer: null,
    scenario: null,
    isAiGenerated: false,
    confidence: 0,
  };
}

/**
 * Получает дополнительную информацию из базы знаний
 */
export function getAdditionalInfo(review: Review): string {
  const searchResults = searchKnowledge(review.text, 3);
  
  if (searchResults.length === 0) {
    return '';
  }
  
  // Объединяем релевантную информацию
  return searchResults
    .map(r => r.item.content)
    .join('\n\n');
}

/**
 * Проверяет, нужен ли AI для данного отзыва
 */
export function needsAiGeneration(review: Review): boolean {
  const match = findMatchingScenario(review);
  
  if (!match) {
    return true; // Нет подходящего сценария
  }
  
  if (match.scenario.useAi) {
    return true; // Сценарий требует AI
  }
  
  return false;
}