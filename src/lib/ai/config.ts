// ============================================
// Конфигурация AI провайдеров (клиентский код)
// ============================================

// Доступные провайдеры
export const AI_PROVIDERS = {
  openai: {
    name: 'OpenAI',
    models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini'],
    defaultModel: 'gpt-3.5-turbo',
  },
  anthropic: {
    name: 'Anthropic (Claude)',
    models: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229', 'claude-3-5-sonnet-20241022'],
    defaultModel: 'claude-3-haiku-20240307',
  },
  google: {
    name: 'Google Gemini',
    models: ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    defaultModel: 'gemini-pro',
  },
  yandex: {
    name: 'YandexGPT',
    models: ['yandexgpt-lite', 'yandexgpt', 'summarization'],
    defaultModel: 'yandexgpt-lite',
  },
  deepseek: {
    name: 'DeepSeek',
    models: ['deepseek-chat', 'deepseek-coder'],
    defaultModel: 'deepseek-chat',
  },
  openrouter: {
    name: 'OpenRouter (мульти-провайдер)',
    models: [
      'openai/gpt-3.5-turbo',
      'openai/gpt-4',
      'anthropic/claude-3-haiku',
      'anthropic/claude-3-sonnet',
      'google/gemini-pro',
      'meta-llama/llama-3-70b-instruct',
      'deepseek/deepseek-chat',
    ],
    defaultModel: 'openai/gpt-3.5-turbo',
  },
  custom: {
    name: 'Свой API (OpenAI-совместимый)',
    models: [],
    defaultModel: '',
  },
} as const;

export type AiProviderType = keyof typeof AI_PROVIDERS;

// Функция для получения списка провайдеров (клиентская)
export function getAvailableProviders() {
  return Object.entries(AI_PROVIDERS).map(([key, value]) => ({
    id: key,
    name: value.name,
    models: value.models,
    defaultModel: value.defaultModel,
  }));
}
