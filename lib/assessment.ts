import type { AssessmentQuestion, AssessmentResult, StressCategory } from "@/types/app";

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  { id: 1,  text: "I feel overwhelmed by my academic workload.",              reversed: false },
  { id: 2,  text: "I have difficulty concentrating on my studies.",           reversed: false },
  { id: 3,  text: "I feel anxious before exams or presentations.",            reversed: false },
  { id: 4,  text: "I experience physical symptoms of stress (headaches, etc).",reversed: false },
  { id: 5,  text: "I feel like I cannot keep up with my peers.",              reversed: false },
  { id: 6,  text: "I lose sleep worrying about academic performance.",        reversed: false },
  { id: 7,  text: "I feel lonely or isolated in college.",                    reversed: false },
  { id: 8,  text: "I struggle to manage my time effectively.",                reversed: false },
  { id: 9,  text: "I feel pressured by family expectations.",                 reversed: false },
  { id: 10, text: "I find it hard to relax even during breaks.",              reversed: false },
  { id: 11, text: "I feel unmotivated to attend classes.",                    reversed: false },
  { id: 12, text: "I have trouble making decisions about my future.",         reversed: false },
  { id: 13, text: "I feel irritable or short-tempered with others.",          reversed: false },
  { id: 14, text: "I am able to bounce back quickly from setbacks.",          reversed: true  },
  { id: 15, text: "I feel financially stressed.",                             reversed: false },
  { id: 16, text: "I feel my mental health is suffering.",                    reversed: false },
  { id: 17, text: "I avoid social situations because of stress.",             reversed: false },
  { id: 18, text: "I feel supported by my friends and family.",               reversed: true  },
  { id: 19, text: "I feel hopeless about improving my situation.",            reversed: false },
  { id: 20, text: "I think about quitting college due to stress.",            reversed: false },
];

export const LIKERT_LABELS: Record<number, string> = {
  1: "Never",
  2: "Rarely",
  3: "Sometimes",
  4: "Often",
  5: "Always",
};

const REVERSE_SCORE_MAP: Record<number, number> = {
  1: 5, 2: 4, 3: 3, 4: 2, 5: 1,
};

interface CategoryConfig {
  label: string;
  interpretation: string;
  interventionStrategies: string[];
  copingGuidance: string;
}

const CATEGORY_CONFIG: Record<StressCategory, CategoryConfig> = {
  low: {
    label: "Low Stress",
    interpretation:
      "You appear to be managing academic and personal pressures very well. Your resilience and coping strategies are working effectively.",
    interventionStrategies: [
      "Continue your current wellness practices",
      "Share your strategies with peers who may be struggling",
      "Set growth goals to maintain positive momentum",
      "Practice preventive self-care through regular exercise and sleep",
    ],
    copingGuidance:
      "Maintain your current routine. Consider journaling your successes to stay motivated and spot early warning signs of stress.",
  },
  mild: {
    label: "Mild Stress",
    interpretation:
      "You experience occasional stress that is manageable. Minor adjustments to your routine can help you stay balanced and prevent escalation.",
    interventionStrategies: [
      "Practice daily 5-minute mindfulness or breathing exercises",
      "Create a structured weekly schedule with buffer time",
      "Connect with a peer or mentor for regular check-ins",
      "Limit screen time before bed to improve sleep quality",
    ],
    copingGuidance:
      "Try the 4-7-8 breathing technique: inhale for 4 counts, hold for 7, exhale for 8. Do this 3 times whenever you feel tension rising.",
  },
  moderate: {
    label: "Moderate Stress",
    interpretation:
      "You are experiencing a notable level of stress that may be affecting your daily functioning. It is important to address this before it intensifies.",
    interventionStrategies: [
      "Schedule a session with a college counsellor",
      "Break large tasks into smaller, daily achievable goals",
      "Establish a consistent sleep schedule (7–9 hours)",
      "Engage in 30 minutes of physical activity 3–4 times per week",
      "Talk to a trusted friend, family member, or mentor",
    ],
    copingGuidance:
      "Consider keeping a stress journal. Write down what triggers your stress, how it felt, and one thing you did to cope. Over time, patterns emerge that help you plan better.",
  },
  high: {
    label: "High Stress",
    interpretation:
      "Your stress levels are significantly elevated. This is affecting your wellbeing and academic performance. Seeking support now is important and courageous.",
    interventionStrategies: [
      "Book an urgent counselling session — do this today",
      "Speak to your academic advisor about workload adjustments",
      "Contact family or close friends for emotional support",
      "Reduce non-essential commitments temporarily",
      "Practice grounding techniques: 5 things you see, 4 you hear, 3 you can touch",
    ],
    copingGuidance:
      "You do not have to manage this alone. Reaching out is a sign of strength. Start with one small step today — even sending a message to someone you trust.",
  },
  severe: {
    label: "Severe Stress",
    interpretation:
      "You are experiencing severe stress that requires immediate professional attention. Your wellbeing is the top priority right now. Please reach out today.",
    interventionStrategies: [
      "Contact our counselling team immediately: +91 97902 05149",
      "Speak to a trusted person — friend, parent, or teacher — right now",
      "If feeling unsafe, contact iCall: 9152987821 or Vandrevala Foundation: 1860-2662-345",
      "Avoid isolation — stay around people you trust",
      "Postpone non-urgent academic tasks with faculty support",
    ],
    copingGuidance:
      "Please reach out for help immediately. You matter, and support is available. Email us at zealcatalyst.zeca@gmail.com or call +91 97902 05149 anytime.",
  },
};

export function calculateScore(answers: Record<number, number>): number {
  let total = 0;
  for (const question of ASSESSMENT_QUESTIONS) {
    const raw = answers[question.id] ?? 1;
    total += question.reversed ? REVERSE_SCORE_MAP[raw] ?? raw : raw;
  }
  return total;
}

export function getCategory(score: number): StressCategory {
  if (score <= 20) return "low";
  if (score <= 40) return "mild";
  if (score <= 60) return "moderate";
  if (score <= 80) return "high";
  return "severe";
}

export function generateResult(answers: Record<number, number>): AssessmentResult {
  const score = calculateScore(answers);
  const category = getCategory(score);
  const config = CATEGORY_CONFIG[category];

  return {
    score,
    category,
    interpretation: config.interpretation,
    interventionStrategies: config.interventionStrategies,
    copingGuidance: config.copingGuidance,
    answers,
  };
}

// localStorage cache — keeps last 50 reports
const CACHE_KEY = "z2u_assessment_cache";

export function cacheAssessmentResult(userId: string, result: AssessmentResult): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const cache: Array<{ userId: string; result: AssessmentResult; cachedAt: string }> =
      raw ? JSON.parse(raw) : [];
    cache.unshift({ userId, result, cachedAt: new Date().toISOString() });
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache.slice(0, 50)));
  } catch {}
}

export function getCachedResults(userId: string): AssessmentResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const cache: Array<{ userId: string; result: AssessmentResult; cachedAt: string }> =
      JSON.parse(raw);
    return cache.filter((e) => e.userId === userId).map((e) => e.result);
  } catch {
    return [];
  }
}

export function getCategoryColor(category: StressCategory): string {
  const colors: Record<StressCategory, string> = {
    low: "oklch(0.65 0.18 145)",
    mild: "oklch(0.75 0.18 95)",
    moderate: "oklch(0.72 0.20 60)",
    high: "oklch(0.65 0.22 35)",
    severe: "oklch(0.55 0.22 20)",
  };
  return colors[category];
}

export function getCategoryLabel(category: StressCategory): string {
  return CATEGORY_CONFIG[category].label;
}
