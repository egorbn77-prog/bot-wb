// ============================================
// API Route: База знаний
// ============================================

import { NextResponse } from 'next/server';
import {
  getKnowledgeBase,
  getKnowledgeCategories,
  getKnowledgeItems,
  getKnowledgeItemById,
  createKnowledgeItem,
  updateKnowledgeItem,
  deleteKnowledgeItem,
  createKnowledgeCategory,
  updateKnowledgeCategory,
  deleteKnowledgeCategory,
} from '@/lib/data/json-storage';
import type { KnowledgeItemInput } from '@/types/knowledge';

// GET - получение базы знаний
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const categoryId = searchParams.get('categoryId');
    const id = searchParams.get('id');
    
    if (id) {
      const item = getKnowledgeItemById(id);
      if (!item) {
        return NextResponse.json(
          { error: 'Запись не найдена' },
          { status: 404 }
        );
      }
      return NextResponse.json(item);
    }
    
    if (type === 'categories') {
      const categories = getKnowledgeCategories();
      return NextResponse.json({ categories });
    }
    
    if (type === 'items' || categoryId) {
      const items = getKnowledgeItems(categoryId || undefined);
      return NextResponse.json({ items });
    }
    
    // Возвращаем всю базу знаний
    const knowledgeBase = getKnowledgeBase();
    return NextResponse.json(knowledgeBase);
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка получения базы знаний' },
      { status: 500 }
    );
  }
}

// POST - создание записи
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Проверяем тип создаваемого объекта
    if (body.type === 'category') {
      const { type, ...categoryData } = body;
      const category = createKnowledgeCategory(categoryData);
      return NextResponse.json(category, { status: 201 });
    }
    
    // Создаём запись базы знаний
    const item = createKnowledgeItem(body as KnowledgeItemInput);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка создания записи' },
      { status: 500 }
    );
  }
}

// PUT - обновление записи
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, type, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID обязателен' },
        { status: 400 }
      );
    }
    
    let result;
    
    if (type === 'category') {
      result = updateKnowledgeCategory(id, updates);
    } else {
      result = updateKnowledgeItem(id, updates);
    }
    
    if (!result) {
      return NextResponse.json(
        { error: 'Запись не найдена' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка обновления записи' },
      { status: 500 }
    );
  }
}

// DELETE - удаление записи
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID обязателен' },
        { status: 400 }
      );
    }
    
    let deleted;
    
    if (type === 'category') {
      deleted = deleteKnowledgeCategory(id);
    } else {
      deleted = deleteKnowledgeItem(id);
    }
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Запись не найдена' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка удаления записи' },
      { status: 500 }
    );
  }
}
