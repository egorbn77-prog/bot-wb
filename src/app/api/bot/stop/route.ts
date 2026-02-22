// ============================================
// API Route: Остановка бота
// ============================================

import { NextResponse } from 'next/server';
import { stopBot } from '@/lib/bot/engine';

export async function POST() {
  try {
    const result = stopBot();
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Ошибка остановки бота' },
      { status: 500 }
    );
  }
}
