// ============================================
// Главная страница: Дашборд
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { BotStatus, BotStats } from '@/types/settings';

export default function DashboardPage() {
  const [status, setStatus] = useState<BotStatus | null>(null);
  const [stats, setStats] = useState<BotStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Загрузка статуса
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/bot/status');
      const data = await response.json();
      setStatus(data.status);
      setStats(data.stats);
    } catch (error) {
      console.error('Ошибка загрузки статуса:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    
    // Обновляем статус каждые 30 секунд
    const interval = setInterval(fetchStatus, 30000);
    
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Запуск бота
  const handleStart = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/bot/start', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        await fetchStatus();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Ошибка запуска:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Остановка бота
  const handleStop = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/bot/stop', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        await fetchStatus();
      }
    } catch (error) {
      console.error('Ошибка остановки:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Дашборд
        </h1>
        <p className="text-gray-500 mt-1">
          Управление ботом для ответов на отзывы
        </p>
      </div>

      {/* Статус бота */}
      <Card variant="bordered">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                status?.isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}
            />
            <div>
              <p className="font-medium text-gray-900">
                {status?.isRunning ? 'Бот работает' : 'Бот остановлен'}
              </p>
              <p className="text-sm text-gray-500">
                {status?.lastPollAt
                  ? `Последний опрос: ${new Date(status.lastPollAt).toLocaleString('ru-RU')}`
                  : 'Опросов ещё не было'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            {status?.isRunning ? (
              <Button
                variant="danger"
                onClick={handleStop}
                isLoading={actionLoading}
                className="flex-1 sm:flex-initial"
              >
                Остановить
              </Button>
            ) : (
              <Button
                variant="success"
                onClick={handleStart}
                isLoading={actionLoading}
                className="flex-1 sm:flex-initial"
              >
                Запустить
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="bordered">
          <CardContent className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">
              {stats?.today.newReviews || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">Новых отзывов</p>
          </CardContent>
        </Card>
        
        <Card variant="bordered">
          <CardContent className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-green-600">
              {stats?.today.answered || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">Ответов отправлено</p>
          </CardContent>
        </Card>
        
        <Card variant="bordered">
          <CardContent className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
              {status?.reviewsProcessed || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">Обработано</p>
          </CardContent>
        </Card>
        
        <Card variant="bordered">
          <CardContent className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-red-600">
              {stats?.today.errors || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">Ошибок</p>
          </CardContent>
        </Card>
      </div>

      {/* Быстрые действия */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button
              variant="secondary"
              className="justify-start"
              onClick={() => window.location.href = '/reviews'}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Просмотреть отзывы
            </Button>
            
            <Button
              variant="secondary"
              className="justify-start"
              onClick={() => window.location.href = '/scenarios'}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Редактировать сценарии
            </Button>
            
            <Button
              variant="secondary"
              className="justify-start"
              onClick={() => window.location.href = '/knowledge-base'}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              База знаний
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Информация */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">Время работы</span>
            <span className="font-medium">
              {status?.startedAt
                ? formatUptime(new Date(status.startedAt))
                : '—'}
            </span>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">Всего обработано</span>
            <Badge variant="info">{status?.reviewsProcessed || 0}</Badge>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">Всего отправлено</span>
            <Badge variant="success">{status?.answersSent || 0}</Badge>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Ошибок</span>
            <Badge variant={status?.errorsCount ? 'danger' : 'default'}>
              {status?.errorsCount || 0}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Форматирование времени работы
function formatUptime(startDate: Date): string {
  const now = new Date();
  const diff = now.getTime() - startDate.getTime();
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours} ч ${minutes} мин`;
  }
  return `${minutes} мин`;
}
