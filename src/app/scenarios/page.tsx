// ============================================
// Страница: Сценарии ответов
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Switch, Select } from '@/components/ui/Input';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import type { Scenario, ScenarioCondition, AnswerTemplate } from '@/types/scenario';

// Пустой шаблон для нового сценария
const emptyScenario = {
  name: '',
  description: '',
  priority: 50,
  isActive: true,
  conditions: {
    keywords: [],
    keywordMode: 'any' as const,
  },
  template: {
    text: '',
    variables: [],
  },
};

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Partial<Scenario> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

  // Загрузка сценариев
  const fetchScenarios = useCallback(async () => {
    try {
      const response = await fetch('/api/scenarios');
      const data = await response.json();
      setScenarios(data.scenarios || []);
    } catch (error) {
      console.error('Ошибка загрузки сценариев:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  // Создание/редактирование сценария
  const handleSave = async () => {
    if (!editingScenario) return;
    
    try {
      const method = editingScenario.id ? 'PUT' : 'POST';
      const response = await fetch('/api/scenarios', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingScenario),
      });
      
      if (response.ok) {
        await fetchScenarios();
        setIsEditModalOpen(false);
        setEditingScenario(null);
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  // Удаление сценария
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/scenarios?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchScenarios();
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  // Переключение активности
  const toggleActive = async (scenario: Scenario) => {
    try {
      await fetch('/api/scenarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: scenario.id, isActive: !scenario.isActive }),
      });
      await fetchScenarios();
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  // Открытие модального окна для создания
  const openCreateModal = () => {
    setEditingScenario({ ...emptyScenario });
    setIsEditModalOpen(true);
  };

  // Открытие модального окна для редактирования
  const openEditModal = (scenario: Scenario) => {
    setEditingScenario({ ...scenario });
    setIsEditModalOpen(true);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Сценарии ответов
          </h1>
          <p className="text-gray-500 mt-1">
            Настройка автоматических ответов на отзывы
          </p>
        </div>
        
        <Button onClick={openCreateModal}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Новый сценарий
        </Button>
      </div>

      {/* Список сценариев */}
      {scenarios.length === 0 ? (
        <Card variant="bordered">
          <CardContent className="text-center py-12">
            <p className="text-gray-500">Нет созданных сценариев</p>
            <Button variant="secondary" className="mt-4" onClick={openCreateModal}>
              Создать первый сценарий
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {scenarios
            .sort((a, b) => a.priority - b.priority)
            .map((scenario) => (
              <Card key={scenario.id} variant="bordered">
                <CardContent className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-gray-900">{scenario.name}</h3>
                        <Badge variant={scenario.isActive ? 'success' : 'default'}>
                          {scenario.isActive ? 'Активен' : 'Отключен'}
                        </Badge>
                        <Badge variant="info" size="sm">Приоритет: {scenario.priority}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{scenario.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        label=""
                        checked={scenario.isActive}
                        onChange={() => toggleActive(scenario)}
                      />
                      
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(scenario)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm({ isOpen: true, id: scenario.id })}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Ключевые слова */}
                  {scenario.conditions.keywords && scenario.conditions.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {scenario.conditions.keywords.map((keyword, i) => (
                        <Badge key={i} variant="default" size="sm">{keyword}</Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Шаблон */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">{scenario.template.text}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Модальное окно редактирования */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingScenario(null);
        }}
        title={editingScenario?.id ? 'Редактирование сценария' : 'Новый сценарий'}
        size="xl"
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingScenario(null);
              }}
            >
              Отмена
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Сохранить
            </Button>
          </div>
        }
      >
        {editingScenario && (
          <ScenarioForm
            scenario={editingScenario}
            onChange={(field, value) => {
              setEditingScenario({ ...editingScenario, [field]: value });
            }}
            onConditionChange={(field, value) => {
              setEditingScenario({
                ...editingScenario,
                conditions: { ...editingScenario.conditions, [field]: value } as ScenarioCondition,
              });
            }}
            onTemplateChange={(text) => {
              setEditingScenario({
                ...editingScenario,
                template: { ...editingScenario.template, text } as AnswerTemplate,
              });
            }}
          />
        )}
      </Modal>

      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '' })}
        onConfirm={() => handleDelete(deleteConfirm.id)}
        title="Удалить сценарий?"
        message="Это действие нельзя отменить."
        confirmText="Удалить"
        variant="danger"
      />
    </div>
  );
}

// Форма сценария
function ScenarioForm({
  scenario,
  onChange,
  onConditionChange,
  onTemplateChange,
}: {
  scenario: Partial<Scenario>;
  onChange: (field: string, value: unknown) => void;
  onConditionChange: (field: string, value: unknown) => void;
  onTemplateChange: (text: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Название"
          value={scenario.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Например: Ответ на негатив о доставке"
        />
        
        <Input
          label="Приоритет"
          type="number"
          min={1}
          max={100}
          value={scenario.priority || 50}
          onChange={(e) => onChange('priority', parseInt(e.target.value) || 50)}
        />
      </div>
      
      <Textarea
        label="Описание"
        value={scenario.description || ''}
        onChange={(e) => onChange('description', e.target.value)}
        placeholder="Краткое описание сценария"
        rows={2}
      />
      
      <Switch
        label="Активен"
        checked={scenario.isActive ?? true}
        onChange={(checked) => onChange('isActive', checked)}
      />
      
      <hr className="my-4" />
      
      <h4 className="font-medium text-gray-900">Условия срабатывания</h4>
      
      <Textarea
        label="Ключевые слова (по одному на строку)"
        value={(scenario.conditions?.keywords || []).join('\n')}
        onChange={(e) => onConditionChange('keywords', e.target.value.split('\n').filter(Boolean))}
        placeholder="доставка&#10;доставили&#10;привезли"
        rows={3}
      />
      
      <Select
        label="Режим поиска ключевых слов"
        value={scenario.conditions?.keywordMode || 'any'}
        onChange={(e) => onConditionChange('keywordMode', e.target.value)}
        options={[
          { value: 'any', label: 'Любое из слов' },
          { value: 'all', label: 'Все слова' },
          { value: 'exact', label: 'Точное совпадение' },
        ]}
      />
      
      <Textarea
        label="Исключающие ключевые слова"
        value={(scenario.conditions?.excludeKeywords || []).join('\n')}
        onChange={(e) => onConditionChange('excludeKeywords', e.target.value.split('\n').filter(Boolean))}
        placeholder="Слова, при которых сценарий НЕ сработает"
        rows={2}
      />
      
      <hr className="my-4" />
      
      <h4 className="font-medium text-gray-900">Шаблон ответа</h4>
      
      <Textarea
        label="Текст ответа"
        value={scenario.template?.text || ''}
        onChange={(e) => onTemplateChange(e.target.value)}
        placeholder="Здравствуйте! Спасибо за ваш отзыв..."
        rows={4}
        maxLength={500}
      />
      
      <p className="text-xs text-gray-500">
        Доступные переменные: {'{productName}'}, {'{authorName}'}, {'{date}'}
      </p>
      
      <Switch
        label="Использовать AI для улучшения ответа"
        checked={scenario.useAi || false}
        onChange={(checked) => onChange('useAi', checked)}
      />
    </div>
  );
}
