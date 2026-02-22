// ============================================
// API Route: Запуск бота
// ============================================

import { NextResponse } from 'next/server';
import { startBot } from '@/lib/bot/engine';

export async function POST() {
  try {
    const result = startBot();
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Ошибка запуска бота' },
      { status: 500 }
    );
  }
}
