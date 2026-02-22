// ============================================
// API Route: Настройки
// ============================================

import { NextResponse } from 'next/server';
import { getSettings, updateSettings, isWbApiConfigured, isAiConfigured } from '@/lib/data/json-storage';
import type { AppSettings } from '@/types/settings';

// GET - получение настроек
export async function GET() {
  try {
    const settings = getSettings();
    
    // Скрываем чувствительные данные
    const safeSettings = {
      ...settings,
      wbApi: {
        ...settings.wbApi,
        apiKey: settings.wbApi.apiKey ? '***' : '',
      },
      ai: {
        ...settings.ai,
        apiKey: settings.ai.apiKey ? '***' : '',
      },
    };
    
    return NextResponse.json({
      settings: safeSettings,
      isWbApiConfigured: isWbApiConfigured(),
      isAiConfigured: isAiConfigured(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка получения настроек' },
      { status: 500 }
    );
  }
}

// PUT - обновление настроек
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // Получаем текущие настройки
    const currentSettings = getSettings();
    
    // Если передан пустой ключ, сохраняем старый
    if (body.wbApi?.apiKey === '***' || body.wbApi?.apiKey === '') {
      body.wbApi.apiKey = currentSettings.wbApi.apiKey;
    }
    
    if (body.ai?.apiKey === '***' || body.ai?.apiKey === '') {
      body.ai.apiKey = currentSettings.ai.apiKey;
    }
    
    const settings = updateSettings(body as Partial<AppSettings>);
    
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка обновления настроек' },
      { status: 500 }
    );
  }
}
