
import React, { useState, useEffect } from 'react';
import { 
  Home, 
  CheckCircle, 
  PiggyBank, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  Trophy, 
  Sparkles, 
  Loader2, 
  ArrowUpRight,
  GraduationCap,
  Lock,
  BookOpen,
  AlertCircle,
  Calendar,
  Bike
} from 'lucide-react';
import { TabType, Mission, UserStats, Lesson, Reward, UserBehavior } from './types';
import { INITIAL_MISSIONS, REWARDS } from './constants';
import { Button, Card, Badge } from './components/UI';
import { getDailyTip, generateMagicMission, generateLesson } from './services/geminiService';

const MAX_DAILY_TASKS = 3;
const BIKE_GOAL = 1200;

// LocalStorage keys
const STORAGE_KEYS = {
  STATS: 'save4dream_stats',
  MISSIONS: 'save4dream_missions',
  DAILY_TASKS: 'save4dream_daily_tasks',
  USER_BEHAVIOR: 'save4dream_user_behavior',
};

// Load from localStorage (using type assertion for JSX compatibility)
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
    return defaultValue;
  }
}

// Save to localStorage (using type assertion for JSX compatibility)
function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
  }
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Initialize state from localStorage or defaults
  const [stats, setStats] = useState<UserStats>(() =>
    loadFromStorage<UserStats>(STORAGE_KEYS.STATS, {
      coins: 450,
      level: 1,
      xp: 65,
      savings: 820,
      knowledgePoints: 0,
      name: "אופיר",
    })
  );

  const [missions, setMissions] = useState<Mission[]>(() =>
    loadFromStorage<Mission[]>(STORAGE_KEYS.MISSIONS, INITIAL_MISSIONS)
  );
  const [dailyTip, setDailyTip] = useState<string>("טוען טיפ חכם בשבילך...");
  const [isTipLoading, setIsTipLoading] = useState(false);
  const [isMissionLoading, setIsMissionLoading] = useState(false);
  const [isLessonLoading, setIsLessonLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [dailyTasksGenerated, setDailyTasksGenerated] = useState<number>(() =>
    loadFromStorage<number>(STORAGE_KEYS.DAILY_TASKS, 0)
  );
  const [purchaseNotification, setPurchaseNotification] = useState<Reward | null>(null);

  // Track user behavior for analysis
  const [userBehavior, setUserBehavior] = useState<UserBehavior>(() =>
    loadFromStorage<UserBehavior>(STORAGE_KEYS.USER_BEHAVIOR, {
      purchases: [],
      savingsDeposits: 0,
      completedMissions: 0,
      totalEarned: 0,
      totalSpent: 0,
    })
  );

  // Academy States
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [lessonResult, setLessonResult] = useState<'success' | 'failure' | null>(null);

  useEffect(() => {
    fetchTip();
  }, []);

  // Auto-hide confetti after 2 seconds with cleanup
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Auto-hide purchase notification after 3 seconds with cleanup
  useEffect(() => {
    if (purchaseNotification) {
      const timer = setTimeout(() => setPurchaseNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [purchaseNotification]);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.STATS, stats);
  }, [stats]);

  // Save missions to localStorage whenever they change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MISSIONS, missions);
  }, [missions]);

  // Save daily tasks count to localStorage whenever it changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.DAILY_TASKS, dailyTasksGenerated);
  }, [dailyTasksGenerated]);

  // Save user behavior to localStorage whenever it changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.USER_BEHAVIOR, userBehavior);
  }, [userBehavior]);

  const fetchTip = async () => {
    setIsTipLoading(true);
    const tip = await getDailyTip();
    setDailyTip(tip);
    setIsTipLoading(false);
  };

  const handleMagicMission = async () => {
    if (dailyTasksGenerated >= MAX_DAILY_TASKS) return;
    setIsMissionLoading(true);
    const newMissionData = await generateMagicMission();
    if (newMissionData) {
      const newMission: Mission = {
        id: Date.now().toString(),
        title: newMissionData.title,
        reward: newMissionData.reward,
        icon: newMissionData.icon,
        completed: false,
        isAiGenerated: true,
      };
      setMissions(prev => [newMission, ...prev]);
      setDailyTasksGenerated(prev => prev + 1);
      triggerConfetti();
    }
    setIsMissionLoading(false);
  };

  const handleStartLesson = async () => {
    setIsLessonLoading(true);
    setLessonResult(null);
    const lesson = await generateLesson();
    if (lesson) setCurrentLesson(lesson);
    setIsLessonLoading(false);
  };

  const handleAnswerQuiz = (index: number) => {
    if (!currentLesson) return;
    if (index === currentLesson.correctIndex) {
      setLessonResult('success');
      setStats(prev => ({
        ...prev,
        knowledgePoints: prev.knowledgePoints + 1,
        coins: prev.coins + 50,
        xp: Math.min(100, prev.xp + 15)
      }));
      triggerConfetti();
    } else {
      setLessonResult('failure');
    }
  };

  const completeMission = (id: string, reward: number) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, completed: true } : m));
    setStats(prev => {
      const newXp = prev.xp + 25;
      const leveledUp = newXp >= 100;
      return {
        ...prev,
        coins: prev.coins + reward,
        xp: leveledUp ? newXp - 100 : newXp,
        level: leveledUp ? prev.level + 1 : prev.level,
      };
    });
    triggerConfetti();
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
  };

  const handleDeposit = () => {
    if (stats.coins >= 50) {
      setStats(prev => ({ ...prev, coins: prev.coins - 50, savings: prev.savings + 50 }));
      triggerConfetti();
    }
  };

  const handleWithdraw = () => {
    if (stats.savings >= 50) {
      setStats(prev => ({ ...prev, savings: prev.savings - 50, coins: prev.coins + 50 }));
    }
  };

  const handlePurchase = (reward: Reward) => {
    if (stats.coins >= reward.price) {
      setStats(prev => ({ ...prev, coins: prev.coins - reward.price }));

      // Track purchase for analysis
      setUserBehavior(prev => ({
        ...prev,
        purchases: [
          ...prev.purchases,
          {
            rewardId: reward.id,
            rewardName: reward.name,
            type: reward.type,
            price: reward.price,
            timestamp: Date.now(),
          }
        ],
        totalSpent: prev.totalSpent + reward.price,
      }));

      setPurchaseNotification(reward);
      triggerConfetti();
    }
  };

  const renderHome = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Level & Knowledge Header */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-4 rounded-3xl text-white shadow-lg relative overflow-hidden">
          <div className="text-indigo-100 text-[10px] font-bold">שלב נוכחי</div>
          <div className="text-2xl font-black">רמה {stats.level}</div>
          <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-yellow-400 h-full transition-all duration-700" style={{ width: `${stats.xp}%` }}></div>
          </div>
        </div>
        <div className="bg-white border-2 border-indigo-100 p-4 rounded-3xl shadow-sm flex flex-col justify-center items-center">
          <div className="text-slate-400 text-[10px] font-bold mb-1">נקודות ידע 🧠</div>
          <div className="text-2xl font-black text-indigo-600 tracking-tight">{stats.knowledgePoints}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => setActiveTab('school')} className="bg-indigo-50 hover:bg-indigo-100 p-4 rounded-3xl border-2 border-indigo-100 flex flex-col items-center gap-2 transition-all group">
          <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
            <GraduationCap size={24} />
          </div>
          <span className="font-bold text-slate-700 text-sm text-center">אקדמיה (למד)</span>
        </button>
        <button 
          onClick={() => setActiveTab('earn')} 
          className={`p-4 rounded-3xl border-2 flex flex-col items-center gap-2 transition-all group ${
            stats.knowledgePoints > 0 ? 'bg-orange-50 hover:bg-orange-100 border-orange-100' : 'bg-slate-100 border-slate-200 opacity-70'
          }`}
        >
          <div className={`p-3 text-white rounded-2xl shadow-lg transition-transform ${
            stats.knowledgePoints > 0 ? 'bg-orange-500 shadow-orange-200 group-hover:scale-110' : 'bg-slate-400 shadow-none'
          }`}>
            {stats.knowledgePoints > 0 ? <CheckCircle size={24} /> : <Lock size={24} />}
          </div>
          <span className="font-bold text-slate-700 text-sm text-center">אתגרים {stats.knowledgePoints === 0 && '🔒'}</span>
        </button>
      </div>

      {/* Daily Tip */}
      <Card className="bg-blue-50 border-blue-100">
        <div className="flex gap-4">
          <div className="text-3xl bg-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0">🐿️</div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-blue-900 text-sm">טיפ מהסנאי</h3>
              <button onClick={fetchTip} disabled={isTipLoading} className="text-blue-600">
                {isTipLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              </button>
            </div>
            <p className="text-xs text-blue-700 leading-relaxed">
              {isTipLoading ? "השועל חושב על משהו חכם..." : dailyTip}
            </p>
          </div>
        </div>
      </Card>

      {/* Intro Widget */}
      {stats.knowledgePoints === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="text-yellow-600 shrink-0" size={20} />
          <div>
            <h4 className="font-bold text-yellow-800 text-sm">חדש כאן?</h4>
            <p className="text-yellow-700 text-xs mt-0.5">כדי לפתוח את האתגרים ולהרוויח מטבעות, עליך ללמוד שיעור אחד באקדמיה!</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderSchool = () => (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center gap-2 mb-2">
        <GraduationCap className="text-indigo-600" size={24} />
        <h2 className="text-xl font-black text-slate-800">האקדמיה לפיננסים</h2>
      </div>

      {!currentLesson ? (
        <div className="text-center py-8">
          <div className="bg-indigo-50 p-6 rounded-full w-28 h-28 mx-auto flex items-center justify-center mb-4">
            <BookOpen size={40} className="text-indigo-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">ללמוד = להרוויח! 💰</h3>
          <p className="text-slate-500 text-sm mb-6 px-4">למד מושג חדש, נצח בסימולציה, וקבל <span className="font-bold text-orange-500">50 מטבעות</span>.</p>
          <Button variant="academy" onClick={handleStartLesson} disabled={isLessonLoading}>
            {isLessonLoading ? <><Loader2 className="animate-spin" /> מכין שיעור...</> : <><Sparkles size={18} /> התחל שיעור פיננסי ✨</>}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="border-indigo-100 bg-indigo-50/50">
            <h3 className="font-bold text-indigo-900 text-base mb-2 italic">📚 השיעור היומי</h3>
            <p className="text-slate-700 leading-relaxed text-sm md:text-base">
              {currentLesson.concept}
            </p>
          </Card>

          {lessonResult === 'success' ? (
            <div className="bg-green-100 p-6 rounded-3xl text-center border border-green-200 animate-fadeIn">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="font-bold text-green-800 text-lg">כל הכבוד!</h3>
              <p className="text-green-700 text-sm mb-4 font-medium">הרווחת 50 מטבעות ונקודת ידע!</p>
              <Button className="bg-green-500" onClick={() => setCurrentLesson(null)}>סיים וחזור</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-sm px-1">סימולציה: {currentLesson.question}</h4>
              {currentLesson.options.map((option, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleAnswerQuiz(idx)}
                  disabled={lessonResult === 'failure'}
                  className={`w-full p-4 rounded-2xl text-right font-bold transition-all border-2 ${
                    lessonResult === 'failure' && idx !== currentLesson.correctIndex 
                    ? 'bg-red-50 text-red-400 border-red-100' 
                    : 'bg-white border-slate-100 hover:border-indigo-200'
                  }`}
                >
                  {option}
                </button>
              ))}
              {lessonResult === 'failure' && (
                <div className="bg-red-50 p-4 rounded-2xl text-center border border-red-100 text-red-600 text-sm">
                  אופס! נסה שוב.
                  <Button className="mt-2 bg-red-500 py-2 text-xs" onClick={() => setCurrentLesson(null)}>נסה שוב</Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderEarn = () => {
    if (stats.knowledgePoints === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-fadeIn py-12">
          <div className="bg-slate-100 p-8 rounded-full">
            <Lock size={64} className="text-slate-300" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-700 underline decoration-indigo-400">האזור נעול!</h2>
            <p className="text-slate-500 mt-2 px-6 text-sm">כדי לקבל אתגרים פיננסיים ולהרוויח כסף, עליך קודם כל ללמוד שיעור באקדמיה.</p>
          </div>
          <Button onClick={() => setActiveTab('school')} variant="academy">עבור לאקדמיה</Button>
        </div>
      );
    }

    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-xl font-black text-slate-800">אתגרים פיננסיים</h2>
          <div className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-lg text-slate-500 flex items-center gap-1">
            <Calendar size={12} />
            {dailyTasksGenerated}/{MAX_DAILY_TASKS} להיום
          </div>
        </div>
        
        {dailyTasksGenerated < MAX_DAILY_TASKS ? (
          <Button variant="magic" onClick={handleMagicMission} disabled={isMissionLoading}>
            {isMissionLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {isMissionLoading ? "מייצר אתגר..." : "קבל אתגר חדש"}
          </Button>
        ) : (
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center text-slate-500 text-xs">
            סיימת את האתגרים להיום! חזור מחר.
          </div>
        )}

        <div className="space-y-3">
          {missions.map((mission) => (
            <div key={mission.id} className={`p-4 rounded-3xl border-2 flex items-center justify-between transition-all ${
              mission.completed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 shadow-sm'
            }`}>
              <div className="flex items-center gap-4">
                <div className="text-2xl bg-slate-100 w-12 h-12 rounded-2xl flex items-center justify-center">{mission.icon}</div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm leading-tight">{mission.title}</h4>
                  <div className="flex items-center text-orange-500 font-black text-xs mt-1">
                    <DollarSign size={14} strokeWidth={3} /> {mission.reward} מטבעות
                  </div>
                </div>
              </div>
              {!mission.completed ? (
                <button onClick={() => completeMission(mission.id, mission.reward)} className="bg-blue-500 text-white p-2.5 rounded-xl shadow-lg shadow-blue-200 transition-transform active:scale-90">
                  <CheckCircle size={20} />
                </button>
              ) : (
                <div className="text-emerald-500 bg-emerald-100 p-2 rounded-xl">
                  <CheckCircle size={18} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSave = () => {
    const progressPercent = Math.min(100, Math.floor((stats.savings / BIKE_GOAL) * 100));
    const leftToGoal = Math.max(0, BIKE_GOAL - stats.savings);
    const milestones = [25, 50, 75];

    return (
      <div className="space-y-6 animate-fadeIn">
        <h2 className="text-xl font-black text-slate-800">הבנק שלי</h2>
        
        {/* Main Savings Card */}
        <div className="bg-emerald-500 p-6 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100 relative overflow-hidden transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl"></div>
          <div className="flex justify-between items-start mb-2">
            <div>
               <p className="text-emerald-100 text-xs font-bold mb-1">סה"כ בחיסכון</p>
               <div className="text-5xl font-black flex items-center gap-1 transition-transform active:scale-105">
                 <DollarSign size={36} strokeWidth={3} /> {stats.savings}
               </div>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl">
              <PiggyBank size={28} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] font-bold text-emerald-100">
            <span className="flex items-center gap-1"><ArrowUpRight size={14}/> +12% החודש</span>
            <span className="bg-emerald-600/50 px-2 py-1 rounded-lg">ריבית שנתית: 4.5% 📈</span>
          </div>
        </div>

        {/* Dynamic Goal Card */}
        <Card className="border-2 border-slate-50 relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                <Bike size={20} />
              </div>
              <h4 className="font-black text-slate-700 text-sm">יעד: אופניים חדשים</h4>
            </div>
            <Badge className="bg-blue-100 text-blue-600 font-black tracking-tight">{progressPercent}%</Badge>
          </div>

          {/* Progress Bar Container */}
          <div className="relative pt-2 pb-6">
            <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden border-4 border-white shadow-inner relative">
              {/* Dynamic Filling Bar */}
              <div 
                className="bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(59,130,246,0.4)] relative" 
                style={{ width: `${progressPercent}%` }}
              >
                {/* Glossy overlay effect */}
                <div className="absolute inset-0 bg-white/20 blur-[1px] h-1/3 rounded-full mt-0.5 ml-1 mr-1"></div>
                
                {/* "Current" sparkle at the tip of the progress bar */}
                {progressPercent > 0 && progressPercent < 100 && (
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white/50 blur-md rounded-full animate-pulse"></div>
                )}
              </div>

              {/* Milestones Markers */}
              {milestones.map((m) => (
                <div 
                  key={m}
                  className={`absolute top-0 bottom-0 w-0.5 transition-colors duration-300 ${progressPercent >= m ? 'bg-white/40' : 'bg-slate-300'}`}
                  style={{ left: `${m}%` }}
                >
                  <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${progressPercent >= m ? 'bg-white' : 'bg-slate-300'}`}></div>
                </div>
              ))}
            </div>

            {/* Goal Marker Label */}
            <div className="absolute right-0 bottom-0 flex flex-col items-end">
              <div className="text-[10px] font-black text-slate-400 flex items-center gap-1">
                <span>{BIKE_GOAL}</span>
                <DollarSign size={10} strokeWidth={4} />
              </div>
            </div>
            <div className="absolute left-0 bottom-0 flex flex-col items-start">
               <div className="text-[10px] font-black text-indigo-500 flex items-center gap-1">
                <span>{stats.savings}</span>
                <DollarSign size={10} strokeWidth={4} />
              </div>
            </div>
          </div>

          <div className="text-center px-2">
            {leftToGoal > 0 ? (
              <div className="bg-indigo-50 py-2 rounded-2xl inline-block px-4 border border-indigo-100">
                <p className="text-[10px] text-indigo-700 font-black">
                  נשאר רק עוד <span className="text-sm text-indigo-900">{leftToGoal}</span> מטבעות כדי לרכוב על האופניים החדשים! 🚲
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50 py-3 rounded-2xl border-2 border-emerald-200 animate-bounce">
                <p className="text-xs text-emerald-600 font-black">
                  מזל טוב! הגעת ליעד! 🎉 הגיע הזמן לקנות את האופניים!
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <Button 
              variant="success" 
              onClick={handleDeposit} 
              disabled={stats.coins < 50} 
              className="flex-1 text-sm shadow-emerald-100 hover:shadow-emerald-200"
            >
              הפקד 50 <DollarSign size={14} strokeWidth={3}/>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleWithdraw}
              disabled={stats.savings < 50}
              className="flex-1 text-red-400 border-red-50 text-xs hover:bg-red-50"
            >
              משיכה <ArrowUpRight className="rotate-90" size={14}/>
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  const renderShop = () => (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-black text-slate-800">חנות הפרסים</h2>
        <div className="bg-orange-50 px-3 py-1 rounded-full border border-orange-100 flex items-center gap-1">
          <DollarSign size={12} className="text-orange-500" />
          <span className="font-black text-orange-600 text-xs">{stats.coins}</span>
        </div>
      </div>
      <div className="flex gap-2 mb-3 justify-center">
        <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full border border-green-200">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-[9px] font-bold text-green-700">צורך</span>
        </div>
        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
          <span className="text-[9px] font-bold text-yellow-700">רצון</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {REWARDS.map((reward) => (
          <div key={reward.id} className={`${reward.color} p-4 rounded-[2rem] border border-slate-100 flex flex-col items-center gap-2 group hover:shadow-md transition-all relative`}>
            <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${reward.type === 'need' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <div className="text-4xl group-hover:scale-110 transition-transform">{reward.icon}</div>
            <div className="text-center">
              <div className="font-black text-slate-800 text-[11px] leading-tight mb-0.5">{reward.name}</div>
              <div className="text-orange-600 font-black text-[10px] flex items-center justify-center gap-0.5">
                <DollarSign size={10} strokeWidth={3}/> {reward.price}
              </div>
            </div>
            <button
              onClick={() => handlePurchase(reward)}
              disabled={stats.coins < reward.price}
              className={`w-full font-black text-[9px] py-2 rounded-xl mt-1 transition-all ${
                stats.coins >= reward.price ? 'bg-white text-slate-800 hover:bg-slate-800 hover:text-white border' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {stats.coins >= reward.price ? 'קנה עכשיו' : 'חסר לך'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalysis = () => {
    // Calculate insights from user behavior
    const needPurchases = userBehavior.purchases.filter(p => p.type === 'need').length;
    const wantPurchases = userBehavior.purchases.filter(p => p.type === 'want').length;
    const totalPurchases = userBehavior.purchases.length;

    const spendingRatio = totalPurchases > 0 ? (needPurchases / totalPurchases) * 100 : 0;

    // Generate insights based on behavior
    const insights = {
      strengths: [] as string[],
      weaknesses: [] as string[],
      tips: [] as string[],
    };

    if (spendingRatio >= 70) {
      insights.strengths.push('💪 מצוין! מתמקד בצרכים ולא ברצונות');
    } else if (spendingRatio >= 50) {
      insights.strengths.push('👍 איזון טוב בין צרכים לרצונות');
    } else if (totalPurchases > 0) {
      insights.weaknesses.push('⚠️ קונה הרבה רצונות, לא רק צרכים');
      insights.tips.push('💡 נסה לחשוב לפני קנייה - האם זה צורך או רצון?');
    }

    if (userBehavior.totalSpent < 500 && totalPurchases > 3) {
      insights.strengths.push('💰 שולט בהוצאות - מוציא בצמצום');
    } else if (userBehavior.totalSpent > 1500) {
      insights.weaknesses.push('💸 מוציא הרבה כסף');
      insights.tips.push('💡 כדאי להגדיל חיסכון לפני קניות גדולות');
    }

    if (stats.savings > 1000) {
      insights.strengths.push('🏦 חיסכון מרשים!');
    } else if (stats.savings < 300) {
      insights.weaknesses.push('📉 חיסכון נמוך מדי');
      insights.tips.push('💡 שמור לפחות 20% מכל הכנסה');
    }

    if (totalPurchases === 0) {
      insights.tips.push('🎯 התחל לקנות כדי לראות את הניתוח שלך!');
    }

    return (
      <div className="space-y-4 animate-fadeIn">
        <h2 className="text-xl font-black text-slate-800 mb-4">ניתוח התנהגות פיננסית</h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl text-white">
            <div className="text-[10px] opacity-80">סה"כ קניות</div>
            <div className="text-2xl font-black">{totalPurchases}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-2xl text-white">
            <div className="text-[10px] opacity-80">צרכים נקנו</div>
            <div className="text-2xl font-black">{needPurchases}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-3 rounded-2xl text-white">
            <div className="text-[10px] opacity-80">רצונות נקנו</div>
            <div className="text-2xl font-black">{wantPurchases}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-2xl text-white">
            <div className="text-[10px] opacity-80">סה"כ הוצאה</div>
            <div className="text-2xl font-black">{userBehavior.totalSpent}</div>
          </div>
        </div>

        {/* Savings Section */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border-2 border-emerald-200">
          <div className="flex items-center justify-between mb-3">
            <div className="font-black text-emerald-800 text-sm flex items-center gap-2">
              <PiggyBank size={18} />
              החיסכון שלך
            </div>
            <div className="text-2xl font-black text-emerald-600">{stats.savings} 💰</div>
          </div>

          {/* Savings Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-[10px] text-emerald-700 mb-1">
              <span>התקדמות למטרה</span>
              <span>{Math.min(100, Math.round((stats.savings / 2000) * 100))}%</span>
            </div>
            <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.savings / 2000) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* What can you do with savings */}
          <div className="bg-white/70 p-3 rounded-xl">
            <div className="font-bold text-emerald-800 text-xs mb-2">💡 מה אפשר לעשות עם חיסכון?</div>
            <div className="space-y-1">
              <div className="flex items-start gap-2 text-[10px] text-emerald-700">
                <span>🎯</span>
                <span><strong>מטרה גדולה:</strong> לקנות משהו שחלמת עליו</span>
              </div>
              <div className="flex items-start gap-2 text-[10px] text-emerald-700">
                <span>🆘</span>
                <span><strong>חירום:</strong> למקרה שצריך כסף בדחיפות</span>
              </div>
              <div className="flex items-start gap-2 text-[10px] text-emerald-700">
                <span>📈</span>
                <span><strong>השקעה:</strong> הכסף גדל עם הזמן!</span>
              </div>
              <div className="flex items-start gap-2 text-[10px] text-emerald-700">
                <span>🎓</span>
                <span><strong>לימודים:</strong> להשקיע בעתיד שלך</span>
              </div>
              <div className="flex items-start gap-2 text-[10px] text-emerald-700">
                <span>🎁</span>
                <span><strong>נדיבות:</strong> לעזור לאחרים</span>
              </div>
            </div>
          </div>

          {/* Savings Tip */}
          <div className="mt-3 p-2 bg-emerald-100 rounded-lg">
            <div className="text-[10px] text-emerald-800 flex items-start gap-2">
              <span className="text-lg">💡</span>
              <span><strong>טיפ:</strong> מומלץ לשמור לפחות 20% מכל הכנסה לחיסכון!</span>
            </div>
          </div>
        </div>

        {/* Spending Ratio Bar */}
        {totalPurchases > 0 && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="text-sm font-bold text-slate-800 mb-2">יחס צרכים לרצונות</div>
            <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden flex">
              <div
                className="bg-green-500 h-full transition-all duration-500 flex items-center justify-center text-[8px] text-white font-black"
                style={{ width: `${spendingRatio}%` }}
              >
                {spendingRatio > 15 && `צרכים ${Math.round(spendingRatio)}%`}
              </div>
              <div
                className="bg-yellow-500 h-full transition-all duration-500 flex items-center justify-center text-[8px] text-white font-black"
                style={{ width: `${100 - spendingRatio}%` }}
              >
                {100 - spendingRatio > 15 && `רצונות ${Math.round(100 - spendingRatio)}%`}
              </div>
            </div>
          </div>
        )}

        {/* Educational Section: Needs vs Wants */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border-2 border-purple-200">
          <div className="font-black text-purple-800 text-sm mb-3 flex items-center gap-2">
            <span className="text-xl">🎓</span>
            להבין את ההבדל: צרכים vs רצונות
          </div>

          {/* What is a Need */}
          <div className="bg-green-100 p-3 rounded-xl mb-3">
            <div className="font-bold text-green-800 text-xs mb-2 flex items-center gap-2">
              <span>🟢</span>
              <strong>מה זה צורך (NEED)?</strong>
            </div>
            <div className="text-[10px] text-green-700 mb-2">
              צורך זה משהו ש<strong>אי אפשר בלעדיו</strong> - דברים שחייבים כדי לחיות בריא ומסודר!
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="bg-white/70 p-2 rounded-lg text-center">
                <div className="text-lg">🍎</div>
                <div className="text-[9px] font-bold text-green-800">אוכל</div>
              </div>
              <div className="bg-white/70 p-2 rounded-lg text-center">
                <div className="text-lg">👕</div>
                <div className="text-[9px] font-bold text-green-800">בגדים</div>
              </div>
              <div className="bg-white/70 p-2 rounded-lg text-center">
                <div className="text-lg">🏠</div>
                <div className="text-[9px] font-bold text-green-800">בית</div>
              </div>
              <div className="bg-white/70 p-2 rounded-lg text-center">
                <div className="text-lg">📚</div>
                <div className="text-[9px] font-bold text-green-800">לימודים</div>
              </div>
            </div>
          </div>

          {/* What is a Want */}
          <div className="bg-yellow-100 p-3 rounded-xl mb-3">
            <div className="font-bold text-yellow-800 text-xs mb-2 flex items-center gap-2">
              <span>🟡</span>
              <strong>מה זה רצון (WANT)?</strong>
            </div>
            <div className="text-[10px] text-yellow-700 mb-2">
              רצון זה משהו ש<strong>כיף לנו</strong> אבל אפשר לחיות בלעדיו. זה דברים שנחמד לקנות, אבל לא חייבים!
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="bg-white/70 p-2 rounded-lg text-center">
                <div className="text-lg">🎮</div>
                <div className="text-[9px] font-bold text-yellow-800">משחקים</div>
              </div>
              <div className="bg-white/70 p-2 rounded-lg text-center">
                <div className="text-lg">🍦</div>
                <div className="text-[9px] font-bold text-yellow-800">גלידה</div>
              </div>
              <div className="bg-white/70 p-2 rounded-lg text-center">
                <div className="text-lg">🎸</div>
                <div className="text-[9px] font-bold text-yellow-800">צעצועים</div>
              </div>
              <div className="bg-white/70 p-2 rounded-lg text-center">
                <div className="text-lg">🍕</div>
                <div className="text-[9px] font-bold text-yellow-800">ממתקים</div>
              </div>
            </div>
          </div>

          {/* Why it matters */}
          <div className="bg-blue-100 p-3 rounded-xl mb-3">
            <div className="font-bold text-blue-800 text-xs mb-2">💡 למה זה חשוב להבין?</div>
            <div className="space-y-1 text-[10px] text-blue-700">
              <div>✓ כשמבינים את ההבדל, אפשר <strong>לחסוך יותר כסף</strong></div>
              <div>✓ לומדים <strong>איך לתעדף</strong> - מה לקנות קודם</div>
              <div>✓ מתחילים לחשוב <strong>לפני קנייה</strong></div>
              <div>✓ הופכים להיות <strong>צרכנים חכמים</strong></div>
            </div>
          </div>

          {/* How to decide */}
          <div className="bg-purple-100 p-3 rounded-xl">
            <div className="font-bold text-purple-800 text-xs mb-2">🤔 איך להחליט? שאל את עצמך:</div>
            <div className="space-y-1 text-[10px] text-purple-700">
              <div className="flex items-start gap-2">
                <span className="font-black">1.</span>
                <span><strong>האם אני יכול לחיות בלעדי זה?</strong> אם כן = רצון</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-black">2.</span>
                <span><strong>האם זה משהו שאני חייב לבריאות שלי?</strong> אם כן = צורך</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-black">3.</span>
                <span><strong>האם אני יכול לחכות איתו?</strong> אם כן = רצון</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-black">4.</span>
                <span><strong>כמה דברים דומים יש לי כבר?</strong> הרבה? אולי זה רצון</span>
              </div>
            </div>
          </div>

          {/* Kid-friendly tip */}
          <div className="mt-3 p-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg">
            <div className="text-[10px] text-purple-800 flex items-start gap-2">
              <span className="text-lg">🐿️</span>
              <span><strong>טיפ מהסנאי:</strong> חשוב על זה כמו על מגש באוכל - קודם מגישים את הירקות (צרכים), ורק אז יש מקום לקינוח (רצונות)!</span>
            </div>
          </div>
        </div>

        {/* Strengths */}
        {insights.strengths.length > 0 && (
          <div className="bg-green-50 p-4 rounded-2xl border-2 border-green-200">
            <div className="font-black text-green-800 text-sm mb-2 flex items-center gap-2">
              <Trophy size={16} />
              חוזקות שלך
            </div>
            <div className="space-y-1">
              {insights.strengths.map((strength, idx) => (
                <div key={idx} className="text-xs text-green-700 font-bold">{strength}</div>
              ))}
            </div>
          </div>
        )}

        {/* Weaknesses */}
        {insights.weaknesses.length > 0 && (
          <div className="bg-red-50 p-4 rounded-2xl border-2 border-red-200">
            <div className="font-black text-red-800 text-sm mb-2 flex items-center gap-2">
              <AlertCircle size={16} />
              דברים לשיפור
            </div>
            <div className="space-y-1">
              {insights.weaknesses.map((weakness, idx) => (
                <div key={idx} className="text-xs text-red-700 font-bold">{weakness}</div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {insights.tips.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-200">
            <div className="font-black text-blue-800 text-sm mb-2 flex items-center gap-2">
              <Sparkles size={16} />
              טיפים לשיפור
            </div>
            <div className="space-y-1">
              {insights.tips.map((tip, idx) => (
                <div key={idx} className="text-xs text-blue-700 font-bold">{tip}</div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {totalPurchases === 0 && (
          <div className="bg-slate-50 p-8 rounded-2xl text-center border border-slate-200">
            <div className="text-4xl mb-3">📊</div>
            <div className="text-sm font-bold text-slate-800 mb-1">עדיין אין נתונים</div>
            <div className="text-xs text-slate-600">בצע קניות ומשימות כדי לראות את הניתוח שלך</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-[100dvh] bg-slate-100 flex items-center justify-center p-2 md:p-4 font-rubik overflow-hidden" dir="rtl">
      <div className="relative w-full max-w-[400px] h-[min(850px,94dvh)] bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border-[8px] md:border-[12px] border-slate-900 overflow-hidden flex flex-col">
        
        {/* Purchase Success Toast Overlay */}
        {purchaseNotification && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 w-64 animate-bounce">
            <div className="bg-indigo-600 text-white p-4 rounded-3xl shadow-2xl flex items-center gap-3 border-2 border-white">
              <div className="text-3xl shrink-0 bg-white/20 p-2 rounded-2xl">{purchaseNotification.icon}</div>
              <div>
                <p className="font-black text-sm">איזה יופי!</p>
                <p className="text-[10px] opacity-90 leading-tight">קנית את "{purchaseNotification.name}" בהצלחה!</p>
              </div>
            </div>
          </div>
        )}

        {/* Notch */}
        <div className="h-6 md:h-7 bg-slate-900 w-full flex justify-center items-end absolute top-0 z-30">
          <div className="w-24 md:w-32 h-4 md:h-5 bg-black rounded-b-2xl md:rounded-b-3xl"></div>
        </div>

        {/* Header */}
        <div className="pt-8 md:pt-10 pb-3 md:pb-4 px-5 md:px-6 bg-white border-b border-slate-50 flex justify-between items-center z-20">
          <div className="flex items-center gap-1">
            <span className="text-slate-800 font-black text-lg md:text-xl italic">Dream</span>
            <span className="text-indigo-600 font-black text-lg md:text-xl italic"> 4 </span>
            <span className="text-slate-800 font-black text-lg md:text-xl italic underline decoration-yellow-400">Save</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 md:px-6 py-4 pb-28 bg-white relative no-scrollbar">
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
               <div className="animate-bounce flex flex-wrap gap-4 justify-center">
                  <span className="text-4xl">🎉</span><span className="text-4xl">✨</span><span className="text-4xl">💰</span>
               </div>
            </div>
          )}
          
          {activeTab === 'home' && renderHome()}
          {activeTab === 'school' && renderSchool()}
          {activeTab === 'earn' && renderEarn()}
          {activeTab === 'save' && renderSave()}
          {activeTab === 'shop' && renderShop()}
          {activeTab === 'analysis' && renderAnalysis()}
        </div>

        {/* Navigation */}
        <div className="absolute bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-100 py-3 md:py-4 px-6 md:px-8 flex justify-between items-center pb-8 md:pb-10 rounded-b-[2.5rem] md:rounded-b-[3.5rem] z-20">
          <NavButton icon={Home} label="בית" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavButton icon={GraduationCap} label="אקדמיה" active={activeTab === 'school'} onClick={() => setActiveTab('school')} />
          <NavButton icon={CheckCircle} label="אתגרים" active={activeTab === 'earn'} onClick={() => setActiveTab('earn')} />
          <NavButton icon={PiggyBank} label="חיסכון" active={activeTab === 'save'} onClick={() => setActiveTab('save')} />
          <NavButton icon={ShoppingBag} label="חנות" active={activeTab === 'shop'} onClick={() => setActiveTab('shop')} />
          <NavButton icon={TrendingUp} label="ניתוח" active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} />
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

const NavButton = ({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center gap-1 transition-all relative ${active ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {active && <div className="absolute -top-1 w-6 h-1 bg-indigo-600 rounded-full"></div>}
    <Icon size={20} strokeWidth={active ? 3 : 2} />
    <span className={`text-[8px] md:text-[9px] font-black ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
  </button>
);

export default App;
