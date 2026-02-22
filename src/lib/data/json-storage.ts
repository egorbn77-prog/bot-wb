// ============================================
// БЛОК 5: Работа с JSON файлами данных
// ============================================

import fs from 'fs';
import path from 'path';
import type { Scenario } from '@/types/scenario';
import type { KnowledgeBase, KnowledgeItem, KnowledgeCategory } from '@/types/knowledge';
import type { AppSettings } from '@/types/settings';

// Путь к директории с данными
const DATA_DIR = path.join(process.cwd(), 'src', 'data');

// ============================================
// Утилиты для работы с файлами
// ============================================

/**
 * Читает JSON файл
 */
function readJsonFile<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Файл ${filename} не найден`);
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

/**
 * Записывает JSON файл
 */
function writeJsonFile<T>(filename: string, data: T): void {
  const filePath = path.join(DATA_DIR, filename);
  const content = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Генерирует уникальный ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// Работа со сценариями
// ============================================

interface ScenariosFile {
  version: string;
  updatedAt: string;
  scenarios: Scenario[];
}

/**
 * Получает все сценарии
 */
export function getScenarios(): Scenario[] {
  const data = readJsonFile<ScenariosFile>('scenarios.json');
  return data.scenarios;
}

/**
 * Получает активные сценарии, отсортированные по приоритету
 */
export function getActiveScenarios(): Scenario[] {
  return getScenarios()
    .filter(s => s.isActive)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Получает сценарий по ID
 */
export function getScenarioById(id: string): Scenario | null {
  const scenarios = getScenarios();
  return scenarios.find(s => s.id === id) || null;
}

/**
 * Создаёт новый сценарий
 */
export function createScenario(scenario: Omit<Scenario, 'id' | 'createdAt' | 'updatedAt'>): Scenario {
  const data = readJsonFile<ScenariosFile>('scenarios.json');
  
  const now = new Date().toISOString();
  const newScenario: Scenario = {
    ...scenario,
    id: generateId('scenario'),
    createdAt: now,
    updatedAt: now,
  };
  
  data.scenarios.push(newScenario);
  data.updatedAt = now;
  writeJsonFile('scenarios.json', data);
  
  return newScenario;
}

/**
 * Обновляет сценарий
 */
export function updateScenario(id: string, updates: Partial<Scenario>): Scenario | null {
  const data = readJsonFile<ScenariosFile>('scenarios.json');
  
  const index = data.scenarios.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  const now = new Date().toISOString();
  data.scenarios[index] = {
    ...data.scenarios[index],
    ...updates,
    updatedAt: now,
  };
  
  data.updatedAt = now;
  writeJsonFile('scenarios.json', data);
  
  return data.scenarios[index];
}

/**
 * Удаляет сценарий
 */
export function deleteScenario(id: string): boolean {
  const data = readJsonFile<ScenariosFile>('scenarios.json');
  
  const index = data.scenarios.findIndex(s => s.id === id);
  if (index === -1) return false;
  
  data.scenarios.splice(index, 1);
  data.updatedAt = new Date().toISOString();
  writeJsonFile('scenarios.json', data);
  
  return true;
}

// ============================================
// Работа с базой знаний
// ============================================

/**
 * Получает всю базу знаний
 */
export function getKnowledgeBase(): KnowledgeBase {
  return readJsonFile<KnowledgeBase>('knowledge-base.json');
}

/**
 * Получает категории базы знаний
 */
export function getKnowledgeCategories(): KnowledgeCategory[] {
  const data = getKnowledgeBase();
  return data.categories.sort((a, b) => a.order - b.order);
}

/**
 * Получает записи базы знаний
 */
export function getKnowledgeItems(categoryId?: string): KnowledgeItem[] {
  const data = getKnowledgeBase();
  let items = data.items.filter(item => item.isActive);
  
  if (categoryId) {
    items = items.filter(item => item.categoryId === categoryId);
  }
  
  return items.sort((a, b) => b.priority - a.priority);
}

/**
 * Получает запись базы знаний по ID
 */
export function getKnowledgeItemById(id: string): KnowledgeItem | null {
  const data = getKnowledgeBase();
  return data.items.find(item => item.id === id) || null;
}

/**
 * Создаёт новую запись в базе знаний
 */
export function createKnowledgeItem(item: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>): KnowledgeItem {
  const data = readJsonFile<KnowledgeBase>('knowledge-base.json');
  
  const now = new Date().toISOString();
  const newItem: KnowledgeItem = {
    ...item,
    id: generateId('kb'),
    createdAt: now,
    updatedAt: now,
  };
  
  data.items.push(newItem);
  data.updatedAt = now;
  writeJsonFile('knowledge-base.json', data);
  
  return newItem;
}

/**
 * Обновляет запись в базе знаний
 */
export function updateKnowledgeItem(id: string, updates: Partial<KnowledgeItem>): KnowledgeItem | null {
  const data = readJsonFile<KnowledgeBase>('knowledge-base.json');
  
  const index = data.items.findIndex(item => item.id === id);
  if (index === -1) return null;
  
  const now = new Date().toISOString();
  data.items[index] = {
    ...data.items[index],
    ...updates,
    updatedAt: now,
  };
  
  data.updatedAt = now;
  writeJsonFile('knowledge-base.json', data);
  
  return data.items[index];
}

/**
 * Удаляет запись из базы знаний
 */
export function deleteKnowledgeItem(id: string): boolean {
  const data = readJsonFile<KnowledgeBase>('knowledge-base.json');
  
  const index = data.items.findIndex(item => item.id === id);
  if (index === -1) return false;
  
  data.items.splice(index, 1);
  data.updatedAt = new Date().toISOString();
  writeJsonFile('knowledge-base.json', data);
  
  return true;
}

/**
 * Создаёт новую категорию
 */
export function createKnowledgeCategory(category: Omit<KnowledgeCategory, 'id'>): KnowledgeCategory {
  const data = readJsonFile<KnowledgeBase>('knowledge-base.json');
  
  const newCategory: KnowledgeCategory = {
    ...category,
    id: generateId('cat'),
  };
  
  data.categories.push(newCategory);
  data.updatedAt = new Date().toISOString();
  writeJsonFile('knowledge-base.json', data);
  
  return newCategory;
}

/**
 * Обновляет категорию
 */
export function updateKnowledgeCategory(id: string, updates: Partial<KnowledgeCategory>): KnowledgeCategory | null {
  const data = readJsonFile<KnowledgeBase>('knowledge-base.json');
  
  const index = data.categories.findIndex(cat => cat.id === id);
  if (index === -1) return null;
  
  data.categories[index] = {
    ...data.categories[index],
    ...updates,
  };
  
  data.updatedAt = new Date().toISOString();
  writeJsonFile('knowledge-base.json', data);
  
  return data.categories[index];
}

/**
 * Удаляет категорию
 */
export function deleteKnowledgeCategory(id: string): boolean {
  const data = readJsonFile<KnowledgeBase>('knowledge-base.json');
  
  const index = data.categories.findIndex(cat => cat.id === id);
  if (index === -1) return false;
  
  // Удаляем все записи в категории
  data.items = data.items.filter(item => item.categoryId !== id);
  
  // Удаляем категорию
  data.categories.splice(index, 1);
  data.updatedAt = new Date().toISOString();
  writeJsonFile('knowledge-base.json', data);
  
  return true;
}

// ============================================
// Работа с настройками
// ============================================

/**
 * Получает настройки приложения
 */
export function getSettings(): AppSettings {
  return readJsonFile<AppSettings>('settings.json');
}

/**
 * Обновляет настройки приложения
 */
export function updateSettings(updates: Partial<AppSettings>): AppSettings {
  const settings = getSettings();
  
  const updatedSettings = {
    ...settings,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  writeJsonFile('settings.json', updatedSettings);
  
  return updatedSettings;
}

/**
 * Проверяет, настроен ли API Wildberries
 */
export function isWbApiConfigured(): boolean {
  const settings = getSettings();
  return !!(settings.wbApi.apiKey && settings.wbApi.apiKey.length > 0 && settings.wbApi.isEnabled);
}

/**
 * Проверяет, настроен ли AI провайдер
 */
export function isAiConfigured(): boolean {
  const settings = getSettings();
  return !!(settings.ai.apiKey && settings.ai.apiKey.length > 0 && settings.ai.isEnabled);
}
