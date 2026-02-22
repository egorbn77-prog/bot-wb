// ============================================
// БЛОК 3: Типы данных базы знаний
// ============================================

/**
 * Категория базы знаний
 */
export interface KnowledgeCategory {
  id: string;
  name: string;
  description: string;
  color?: string;         // Цвет для отображения в UI
  order: number;          // Порядок сортировки
}

/**
 * Запись базы знаний
 */
export interface KnowledgeItem {
  // Уникальный идентификатор
  id: string;
  
  // Категория
  categoryId: string;
  
  // Краткое название/вопрос
  title: string;
  
  // Полный текст/ответ
  content: string;
  
  // Ключевые слова для поиска
  keywords: string[];
  
  // Теги для фильтрации
  tags: string[];
  
  // Связанные товары (артикулы)
  relatedProducts?: string[];
  
  // Приоритет при поиске
  priority: number;
  
  // Активна ли запись
  isActive: boolean;
  
  // Даты (строки для JSON-совместимости)
  createdAt: string;
  updatedAt: string;
}

/**
 * База знаний целиком
 */
export interface KnowledgeBase {
  version: string;
  updatedAt: string;  // ISO строка для JSON
  categories: KnowledgeCategory[];
  items: KnowledgeItem[];
}

/**
 * Результат поиска по базе знаний
 */
export interface KnowledgeSearchResult {
  item: KnowledgeItem;
  score: number;          // Релевантность (0-1)
  matchedKeywords: string[];
}

/**
 * Данные для создания/редактирования записи
 */
export interface KnowledgeItemInput {
  categoryId: string;
  title: string;
  content: string;
  keywords: string[];
  tags: string[];
  relatedProducts?: string[];
  priority: number;
  isActive: boolean;
}
