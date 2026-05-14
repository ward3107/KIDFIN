import { useState, useEffect, useCallback } from 'react';
import { Lesson } from '../types';
import { getDailyTip, generateLesson, updateLessonProgress } from '../services/geminiService';
import type useGameStats from './useGameStats';

type GameActions = ReturnType<typeof useGameStats>[1];

interface UseLessonStateOptions {
  knowledgePoints: number;
  gameActions: GameActions;
  triggerConfetti: () => void;
}

export function useLessonState({ knowledgePoints, gameActions, triggerConfetti }: UseLessonStateOptions) {
  const [dailyTip, setDailyTip] = useState<string>('טוען טיפ חכם בשבילך...');
  const [isTipLoading, setIsTipLoading] = useState(false);
  const [isLessonLoading, setIsLessonLoading] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [lessonResult, setLessonResult] = useState<'success' | 'failure' | null>(null);

  const fetchTip = useCallback(async () => {
    setIsTipLoading(true);
    try {
      setDailyTip(await getDailyTip());
    } finally {
      setIsTipLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTip();
  }, [fetchTip]);

  // Keep the lesson-progression tracker in sync with knowledgePoints
  useEffect(() => {
    updateLessonProgress(knowledgePoints);
  }, [knowledgePoints]);

  const handleStartLesson = useCallback(async () => {
    setIsLessonLoading(true);
    setLessonResult(null);
    try {
      const lesson = await generateLesson();
      if (lesson) setCurrentLesson(lesson);
    } finally {
      setIsLessonLoading(false);
    }
  }, []);

  const handleAnswerQuiz = useCallback((index: number) => {
    if (!currentLesson) return;
    if (index === currentLesson.correctIndex) {
      setLessonResult('success');
      gameActions.addKnowledgePoints(1);
      gameActions.addCoins(50);
      gameActions.addXP(15);
      updateLessonProgress(knowledgePoints, `lesson_${Date.now()}`);
      triggerConfetti();
    } else {
      setLessonResult('failure');
    }
  }, [currentLesson, gameActions, knowledgePoints, triggerConfetti]);

  return {
    dailyTip,
    setDailyTip,
    isTipLoading,
    setIsTipLoading,
    isLessonLoading,
    setIsLessonLoading,
    currentLesson,
    setCurrentLesson,
    lessonResult,
    setLessonResult,
    fetchTip,
    handleStartLesson,
    handleAnswerQuiz,
  };
}
