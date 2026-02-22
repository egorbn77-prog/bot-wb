// ============================================
// Страница: База знаний
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import type { KnowledgeItem, KnowledgeCategory, KnowledgeBase } from '@/types/knowledge';

// Пустой шаблон для новой записи
const emptyItem: Partial<KnowledgeItem> = {
  categoryId: '',
  title: '',
  content: '',
  keywords: [],
  tags: [],
  priority: 50,
  isActive: true,
};

export default function KnowledgeBasePage() {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<KnowledgeItem> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });
  const [searchQuery, setSearchQuery] = useState('');

  // Загрузка базы знаний
  const fetchKnowledgeBase = useCallback(async () => {
    try {
      const response = await fetch('/api/knowledge-base');
      const data = await response.json();
      setKnowledgeBase(data);
    } catch (error) {
      console.error('Ошибка загрузки базы знаний:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKnowledgeBase();
  }, [fetchKnowledgeBase]);

  // Создание/редактирование записи
  const handleSave = async () => {
    if (!editingItem) return;
    
    try {
      const method = editingItem.id ? 'PUT' : 'POST';
      const response = await fetch('/api/knowledge-base', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });
      
      if (response.ok) {
        await fetchKnowledgeBase();
        setIsEditModalOpen(false);
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  // Удаление записи
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/knowledge-base?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchKnowledgeBase();
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  // Фильтрация записей
  const getFilteredItems = (): KnowledgeItem[] => {
    if (!knowledgeBase) return [];
    
    let items = knowledgeBase.items.filter(item => item.isActive);
    
    if (selectedCategory) {
      items = items.filter(item => item.categoryId === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        item.keywords.some(k => k.toLowerCase().includes(query))
      );
    }
    
    return items.sort((a, b) => b.priority - a.priority);
  };

  // Получение названия категории
  const getCategoryName = (categoryId: string): string => {
    return knowledgeBase?.categories.find(c => c.id === categoryId)?.name || 'Без категории';
  };

  // Получение цвета категории
  const getCategoryColor = (categoryId: string): string => {
    return knowledgeBase?.categories.find(c => c.id === categoryId)?.color || '#6B7280';
  };

  // Открытие модального окна для создания
  const openCreateModal = () => {
    setEditingItem({
      ...emptyItem,
      categoryId: selectedCategory || knowledgeBase?.categories[0]?.id || '',
    });
    setIsEditModalOpen(true);
  };

  // Открытие модального окна для редактирования
  const openEditModal = (item: KnowledgeItem) => {
    setEditingItem({ ...item });
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!knowledgeBase) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Ошибка загрузки базы знаний</p>
      </div>
    );
  }

  const filteredItems = getFilteredItems();

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            База знаний
          </h1>
          <p className="text-gray-500 mt-1">
            Информация о компании, товарах и условиях работы
          </p>
        </div>
        
        <Button onClick={openCreateModal}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Новая запись
        </Button>
      </div>

      {/* Поиск и фильтры */}
      <Card variant="bordered">
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Поиск по базе знаний..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Все
            </Button>
            
            {knowledgeBase.categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  backgroundColor: selectedCategory === category.id ? category.color : undefined,
                }}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Список записей */}
      {filteredItems.length === 0 ? (
        <Card variant="bordered">
          <CardContent className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-gray-500">
              {searchQuery ? 'Ничего не найдено' : 'Нет записей в базе знаний'}
            </p>
            {!searchQuery && (
              <Button variant="secondary" className="mt-4" onClick={openCreateModal}>
                Добавить первую запись
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} variant="bordered">
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getCategoryColor(item.categoryId) }}
                      />
                      <span className="text-xs text-gray-500">
                        {getCategoryName(item.categoryId)}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 mt-1">{item.title}</h3>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(item)}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm({ isOpen: true, id: item.id })}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-3">{item.content}</p>
                
                {item.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.keywords.slice(0, 5).map((keyword, i) => (
                      <Badge key={i} variant="default" size="sm">{keyword}</Badge>
                    ))}
                    {item.keywords.length > 5 && (
                      <Badge variant="default" size="sm">+{item.keywords.length - 5}</Badge>
                    )}
                  </div>
                )}
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
          setEditingItem(null);
        }}
        title={editingItem?.id ? 'Редактирование записи' : 'Новая запись'}
        size="lg"
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingItem(null);
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
        {editingItem && (
          <KnowledgeItemForm
            item={editingItem}
            categories={knowledgeBase.categories}
            onChange={(field, value) => {
              setEditingItem({ ...editingItem, [field]: value });
            }}
          />
        )}
      </Modal>

      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '' })}
        onConfirm={() => handleDelete(deleteConfirm.id)}
        title="Удалить запись?"
        message="Это действие нельзя отменить."
        confirmText="Удалить"
        variant="danger"
      />
    </div>
  );
}

// Форма записи базы знаний
function KnowledgeItemForm({
  item,
  categories,
  onChange,
}: {
  item: Partial<KnowledgeItem>;
  categories: KnowledgeCategory[];
  onChange: (field: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-4">
      <Select
        label="Категория"
        value={item.categoryId || ''}
        onChange={(e) => onChange('categoryId', e.target.value)}
        options={categories.map(c => ({ value: c.id, label: c.name }))}
      />
      
      <Input
        label="Заголовок / Вопрос"
        value={item.title || ''}
        onChange={(e) => onChange('title', e.target.value)}
        placeholder="Например: Как оформить возврат?"
      />
      
      <Textarea
        label="Содержание / Ответ"
        value={item.content || ''}
        onChange={(e) => onChange('content', e.target.value)}
        placeholder="Полный текст ответа или информации..."
        rows={5}
      />
      
      <Textarea
        label="Ключевые слова (по одному на строку)"
        value={(item.keywords || []).join('\n')}
        onChange={(e) => onChange('keywords', e.target.value.split('\n').filter(Boolean))}
        placeholder="возврат&#10;вернуть&#10;сдать товар"
        rows={3}
      />
      
      <Textarea
        label="Теги (по одному на строку)"
        value={(item.tags || []).join('\n')}
        onChange={(e) => onChange('tags', e.target.value.split('\n').filter(Boolean))}
        placeholder="возврат&#10;инструкция"
        rows={2}
      />
      
      <Input
        label="Приоритет"
        type="number"
        min={1}
        max={100}
        value={item.priority || 50}
        onChange={(e) => onChange('priority', parseInt(e.target.value) || 50)}
      />
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={item.isActive ?? true}
          onChange={(e) => onChange('isActive', e.target.checked)}
          className="rounded"
        />
        <label htmlFor="isActive" className="text-sm text-gray-700">
          Запись активна
        </label>
      </div>
    </div>
  );
}
