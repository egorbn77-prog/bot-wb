// ============================================
// БЛОК 9: AI генерация ответов (серверный код)
// ============================================

import type { Review } from '@/types/review';
import type { Scenario } from '@/types/scenario';
import type { AiSettings } from '@/types/settings';
import { AI_PROVIDERS } from './config';

// ============================================
// Типы
// ============================================

interface AiGenerationResult {
  answer: string;
  tokensUsed?: number;
  model?: string;
}

interface AiProvider {
  generate(prompt: string): Promise<AiGenerationResult>;
}

// ============================================
// OpenAI провайдер
// ============================================

class OpenAiProvider implements AiProvider {
  private apiKey: string;
  private model: string;
  private maxTokens: number;
  private temperature: number;
  private baseUrl: string;

  constructor(apiKey: string, model: string, maxTokens: number, temperature: number, baseUrl?: string) {
    this.apiKey = apiKey;
    this.model = model;
    this.maxTokens = maxTokens;
    this.temperature = temperature;
    this.baseUrl = baseUrl || 'https://api.openai.com/v1/chat/completions';
  }

  async generate(prompt: string): Promise<AiGenerationResult> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: getSystemPrompt() },
          { role: 'user', content: prompt },
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API Error: ${error}`);
    }

    const data = await response.json();
    return {
      answer: data.choices[0]?.message?.content || '',
      tokensUsed: data.usage?.total_tokens,
      model: this.model,
    };
  }
}

// ============================================
// Anthropic (Claude) провайдер
// ============================================

class AnthropicProvider implements AiProvider {
  private apiKey: string;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(apiKey: string, model: string, maxTokens: number, temperature: number) {
    this.apiKey = apiKey;
    this.model = model;
    this.maxTokens = maxTokens;
    this.temperature = temperature;
  }

  async generate(prompt: string): Promise<AiGenerationResult> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: this.maxTokens,
        system: getSystemPrompt(),
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API Error: ${error}`);
    }

    const data = await response.json();
    return {
      answer: data.content[0]?.text || '',
      tokensUsed: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      model: this.model,
    };
  }
}

// ============================================
// Google Gemini провайдер
// ============================================

class GeminiProvider implements AiProvider {
  private apiKey: string;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(apiKey: string, model: string, maxTokens: number, temperature: number) {
    this.apiKey = apiKey;
    this.model = model;
    this.maxTokens = maxTokens;
    this.temperature = temperature;
  }

  async generate(prompt: string): Promise<AiGenerationResult> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: getSystemPrompt() + '\n\n' + prompt },
          ],
        }],
        generationConfig: {
          maxOutputTokens: this.maxTokens,
          temperature: this.temperature,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API Error: ${error}`);
    }

    const data = await response.json();
    return {
      answer: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      tokensUsed: data.usageMetadata?.totalTokenCount,
      model: this.model,
    };
  }
}

// ============================================
// YandexGPT провайдер
// ============================================

class YandexGptProvider implements AiProvider {
  private apiKey: string;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(apiKey: string, model: string, maxTokens: number, temperature: number) {
    this.apiKey = apiKey;
    this.model = model;
    this.maxTokens = maxTokens;
    this.temperature = temperature;
  }

  async generate(prompt: string): Promise<AiGenerationResult> {
    const response = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
      method: 'POST',
      headers: {
        'Authorization': `Api-Key ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        modelUri: `gpt://${this.model}`,
        completionOptions: {
          stream: false,
          temperature: this.temperature,
          maxTokens: this.maxTokens,
        },
        messages: [
          { role: 'system', text: getSystemPrompt() },
          { role: 'user', text: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`YandexGPT API Error: ${error}`);
    }

    const data = await response.json();
    return {
      answer: data.result?.alternatives?.[0]?.message?.text || '',
      tokensUsed: data.result?.usage?.totalTokens,
      model: this.model,
    };
  }
}

// ============================================
// DeepSeek провайдер
// ============================================

class DeepSeekProvider implements AiProvider {
  private apiKey: string;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(apiKey: string, model: string, maxTokens: number, temperature: number) {
    this.apiKey = apiKey;
    this.model = model;
    this.maxTokens = maxTokens;
    this.temperature = temperature;
  }

  async generate(prompt: string): Promise<AiGenerationResult> {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: getSystemPrompt() },
          { role: 'user', content: prompt },
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API Error: ${error}`);
    }

    const data = await response.json();
    return {
      answer: data.choices[0]?.message?.content || '',
      tokensUsed: data.usage?.total_tokens,
      model: this.model,
    };
  }
}

// ============================================
// OpenRouter провайдер
// ============================================

class OpenRouterProvider implements AiProvider {
  private apiKey: string;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(apiKey: string, model: string, maxTokens: number, temperature: number) {
    this.apiKey = apiKey;
    this.model = model;
    this.maxTokens = maxTokens;
    this.temperature = temperature;
  }

  async generate(prompt: string): Promise<AiGenerationResult> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://wb-bot.local',
        'X-Title': 'WB Bot',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: getSystemPrompt() },
          { role: 'user', content: prompt },
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API Error: ${error}`);
    }

    const data = await response.json();
    return {
      answer: data.choices[0]?.message?.content || '',
      tokensUsed: data.usage?.total_tokens,
      model: this.model,
    };
  }
}

// ============================================
// Заглушка для тестирования
// ============================================

class MockAiProvider implements AiProvider {
  async generate(prompt: string): Promise<AiGenerationResult> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      answer: 'Спасибо за ваш отзыв! Мы ценим ваше мнение. Если у вас есть вопросы, свяжитесь с нами, и мы обязательно поможем.',
      tokensUsed: 50,
      model: 'mock',
    };
  }
}

// ============================================
// Системный промпт
// ============================================

function getSystemPrompt(): string {
  return `Ты — вежливый и профессиональный помощник службы поддержки интернет-магазина Wildberries.

Твоя задача — писать ответы на отзывы покупателей.

Правила:
1. Отвечай вежливо и профессионально
2. Благодари за отзыв (даже негативный)
3. При проблемах предлагай решение (возврат, обмен, помощь)
4. Не используй сложные термины
5. Отвечай кратко, до 500 символов
6. Пиши на русском языке
7. Обращайся на "Вы"
8. Не обещай того, что не можешь выполнить
9. Если проблема серьёзная — предложи связаться с поддержкой

Формат ответа: только текст ответа, без дополнительных комментариев.`;
}

// ============================================
// Генерация промпта для отзыва
// ============================================

function buildPrompt(review: Review, scenario?: Scenario, context?: string): string {
  let prompt = `Напиши ответ на отзыв покупателя.

Информация об отзыве:
- Товар: ${review.productName}
- Артикул: ${review.productArticle || 'не указан'}
- Оценка: ${review.rating} из 5
- Автор: ${review.author}
- Текст отзыва: ${review.text || '(без текста)'}`;

  if (review.pros) {
    prompt += `\n- Достоинства: ${review.pros}`;
  }
  
  if (review.cons) {
    prompt += `\n- Недостатки: ${review.cons}`;
  }

  if (context) {
    prompt += `\n\nДополнительная информация:\n${context}`;
  }

  if (scenario?.aiPrompt) {
    prompt += `\n\nДополнительные инструкции: ${scenario.aiPrompt}`;
  }

  return prompt;
}

// ============================================
// Фабрика провайдеров
// ============================================

function createAiProvider(aiSettings: AiSettings): AiProvider {
  if (!aiSettings.apiKey || aiSettings.provider === 'none') {
    return new MockAiProvider();
  }
  
  const { provider, apiKey, model, maxTokens, temperature, baseUrl } = aiSettings;
  
  switch (provider) {
    case 'openai':
      return new OpenAiProvider(apiKey, model, maxTokens, temperature);
    
    case 'anthropic':
      return new AnthropicProvider(apiKey, model, maxTokens, temperature);
    
    case 'google':
      return new GeminiProvider(apiKey, model, maxTokens, temperature);
    
    case 'yandex':
      return new YandexGptProvider(apiKey, model, maxTokens, temperature);
    
    case 'deepseek':
      return new DeepSeekProvider(apiKey, model, maxTokens, temperature);
    
    case 'openrouter':
      return new OpenRouterProvider(apiKey, model, maxTokens, temperature);
    
    case 'custom':
      // Для кастомного API используем OpenAI-совместимый формат
      const customUrl = baseUrl || 'http://localhost:11434/v1/chat/completions';
      return new OpenAiProvider(apiKey, model || 'local-model', maxTokens, temperature, customUrl);
    
    default:
      return new MockAiProvider();
  }
}

// ============================================
// Основные функции
// ============================================

/**
 * Генерирует ответ на отзыв с помощью AI
 */
export async function generateAiAnswer(
  review: Review,
  aiSettings: AiSettings,
  scenario?: Scenario,
  context?: string
): Promise<AiGenerationResult> {
  const provider = createAiProvider(aiSettings);
  const prompt = buildPrompt(review, scenario, context);
  
  return provider.generate(prompt);
}

// Экспорт типов и констант
export { AI_PROVIDERS };
export type { AiGenerationResult };
