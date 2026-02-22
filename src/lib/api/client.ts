// ============================================
// Клиентский API для работы с данными
// ============================================

import type { AppSettings } from '@/types/settings';
import type { Scenario } from '@/types/scenario';
import type { KnowledgeBase, KnowledgeItem } from '@/types/knowledge';
import type { Review } from '@/types/review';

// ============================================
// API для настроек
// ============================================

export async function fetchSettings(): Promise<AppSettings> {
  const response = await fetch('/api/settings');
  if (!response.ok) throw new Error('Ошибка загрузки настроек');
  return response.json();
}

export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const response = await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!response.ok) throw new Error('Ошибка сохранения настроек');
  return response.json();
}

// ============================================
// API для сценариев
// ============================================

export async function fetchScenarios(): Promise<{ scenarios: Scenario[] }> {
  const response = await fetch('/api/scenarios');
  if (!response.ok) throw new Error('Ошибка загрузки сценариев');
  return response.json();
}

export async function createScenario(scenario: Partial<Scenario>): Promise<Scenario> {
  const response = await fetch('/api/scenarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scenario),
  });
  if (!response.ok) throw new Error('Ошибка создания сценария');
  return response.json();
}

export async function updateScenario(scenario: Partial<Scenario>): Promise<Scenario> {
  const response = await fetch('/api/scenarios', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scenario),
  });
  if (!response.ok) throw new Error('Ошибка обновления сценария');
  return response.json();
}

export async function deleteScenario(id: string): Promise<void> {
  const response = await fetch(`/api/scenarios?id=${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Ошибка удаления сценария');
}

// ============================================
// API для базы знаний
// ============================================

export async function fetchKnowledgeBase(): Promise<KnowledgeBase> {
  const response = await fetch('/api/knowledge-base');
  if (!response.ok) throw new Error('Ошибка загрузки базы знаний');
  return response.json();
}

export async function createKnowledgeItem(item: Partial<KnowledgeItem>): Promise<KnowledgeItem> {
  const response = await fetch('/api/knowledge-base', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!response.ok) throw new Error('Ошибка создания записи');
  return response.json();
}

export async function updateKnowledgeItem(item: Partial<KnowledgeItem>): Promise<KnowledgeItem> {
  const response = await fetch('/api/knowledge-base', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!response.ok) throw new Error('Ошибка обновления записи');
  return response.json();
}

export async function deleteKnowledgeItem(id: string): Promise<void> {
  const response = await fetch(`/api/knowledge-base?id=${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Ошибка удаления записи');
}

// ============================================
// API для отзывов
// ============================================

export async function fetchReviews(params?: { status?: string; limit?: number }): Promise<{ reviews: Review[] }> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  
  const response = await fetch(`/api/reviews?${searchParams.toString()}`);
  if (!response.ok) throw new Error('Ошибка загрузки отзывов');
  return response.json();
}

export async function updateReviewAnswer(reviewId: string, answer: string): Promise<Review> {
  const response = await fetch('/api/reviews', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reviewId, answer }),
  });
  if (!response.ok) throw new Error('Ошибка обновления ответа');
  return response.json();
}

// ============================================
// API для бота
// ============================================

export async function fetchBotStatus(): Promise<{
  isRunning: boolean;
  lastPollAt?: string;
  lastError?: string;
  reviewsProcessed: number;
  answersSent: number;
  errorsCount: number;
  startedAt?: string;
}> {
  const response = await fetch('/api/bot/status');
  if (!response.ok) throw new Error('Ошибка получения статуса бота');
  return response.json();
}

export async function startBot(): Promise<{ success: boolean; message: string }> {
  const response = await fetch('/api/bot/start', { method: 'POST' });
  if (!response.ok) throw new Error('Ошибка запуска бота');
  return response.json();
}

export async function stopBot(): Promise<{ success: boolean; message: string }> {
  const response = await fetch('/api/bot/stop', { method: 'POST' });
  if (!response.ok) throw new Error('Ошибка остановки бота');
  return response.json();
}
