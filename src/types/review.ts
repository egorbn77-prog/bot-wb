// ============================================
// БЛОК 1: Типы данных отзывов Wildberries
// ============================================

/**
 * Статус обработки отзыва
 */
export type ReviewStatus = 'new' | 'processing' | 'answered' | 'error' | 'pending';

/**
 * Отзыв из Wildberries
 */
export interface Review {
  // Уникальный идентификатор в нашей системе
  id: string;
  
  // ID отзыва в Wildberries
  wbId: string;
  
  // Информация о товаре
  productId: string;
  productName: string;
  productArticle?: string;
  
  // Содержимое отзыва
  rating: number;           // Оценка от 1 до 5
  text: string;             // Текст отзыва
  pros?: string;            // Достоинства
  cons?: string;            // Недостатки
  
  // Информация об авторе
  author: string;
  authorId?: string;
  
  // Даты
  createdAt: Date;          // Дата создания отзыва
  processedAt?: Date;       // Дата обработки
  
  // Статус обработки
  status: ReviewStatus;
  
  // Ответ на отзыв
  answer?: string;
  answeredAt?: Date;
  
  // Информация об ошибке
  error?: string;
  
  // ID применённого сценария
  scenarioId?: string;
  
  // Флаг: ответ сгенерирован AI
  isAiGenerated?: boolean;
}

/**
 * Ответ от API Wildberries со списком отзывов
 */
export interface WbReviewsResponse {
  reviews: WbReview[];
  count: number;
  hasMore: boolean;
}

/**
 * Сырой отзыв от API Wildberries
 */
export interface WbReview {
  id: string;
  productId: number;
  productName: string;
  productArticle: string;
  rating: number;
  text: string;
  pros?: string;
  cons?: string;
  userName: string;
  userId?: number;
  createdAt: string;
  answer?: {
    text: string;
    createdAt: string;
  };
}

/**
 * Параметры для получения отзывов
 */
export interface GetReviewsParams {
  page?: number;
  limit?: number;
  isAnswered?: boolean;
  rating?: number[];
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Результат отправки ответа
 */
export interface SendAnswerResult {
  success: boolean;
  reviewId: string;
  answer?: string;
  error?: string;
}
