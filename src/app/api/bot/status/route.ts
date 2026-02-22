// ============================================
// API Route: Статус бота
// ============================================

import { NextResponse } from 'next/server';
import { getBotStatus, getBotStats } from '@/lib/bot/engine';

export async function GET() {
  try {
    const status = getBotStatus();
    const stats = getBotStats();
    
    return NextResponse.json({
      status,
      stats,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка получения статуса' },
      { status: 500 }
    );
  }
}
