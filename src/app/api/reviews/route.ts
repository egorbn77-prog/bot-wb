// ============================================
// API Route: Отзывы
// ============================================

import { NextResponse } from 'next/server';
import { getPendingReviews, confirmAnswer, rejectAnswer, editAnswer } from '@/lib/bot/engine';

// GET - получение списка отзывов
export async function GET() {
  try {
    const reviews = getPendingReviews();
    
    return NextResponse.json({
      reviews,
      count: reviews.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка получения отзывов' },
      { status: 500 }
    );
  }
}

// PATCH - обновление отзыва (подтверждение/отклонение/редактирование)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { action, wbId, answer } = body;
    
    if (!wbId) {
      return NextResponse.json(
        { success: false, message: 'wbId обязателен' },
        { status: 400 }
      );
    }
    
    let result;
    
    switch (action) {
      case 'confirm':
        result = await confirmAnswer(wbId, answer);
        break;
      
      case 'reject':
        result = rejectAnswer(wbId);
        break;
      
      case 'edit':
        if (!answer) {
          return NextResponse.json(
            { success: false, message: 'Ответ обязателен для редактирования' },
            { status: 400 }
          );
        }
        result = editAnswer(wbId, answer);
        break;
      
      default:
        return NextResponse.json(
          { success: false, message: 'Неизвестное действие' },
          { status: 400 }
        );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Ошибка обработки запроса' },
      { status: 500 }
    );
  }
}
