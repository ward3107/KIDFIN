/**
 * New interactive lesson format - engaging and visual!
 */

export type InteractiveLessonPhase = 'hook' | 'explore' | 'explain' | 'practice' | 'quiz';

export interface InteractiveChoice {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
  consequence?: string; // What happens next in the story
}

export interface StoryHook {
  title: string;
  scenario: string; // The story setup
  character: string; // emoji character
  question: string; // The dilemma
  choices: InteractiveChoice[];
}

export interface VisualSimulation {
  type: 'interest_calculator' | 'price_comparison' | 'budget_splitter' | 'savings_tracker';
  title: string;
  instruction: string;
  defaultValue?: number;
}

export interface CharacterDialogue {
  character: 'fox' | 'squirrel' | 'both';
  emotion: 'curious' | 'excited' | 'thoughtful' | 'proud' | 'confused';
  text: string;
}

export interface InteractiveExample {
  id: string;
  scenario: string;
  interactiveElement: VisualSimulation;
  dialogue: CharacterDialogue[];
  keyInsight: string;
}

export interface LessonV2 {
  id: string;
  title: string;
  category: 'savings' | 'spending' | 'earning' | 'banking' | 'investing';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  requiredKnowledgePoints?: number;

  // Phase 1: Hook - Story-based introduction
  hook: StoryHook;

  // Phase 2: Explore - Interactive simulation
  explore: InteractiveExample;

  // Phase 3: Explain - Character dialogue explaining the concept
  explain: {
    conceptName: string;
    definition: string; // Simple, kid-friendly definition
    dialogue: CharacterDialogue[]; // Fox and squirrel discuss it
    realWorldExample: string;
  };

  // Phase 4: Practice - More scenarios
  practice: {
    scenarios: Array<{
      situation: string;
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }>;
  };

  // Phase 5: Quiz - Final challenge
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    reward: string;
  };
}
