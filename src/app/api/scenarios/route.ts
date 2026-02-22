// ============================================
// API Route: Сценарии ответов
// ============================================

import { NextResponse } from 'next/server';
import {
  getScenarios,
  getScenarioById,
  createScenario,
  updateScenario,
  deleteScenario,
} from '@/lib/data/json-storage';
import type { ScenarioInput } from '@/types/scenario';

// GET - получение сценариев
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const scenario = getScenarioById(id);
      if (!scenario) {
        return NextResponse.json(
          { error: 'Сценарий не найден' },
          { status: 404 }
        );
      }
      return NextResponse.json(scenario);
    }
    
    const scenarios = getScenarios();
    return NextResponse.json({
      scenarios,
      count: scenarios.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка получения сценариев' },
      { status: 500 }
    );
  }
}

// POST - создание сценария
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const scenario = createScenario(body as ScenarioInput);
    
    return NextResponse.json(scenario, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка создания сценария' },
      { status: 500 }
    );
  }
}

// PUT - обновление сценария
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID сценария обязателен' },
        { status: 400 }
      );
    }
    
    const scenario = updateScenario(id, updates);
    
    if (!scenario) {
      return NextResponse.json(
        { error: 'Сценарий не найден' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(scenario);
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка обновления сценария' },
      { status: 500 }
    );
  }
}

// DELETE - удаление сценария
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID сценария обязателен' },
        { status: 400 }
      );
    }
    
    const deleted = deleteScenario(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Сценарий не найден' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка удаления сценария' },
      { status: 500 }
    );
  }
}
