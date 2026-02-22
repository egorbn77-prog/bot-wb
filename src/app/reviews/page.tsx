// ============================================
// Страница: Отзывы
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Input';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import type { Review } from '@/types/review';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [editedAnswer, setEditedAnswer] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: 'confirm' | 'reject';
    reviewId: string;
  }>({ isOpen: false, action: 'confirm', reviewId: '' });

  // Загрузка отзывов
  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch('/api/reviews');
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Открыть модальное окно редактирования
  const openEditModal = (review: Review) => {
    setSelectedReview(review);
    setEditedAnswer(review.answer || '');
    setIsEditModalOpen(true);
  };

  // Отправить ответ
  const handleConfirm = async (wbId: string, answer?: string) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm',
          wbId,
          answer,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchReviews();
        setIsEditModalOpen(false);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Ошибка отправки:', error);
    }
  };

  // Отклонить ответ
  const handleReject = async (wbId: string) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          wbId,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchReviews();
      }
    } catch (error) {
      console.error('Ошибка отклонения:', error);
    }
  };

  // Рендер рейтинга звёздами
  const renderRating = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
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
            Отзывы
          </h1>
          <p className="text-gray-500 mt-1">
            Обработка и ответы на отзывы покупателей
          </p>
        </div>
        
        <Button onClick={fetchReviews} variant="secondary">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Обновить
        </Button>
      </div>

      {/* Список отзывов */}
      {reviews.length === 0 ? (
        <Card variant="bordered">
          <CardContent className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-gray-500">Нет отзывов для обработки</p>
            <p className="text-sm text-gray-400 mt-1">
              Запустите бота для получения новых отзывов
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} variant="bordered">
              <CardContent className="space-y-4">
                {/* Заголовок отзыва */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-gray-900">
                        {review.productName}
                      </h3>
                      {renderRating(review.rating)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {review.author} • {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        review.status === 'pending' ? 'warning' :
                        review.status === 'answered' ? 'success' :
                        review.status === 'error' ? 'danger' : 'default'
                      }
                    >
                      {review.status === 'pending' ? 'Ожидает' :
                       review.status === 'answered' ? 'Отвечено' :
                       review.status === 'error' ? 'Ошибка' : 'Новый'}
                    </Badge>
                    {review.isAiGenerated && (
                      <Badge variant="info" size="sm">AI</Badge>
                    )}
                  </div>
                </div>

                {/* Текст отзыва */}
                {review.text && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-700">{review.text}</p>
                  </div>
                )}

                {/* Достоинства/недостатки */}
                {(review.pros || review.cons) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {review.pros && (
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-green-600 font-medium mb-1">Достоинства</p>
                        <p className="text-sm text-gray-700">{review.pros}</p>
                      </div>
                    )}
                    {review.cons && (
                      <div className="bg-red-50 rounded-lg p-3">
                        <p className="text-xs text-red-600 font-medium mb-1">Недостатки</p>
                        <p className="text-sm text-gray-700">{review.cons}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Сформированный ответ */}
                {review.answer && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-medium mb-1">Сформированный ответ</p>
                    <p className="text-sm text-gray-700">{review.answer}</p>
                  </div>
                )}

                {/* Действия */}
                {review.status === 'pending' && review.answer && (
                  <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleConfirm(review.wbId, review.answer)}
                      className="flex-1 sm:flex-initial"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Отправить
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openEditModal(review)}
                      className="flex-1 sm:flex-initial"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Редактировать
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDialog({ isOpen: true, action: 'reject', reviewId: review.wbId })}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Отклонить
                    </Button>
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
        onClose={() => setIsEditModalOpen(false)}
        title="Редактирование ответа"
        size="lg"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (selectedReview) {
                  handleConfirm(selectedReview.wbId, editedAnswer);
                }
              }}
            >
              Отправить
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {selectedReview && (
            <>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Текст отзыва</p>
                <p className="text-sm">{selectedReview.text || '(без текста)'}</p>
              </div>
              
              <Textarea
                label="Ваш ответ"
                value={editedAnswer}
                onChange={(e) => setEditedAnswer(e.target.value)}
                rows={5}
                maxLength={500}
              />
              
              <p className="text-xs text-gray-500 text-right">
                {editedAnswer.length}/500 символов
              </p>
            </>
          )}
        </div>
      </Modal>

      {/* Диалог подтверждения */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => handleReject(confirmDialog.reviewId)}
        title="Отклонить ответ?"
        message="Ответ будет удалён и не будет отправлен покупателю."
        confirmText="Отклонить"
        variant="danger"
      />
    </div>
  );
}
