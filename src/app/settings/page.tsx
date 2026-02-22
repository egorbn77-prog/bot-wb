// ============================================
// Страница: Настройки
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Switch, Select } from '@/components/ui/Input';
import { getAvailableProviders, type AiProviderType } from '@/lib/ai/config';
import type { AppSettings } from '@/types/settings';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Загрузка настроек
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings(data.settings);
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Сохранение настроек
  const handleSave = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Настройки сохранены' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Ошибка сохранения' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка сохранения настроек' });
    } finally {
      setIsSaving(false);
    }
  };

  // Обновление поля настроек
  const updateSetting = (
    section: 'wbApi' | 'ai' | 'bot',
    field: string,
    value: unknown
  ) => {
    if (!settings) return;
    
    const sectionData = settings[section];
    if (typeof sectionData === 'object' && sectionData !== null) {
      setSettings({
        ...settings,
        [section]: {
          ...sectionData,
          [field]: value,
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Ошибка загрузки настроек</p>
      </div>
    );
  }

  const providers = getAvailableProviders();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Настройки
        </h1>
        <p className="text-gray-500 mt-1">
          Конфигурация бота и подключений
        </p>
      </div>

      {/* Сообщение */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* API Wildberries */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>API Wildberries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="API ключ"
            type="password"
            placeholder="Введите API ключ от личного кабинета"
            value={settings.wbApi.apiKey}
            onChange={(e) => updateSetting('wbApi', 'apiKey', e.target.value)}
          />
          
          <Input
            label="Базовый URL API"
            placeholder="https://feedbacks-api.wb.ru/api/v1"
            value={settings.wbApi.baseUrl}
            onChange={(e) => updateSetting('wbApi', 'baseUrl', e.target.value)}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Интервал опроса (минуты)"
              type="number"
              min={1}
              max={60}
              value={settings.wbApi.pollIntervalMinutes}
              onChange={(e) => updateSetting('wbApi', 'pollIntervalMinutes', parseInt(e.target.value) || 5)}
            />
            
            <Input
              label="Лимит запросов в минуту"
              type="number"
              min={1}
              max={100}
              value={settings.wbApi.rateLimitPerMinute}
              onChange={(e) => updateSetting('wbApi', 'rateLimitPerMinute', parseInt(e.target.value) || 30)}
            />
          </div>
          
          <Switch
            label="Включить бота"
            checked={settings.wbApi.isEnabled}
            onChange={(checked) => updateSetting('wbApi', 'isEnabled', checked)}
          />
        </CardContent>
      </Card>

      {/* AI генерация */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>AI генерация ответов</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Switch
            label="Включить AI генерацию"
            checked={settings.ai.isEnabled}
            onChange={(checked) => updateSetting('ai', 'isEnabled', checked)}
          />
          
          {settings.ai.isEnabled && (
            <>
              <Select
                label="Провайдер AI"
                value={settings.ai.provider}
                onChange={(e) => updateSetting('ai', 'provider', e.target.value)}
                options={[
                  { value: 'none', label: 'Не использовать' },
                  ...providers.map(p => ({ value: p.id, label: p.name })),
                ]}
              />
              
              {settings.ai.provider !== 'none' && (
                <>
                  <Input
                    label="API ключ"
                    type="password"
                    placeholder="Введите API ключ"
                    value={settings.ai.apiKey}
                    onChange={(e) => updateSetting('ai', 'apiKey', e.target.value)}
                  />
                  
                  {settings.ai.provider === 'custom' && (
                    <Input
                      label="Базовый URL API"
                      placeholder="http://localhost:11434/v1/chat/completions"
                      value={settings.ai.baseUrl || ''}
                      onChange={(e) => updateSetting('ai', 'baseUrl', e.target.value)}
                    />
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Модель"
                      value={settings.ai.model}
                      onChange={(e) => updateSetting('ai', 'model', e.target.value)}
                      options={
                        providers
                          .find(p => p.id === settings.ai.provider)
                          ?.models.map(m => ({ value: m, label: m }))
                          || [{ value: '', label: 'Введите модель вручную' }]
                      }
                    />
                    
                    {settings.ai.provider === 'custom' && (
                      <Input
                        label="Название модели"
                        value={settings.ai.model}
                        onChange={(e) => updateSetting('ai', 'model', e.target.value)}
                        placeholder="local-model"
                      />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Макс. токенов"
                      type="number"
                      min={100}
                      max={4000}
                      value={settings.ai.maxTokens}
                      onChange={(e) => updateSetting('ai', 'maxTokens', parseInt(e.target.value) || 500)}
                    />
                    
                    <Input
                      label="Температура"
                      type="number"
                      min={0}
                      max={2}
                      step={0.1}
                      value={settings.ai.temperature}
                      onChange={(e) => updateSetting('ai', 'temperature', parseFloat(e.target.value) || 0.7)}
                    />
                  </div>
                  
                  <Switch
                    label="Использовать AI как fallback (когда нет подходящего сценария)"
                    checked={settings.ai.useAsFallback}
                    onChange={(checked) => updateSetting('ai', 'useAsFallback', checked)}
                  />
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Настройки бота */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Поведение бота</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            label="Режим работы"
            value={settings.bot.mode}
            onChange={(e) => updateSetting('bot', 'mode', e.target.value)}
            options={[
              { value: 'auto', label: 'Автоматический (отправлять без подтверждения)' },
              { value: 'manual', label: 'Ручной (требуется подтверждение каждого ответа)' },
              { value: 'hybrid', label: 'Гибридный (подтверждение только для AI ответов)' },
            ]}
          />
          
          <Switch
            label="Автоматически отправлять ответы"
            checked={settings.bot.autoSend}
            onChange={(checked) => updateSetting('bot', 'autoSend', checked)}
          />
          
          <Switch
            label="Требовать подтверждение перед отправкой"
            checked={settings.bot.requireConfirmation}
            onChange={(checked) => updateSetting('bot', 'requireConfirmation', checked)}
          />
          
          <Switch
            label="Сохранять историю ответов"
            checked={settings.bot.keepHistory}
            onChange={(checked) => updateSetting('bot', 'keepHistory', checked)}
          />
          
          {settings.bot.keepHistory && (
            <Input
              label="Срок хранения истории (дней)"
              type="number"
              min={1}
              max={365}
              value={settings.bot.historyRetentionDays}
              onChange={(e) => updateSetting('bot', 'historyRetentionDays', parseInt(e.target.value) || 30)}
            />
          )}
        </CardContent>
      </Card>

      {/* Уведомления */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Уведомления</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Email для уведомлений"
            type="email"
            placeholder="email@example.com"
            value={settings.bot.notifications.email || ''}
            onChange={(e) => updateSetting('bot', 'notifications', {
              ...settings.bot.notifications,
              email: e.target.value,
            })}
          />
          
          <Input
            label="Telegram (username или chat_id)"
            placeholder="@username или 123456789"
            value={settings.bot.notifications.telegram || ''}
            onChange={(e) => updateSetting('bot', 'notifications', {
              ...settings.bot.notifications,
              telegram: e.target.value,
            })}
          />
          
          <div className="space-y-2">
            <Switch
              label="Уведомлять о новых отзывах"
              checked={settings.bot.notifications.onNewReview}
              onChange={(checked) => updateSetting('bot', 'notifications', {
                ...settings.bot.notifications,
                onNewReview: checked,
              })}
            />
            
            <Switch
              label="Уведомлять об ошибках"
              checked={settings.bot.notifications.onError}
              onChange={(checked) => updateSetting('bot', 'notifications', {
                ...settings.bot.notifications,
                onError: checked,
              })}
            />
            
            <Switch
              label="Уведомлять об отправленных ответах"
              checked={settings.bot.notifications.onAnswerSent}
              onChange={(checked) => updateSetting('bot', 'notifications', {
                ...settings.bot.notifications,
                onAnswerSent: checked,
              })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Кнопка сохранения */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          isLoading={isSaving}
        >
          Сохранить настройки
        </Button>
      </div>
    </div>
  );
}
