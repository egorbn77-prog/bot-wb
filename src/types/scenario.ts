// ============================================
// БЛОК 2: Типы данных сценариев ответов
// ============================================

/**
 * Условие срабатывания сценария
 */
export interface ScenarioCondition {
  // Ключевые слова для поиска в тексте отзыва
  keywords: string[];
  
  // Режим поиска ключевых слов
  keywordMode: 'any' | 'all' | 'exact';
  
  // Фильтр по оценке (например, только негативные)
  ratingFilter?: number[];
  
  // Искать только в тексте отзыва
  hasText?: boolean;
  
  // Искать в достоинствах
  hasPros?: boolean;
  
  // Искать в недостатках
  hasCons?: boolean;
  
  // Конкретные товары (по артикулу)
  productArticles?: string[];
  
  // Исключающие ключевые слова
  excludeKeywords?: string[];
}

/**
 * Переменная для подстановки в шаблон
 */
export interface TemplateVariable {
  name: string;           // Имя переменной: {productName}
  description: string;    // Описание для пользователя
  defaultValue?: string;  // Значение по умолчанию
}

/**
 * Шаблон ответа
 */
export interface AnswerTemplate {
  // Текст шаблона с переменными {variableName}
  text: string;
  
  // Доступные переменные
  variables: TemplateVariable[];
  
  // Максимальная длина ответа (Wildberries имеет лимит)
  maxLength?: number;
}

/**
 * Сценарий ответа на отзыв
 */
export interface Scenario {
  // Уникальный идентификатор
  id: string;
  
  // Название сценария
  name: string;
  
  // Описание для пользователя
  description: string;
  
  // Приоритет (чем меньше число, тем выше приоритет)
  priority: number;
  
  // Активен ли сценарий
  isActive: boolean;
  
  // Условия срабатывания
  conditions: ScenarioCondition;
  
  // Шаблон ответа
  template: AnswerTemplate;
  
  // Использовать AI для генерации (если шаблон не подходит)
  useAi?: boolean;
  
  // Промпт для AI (если useAi = true)
  aiPrompt?: string;
  
  // Теги для организации
  tags?: string[];
  
  // Даты создания и обновления (строки для JSON-совместимости)
  createdAt: string;
  updatedAt: string;
}

/**
 * Результат сопоставления сценария
 */
export interface ScenarioMatchResult {
  scenario: Scenario;
  score: number;          // Оценка релевантности (0-1)
  matchedKeywords: string[];
  variables: Record<string, string>;
}

/**
 * Данные для создания/редактирования сценария
 */
export interface ScenarioInput {
  name: string;
  description: string;
  priority: number;
  isActive: boolean;
  conditions: ScenarioCondition;
  template: AnswerTemplate;
  useAi?: boolean;
  aiPrompt?: string;
  tags?: string[];
}

/**
 * Статистика использования сценария
 */
export interface ScenarioStats {
  scenarioId: string;
  totalUses: number;
  successfulAnswers: number;
  errors: number;
  lastUsedAt?: string;
}
