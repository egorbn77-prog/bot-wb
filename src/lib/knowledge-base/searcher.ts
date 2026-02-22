// ============================================
// БЛОК 8: Поиск по базе знаний
// ============================================

import type { KnowledgeItem, KnowledgeSearchResult } from '@/types/knowledge';
import { getKnowledgeItems } from '@/lib/data/json-storage';

// ============================================
// Утилиты для поиска
// ============================================

/**
 * Нормализует текст для поиска
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Разбивает текст на токены
 */
function tokenize(text: string): string[] {
  return normalizeText(text).split(' ').filter(t => t.length > 1);
}

/**
 * Вычисляет схожесть строк (коэффициент Жаккара)
 */
function jaccardSimilarity(set1: Set<string>, set2: Set<string>): number {
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

/**
 * Проверяет, содержится ли хотя бы один токен в тексте
 */
function containsAnyToken(text: string, tokens: string[]): boolean {
  const normalizedText = normalizeText(text);
  return tokens.some(token => normalizedText.includes(token));
}

// ============================================
// Основные функции поиска
// ============================================

/**
 * Ищет записи в базе знаний по запросу
 */
export function searchKnowledge(
  query: string,
  limit: number = 5
): KnowledgeSearchResult[] {
  const items = getKnowledgeItems();
  const queryTokens = new Set(tokenize(query));
  
  if (queryTokens.size === 0) {
    // Если запрос пустой, возвращаем записи с высоким приоритетом
    return items
      .slice(0, limit)
      .map(item => ({
        item,
        score: 0.5,
        matchedKeywords: [],
      }));
  }
  
  const results: KnowledgeSearchResult[] = [];
  
  for (const item of items) {
    // Объединяем все текстовые поля для поиска
    const searchableText = [
      item.title,
      item.content,
      ...item.keywords,
      ...item.tags,
    ].join(' ');
    
    const itemTokens = new Set(tokenize(searchableText));
    
    // Вычисляем схожесть
    const similarity = jaccardSimilarity(queryTokens, itemTokens);
    
    // Проверяем прямое вхождение ключевых слов
    const matchedKeywords: string[] = [];
    for (const keyword of item.keywords) {
      if (normalizeText(query).includes(normalizeText(keyword))) {
        matchedKeywords.push(keyword);
      }
    }
    
    // Вычисляем итоговую оценку
    let score = similarity;
    
    // Бонус за совпавшие ключевые слова
    if (matchedKeywords.length > 0) {
      score += 0.3 * (matchedKeywords.length / Math.max(item.keywords.length, 1));
    }
    
    // Бонус за приоритет
    score += item.priority / 1000;
    
    // Добавляем результат, если есть хоть какое-то совпадение
    if (score > 0.1 || matchedKeywords.length > 0) {
      results.push({
        item,
        score: Math.min(1, score),
        matchedKeywords,
      });
    }
  }
  
  // Сортируем по оценке и возвращаем топ результатов
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Ищет записи по категории
 */
export function searchByCategory(
  categoryId: string,
  limit: number = 10
): KnowledgeItem[] {
  return getKnowledgeItems(categoryId).slice(0, limit);
}

/**
 * Ищет записи по тегам
 */
export function searchByTags(tags: string[], limit: number = 10): KnowledgeItem[] {
  const items = getKnowledgeItems();
  
  return items
    .filter(item => item.tags.some(tag => tags.includes(tag)))
    .slice(0, limit);
}

/**
 * Ищет записи, связанные с конкретным товаром
 */
export function searchByProduct(productArticle: string): KnowledgeItem[] {
  const items = getKnowledgeItems();
  
  return items.filter(item => 
    item.relatedProducts?.includes(productArticle)
  );
}

/**
 * Получает контекст для генерации ответа
 */
export function getContextForReview(
  reviewText: string,
  productArticle?: string
): string {
  const results = searchKnowledge(reviewText, 3);
  
  let context = '';
  
  // Добавляем информацию из базы знаний
  if (results.length > 0) {
    context += 'Информация из базы знаний:\n';
    for (const result of results) {
      context += `- ${result.item.title}: ${result.item.content.substring(0, 200)}...\n`;
    }
  }
  
  // Добавляем информацию о товаре
  if (productArticle) {
    const productInfo = searchByProduct(productArticle);
    if (productInfo.length > 0) {
      context += '\nИнформация о товаре:\n';
      for (const info of productInfo) {
        context += `- ${info.content}\n`;
      }
    }
  }
  
  return context;
}

/**
 * Автодополнение для поиска
 */
export function autocompleteSearch(prefix: string, limit: number = 5): string[] {
  const items = getKnowledgeItems();
  const normalizedPrefix = normalizeText(prefix);
  
  const suggestions = new Set<string>();
  
  for (const item of items) {
    // Добавляем заголовки
    if (normalizeText(item.title).startsWith(normalizedPrefix)) {
      suggestions.add(item.title);
    }
    
    // Добавляем ключевые слова
    for (const keyword of item.keywords) {
      if (normalizeText(keyword).startsWith(normalizedPrefix)) {
        suggestions.add(keyword);
      }
    }
    
    // Добавляем теги
    for (const tag of item.tags) {
      if (normalizeText(tag).startsWith(normalizedPrefix)) {
        suggestions.add(tag);
      }
    }
  }
  
  return Array.from(suggestions).slice(0, limit);
}