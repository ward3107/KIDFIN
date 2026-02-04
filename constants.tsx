
import React from 'react';
import { Mission, Reward } from './types';

export const INITIAL_MISSIONS: Mission[] = [
  { id: '1', title: 'סידור החדר', reward: 50, icon: '🧹', completed: false },
  { id: '2', title: 'שיעורי בית בחשבון', reward: 80, icon: '📚', completed: false },
  { id: '3', title: 'חיסכון ראשון של 20 מטבעות', reward: 100, icon: '🐷', completed: true },
];

export const REWARDS: Reward[] = [
  { id: 'r1', name: 'סקין לדרקון', price: 500, icon: '🐲', color: 'bg-red-50' },
  { id: 'r2', name: '30 דקות זמן מסך', price: 300, icon: '📱', color: 'bg-blue-50' },
  { id: 'r3', name: 'ערב פיצה משפחתי', price: 1200, icon: '🍕', color: 'bg-yellow-50' },
  { id: 'r4', name: 'כובע אווטאר מגניב', price: 150, icon: '🧢', color: 'bg-purple-50' },
  { id: 'r5', name: 'צעצוע חדש (עד 50 ש"ח)', price: 2000, icon: '🧸', color: 'bg-orange-50' },
  { id: 'r6', name: 'גלידה לבחירה', price: 200, icon: '🍦', color: 'bg-pink-50' },
];
