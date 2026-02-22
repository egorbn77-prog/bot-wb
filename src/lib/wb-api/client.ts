// ============================================
// БЛОК 6: Клиент API Wildberries
// ============================================

import type { 
  WbReview, 
  GetReviewsParams, 
  SendAnswerResult,
  WbReviewsResponse 
} from '@/types/review';
import { getSettings, isWbApiConfigured } from '@/lib/data/json-storage';

// ============================================
// Константы API
// ============================================

// Базовый URL API Wildberries для отзывов
const WB_API_BASE_URL = 'https://feedbacks-api.wb.ru/api/v1';

// Эндпоинты API
const ENDPOINTS = {
  getReviews: '/supplier-feedbacks',
  sendAnswer: '/supplier-feedbacks/answer',
} as const;

// ============================================
// Ошибки API
// ============================================

export class WbApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'WbApiError';
  }
}

// ============================================
// Клиент API
// ============================================

interface WbApiClientConfig {
  apiKey: string;
  baseUrl: string;
  timeout?: number;
}

/**
 * Класс для работы с API Wildberries
 */
export class WbApiClient {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: WbApiClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout || 30000;
  }

  /**
   * Создаёт клиент из настроек приложения
   */
  static fromSettings(): WbApiClient | null {
    if (!isWbApiConfigured()) {
      return null;
    }
    
    const settings = getSettings();
    return new WbApiClient({
      apiKey: settings.wbApi.apiKey,
      baseUrl: settings.wbApi.baseUrl || WB_API_BASE_URL,
    });
  }

  /**
   * Выполняет запрос к API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new WbApiError(
          errorText || `HTTP Error: ${response.status}`,
          response.status
        );
      }

      return await response.json() as T;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof WbApiError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new WbApiError('Превышено время ожидания запроса', 408);
        }
        throw new WbApiError(error.message, 0);
      }
      
      throw new WbApiError('Неизвестная ошибка', 0);
    }
  }

  /**
   * Получает список отзывов
   */
  async getReviews(params: GetReviewsParams = {}): Promise<WbReviewsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) {
      searchParams.set('page', params.page.toString());
    }
    if (params.limit) {
      searchParams.set('limit', params.limit.toString());
    }
    if (params.isAnswered !== undefined) {
      searchParams.set('isAnswered', params.isAnswered.toString());
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString 
      ? `${ENDPOINTS.getReviews}?${queryString}`
      : ENDPOINTS.getReviews;
    
    return this.request<WbReviewsResponse>(endpoint);
  }

  /**
   * Отправляет ответ на отзыв
   */
  async sendAnswer(reviewId: string, answer: string): Promise<SendAnswerResult> {
    const response = await this.request<{ success: boolean; error?: string }>(
      ENDPOINTS.sendAnswer,
      {
        method: 'POST',
        body: JSON.stringify({
          id: reviewId,
          text: answer,
        }),
      }
    );

    return {
      success: response.success,
      reviewId,
      error: response.error,
    };
  }

  /**
   * Проверяет подключение к API
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.getReviews({ limit: 1 });
      return { success: true };
    } catch (error) {
      if (error instanceof WbApiError) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Не удалось подключиться к API' };
    }
  }
}

// ============================================
// Заглушка для тестирования (без реального API)
// ============================================

/**
 * Мок-клиент для тестирования без реального API
 */
export class WbApiMockClient {
  private mockReviews: WbReview[] = [];

  constructor() {
    // Генерируем тестовые отзывы
    this.mockReviews = this.generateMockReviews();
  }

  /**
   * Генерирует тестовые отзывы
   */
  private generateMockReviews(): WbReview[] {
    return [
      {
        id: 'mock-001',
        productId: 12345,
        productName: 'Футболка мужская хлопок',
        productArticle: 'ART-001',
        rating: 5,
        text: 'Отличная футболка! Качество супер, размер подошёл идеально. Буду заказывать ещё!',
        userName: 'Алексей',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-002',
        productId: 12346,
        productName: 'Джинсы женские классические',
        productArticle: 'ART-002',
        rating: 3,
        text: 'Джинсы неплохие, но доставка была долгой - ждала почти 2 недели. Качество ткани нормальное.',
        pros: 'Хорошее качество ткани',
        cons: 'Долгая доставка',
        userName: 'Мария',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-003',
        productId: 12347,
        productName: 'Кроссовки спортивные',
        productArticle: 'ART-003',
        rating: 2,
        text: 'К сожалению, товар оказался бракованным - подошва отклеилась через неделю. Как оформить возврат?',
        cons: 'Брак - отклеилась подошва',
        userName: 'Иван',
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-004',
        productId: 12348,
        productName: 'Платье летнее',
        productArticle: 'ART-004',
        rating: 4,
        text: 'Платье красивое, но цвет немного отличается от фото на сайте. В жизни более тёмный.',
        pros: 'Красивый фасон',
        cons: 'Цвет отличается от фото',
        userName: 'Елена',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-005',
        productId: 12349,
        productName: 'Рубашка мужская',
        productArticle: 'ART-005',
        rating: 5,
        text: '',
        userName: 'Дмитрий',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-006',
        productId: 12350,
        productName: 'Куртка зимняя',
        productArticle: 'ART-006',
        rating: 1,
        text: 'Полный брак! Молния сломалась при первой примерке. Требую возврат денег или замену!',
        cons: 'Сломанная молния, плохое качество',
        userName: 'Сергей',
        createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-007',
        productId: 12351,
        productName: 'Шорты мужские',
        productArticle: 'ART-007',
        rating: 4,
        text: 'Хорошие шорты, размер соответствует. Есть ли гарантия на этот товар?',
        pros: 'Размер соответствует',
        userName: 'Андрей',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-008',
        productId: 12352,
        productName: 'Свитер женский',
        productArticle: 'ART-008',
        rating: 3,
        text: 'Размер маловат, нужно было брать на размер больше. Как можно обменять?',
        cons: 'Маломерит',
        userName: 'Ольга',
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      },
    ];
  }

  /**
   * Получает список отзывов (имитация)
   */
  async getReviews(params: GetReviewsParams = {}): Promise<WbReviewsResponse> {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 500));

    let reviews = [...this.mockReviews];

    // Фильтрация по ответу
    if (params.isAnswered !== undefined) {
      reviews = reviews.filter(r => 
        params.isAnswered ? r.answer : !r.answer
      );
    }

    // Фильтрация по оценке
    if (params.rating && params.rating.length > 0) {
      reviews = reviews.filter(r => params.rating!.includes(r.rating));
    }

    // Пагинация
    const limit = params.limit || 20;
    const page = params.page || 1;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      reviews: reviews.slice(start, end),
      count: reviews.length,
      hasMore: end < reviews.length,
    };
  }

  /**
   * Отправляет ответ на отзыв (имитация)
   */
  async sendAnswer(reviewId: string, answer: string): Promise<SendAnswerResult> {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 800));

    const review = this.mockReviews.find(r => r.id === reviewId);
    
    if (!review) {
      return {
        success: false,
        reviewId,
        error: 'Отзыв не найден',
      };
    }

    // Имитация сохранения ответа
    review.answer = {
      text: answer,
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      reviewId,
      answer,
    };
  }

  /**
   * Проверяет подключение (имитация)
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  }
}

// ============================================
// Фабрика клиентов
// ============================================

/**
 * Создаёт подходящий клиент API
 * Если API ключ не настроен, возвращает мок-клиент для тестирования
 */
export function createWbApiClient(): WbApiClient | WbApiMockClient {
  if (isWbApiConfigured()) {
    const client = WbApiClient.fromSettings();
    if (client) return client;
  }
  
  // Возвращаем мок-клиент для тестирования
  return new WbApiMockClient();
}