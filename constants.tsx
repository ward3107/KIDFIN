
import React from 'react';
import { Mission, Reward } from './types';

export const INITIAL_MISSIONS: Mission[] = [
  { id: '1', title: 'סידור החדר', reward: 50, icon: '🧹', completed: false },
  { id: '2', title: 'שיעורי בית בחשבון', reward: 80, icon: '📚', completed: false },
  { id: '3', title: 'חיסכון ראשון של 20 מטבעות', reward: 100, icon: '🐷', completed: true },
];

export const REWARDS: Reward[] = [
  // צרכים (Needs)
  { id: 'r1', name: 'יומן לבית ספר', price: 50, icon: '📓', color: 'bg-green-50', type: 'need' },
  { id: 'r2', name: 'עטים (3 יח\')', price: 40, icon: '✏️', color: 'bg-green-50', type: 'need' },
  { id: 'r3', name: 'תיק לבית ספר', price: 150, icon: '🎒', color: 'bg-green-50', type: 'need' },
  { id: 'r4', name: 'קופסת אוכל', price: 100, icon: '🥪', color: 'bg-green-50', type: 'need' },
  { id: 'r5', name: 'קרם הגנה', price: 80, icon: '🧴', color: 'bg-green-50', type: 'need' },
  { id: 'r6', name: 'ספר לימודים', price: 120, icon: '📘', color: 'bg-green-50', type: 'need' },
  { id: 'r7', name: 'מברשת שיניים', price: 30, icon: '🦷', color: 'bg-green-50', type: 'need' },
  { id: 'r8', name: 'פירות לשבוע', price: 90, icon: '🍎', color: 'bg-green-50', type: 'need' },
  { id: 'r9', name: 'נעלי ספורט', price: 200, icon: '👟', color: 'bg-green-50', type: 'need' },
  { id: 'r10', name: 'גרביים (3 זוגות)', price: 60, icon: '🧦', color: 'bg-green-50', type: 'need' },
  { id: 'r11', name: 'מעיל לחורף', price: 300, icon: '🧥', color: 'bg-green-50', type: 'need' },
  { id: 'r12', name: 'בקבוק מים', price: 45, icon: '💧', color: 'bg-green-50', type: 'need' },
  { id: 'r13', name: 'ערכת עזרה ראשונה', price: 70, icon: '🩹', color: 'bg-green-50', type: 'need' },

  // רצונות (Wants)
  { id: 'r14', name: 'משחק וידאו', price: 500, icon: '🎮', color: 'bg-yellow-50', type: 'want' },
  { id: 'r15', name: 'גלידה', price: 150, icon: '🍦', color: 'bg-yellow-50', type: 'want' },
  { id: 'r16', name: 'צעצוע', price: 300, icon: '🧸', color: 'bg-yellow-50', type: 'want' },
  { id: 'r17', name: 'ממתקים וחטיפים', price: 200, icon: '🍕', color: 'bg-yellow-50', type: 'want' },
  { id: 'r18', name: 'שעון יוקרתי', price: 800, icon: '🕒', color: 'bg-yellow-50', type: 'want' },
  { id: 'r19', name: 'אוזניות מעוצבות', price: 250, icon: '🎧', color: 'bg-yellow-50', type: 'want' },
  { id: 'r20', name: 'ערכת אומנות יוקרתית', price: 180, icon: '🎨', color: 'bg-yellow-50', type: 'want' },
  { id: 'r21', name: 'סקין לטלפון', price: 100, icon: '📱', color: 'bg-yellow-50', type: 'want' },
  { id: 'r22', name: 'כובע מעוצב', price: 150, icon: '🧢', color: 'bg-yellow-50', type: 'want' },
  { id: 'r23', name: 'כרטיס לפארק שעשועים', price: 400, icon: '🎪', color: 'bg-yellow-50', type: 'want' },
  { id: 'r24', name: 'כרטיס לקולנוע', price: 120, icon: '🎬', color: 'bg-yellow-50', type: 'want' },
  { id: 'r25', name: 'קיט לגיטרה', price: 600, icon: '🎸', color: 'bg-yellow-50', type: 'want' },
  { id: 'r26', name: 'פאוצ\'ר עם פסילינה', price: 350, icon: '🎁', color: 'bg-yellow-50', type: 'want' },
  { id: 'r27', name: 'כדורגל יוקרתי', price: 220, icon: '⚽', color: 'bg-yellow-50', type: 'want' },
  { id: 'r28', name: 'תליון זהב', price: 1000, icon: '🏆', color: 'bg-yellow-50', type: 'want' },
];
