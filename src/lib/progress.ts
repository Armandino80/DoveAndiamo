import type { City } from "@/data/cities";

const STORAGE_KEY = "dove-andiamo-progress-v1";

export interface CityProgress {
  visits: number;
  seenFactIds: string[];
}

export interface QuizProgress {
  completed: number;
  totalCorrect: number;
  bestScore: number;
  bestStreak: number;
}

export interface Progress {
  cities: Record<string, CityProgress>;
  lastCityId: string | null;
  quiz: QuizProgress;
  wishlistCityIds: string[];
}

const EMPTY_QUIZ_PROGRESS: QuizProgress = {
  completed: 0,
  totalCorrect: 0,
  bestScore: 0,
  bestStreak: 0,
};

export function createEmptyProgress(): Progress {
  return { cities: {}, lastCityId: null, quiz: { ...EMPTY_QUIZ_PROGRESS }, wishlistCityIds: [] };
}

export function loadProgress(): Progress {
  if (typeof window === "undefined") return createEmptyProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyProgress();
    const parsed = JSON.parse(raw) as Partial<Progress>;
    const parsedQuiz = parsed.quiz as Partial<QuizProgress> | undefined;
    return {
      cities: parsed.cities ?? {},
      lastCityId: parsed.lastCityId ?? null,
      quiz: {
        completed: parsedQuiz?.completed ?? 0,
        totalCorrect: parsedQuiz?.totalCorrect ?? 0,
        bestScore: parsedQuiz?.bestScore ?? 0,
        bestStreak: parsedQuiz?.bestStreak ?? 0,
      },
      wishlistCityIds: parsed.wishlistCityIds ?? [],
    };
  } catch {
    return createEmptyProgress();
  }
}

export function saveProgress(progress: Progress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    /* session stays usable */
  }
}

export function getCityProgress(progress: Progress, cityId: string): CityProgress {
  return progress.cities[cityId] ?? { visits: 0, seenFactIds: [] };
}

export function toggleWishlist(progress: Progress, cityId: string): Progress {
  const has = progress.wishlistCityIds.includes(cityId);
  const next = {
    ...progress,
    wishlistCityIds: has
      ? progress.wishlistCityIds.filter((id) => id !== cityId)
      : [...progress.wishlistCityIds, cityId],
  };
  saveProgress(next);
  return next;
}

export function pickRandomCity(cities: City[], lastCityId: string | null): City {
  const pool = cities.length > 1 ? cities.filter((c) => c.id !== lastCityId) : cities;
  return pool[Math.floor(Math.random() * pool.length)]!;
}

function pickFact(city: City, seenFactIds: string[]) {
  const unseen = city.facts.filter((f) => !seenFactIds.includes(f.id));
  const alreadyComplete = unseen.length === 0;
  const pool = alreadyComplete ? city.facts : unseen;
  const fact = pool[Math.floor(Math.random() * pool.length)]!;
  return { fact, alreadyComplete, allSeenAfterPick: alreadyComplete || unseen.length === 1 };
}

export function visitCityAndPickFact(
  progress: Progress,
  city: City,
): { progress: Progress; fact: City["facts"][number]; allSeen: boolean } {
  const cp = getCityProgress(progress, city.id);
  const { fact, alreadyComplete, allSeenAfterPick } = pickFact(city, cp.seenFactIds);
  const next: Progress = {
    ...progress,
    cities: {
      ...progress.cities,
      [city.id]: {
        visits: cp.visits + 1,
        seenFactIds: alreadyComplete ? cp.seenFactIds : [...cp.seenFactIds, fact.id],
      },
    },
    lastCityId: city.id,
  };
  saveProgress(next);
  return { progress: next, fact, allSeen: allSeenAfterPick };
}

export function pickAnotherFact(
  progress: Progress,
  city: City,
): { progress: Progress; fact: City["facts"][number]; allSeen: boolean } {
  const cp = getCityProgress(progress, city.id);
  const { fact, alreadyComplete, allSeenAfterPick } = pickFact(city, cp.seenFactIds);
  if (alreadyComplete) return { progress, fact, allSeen: true };
  const next: Progress = {
    ...progress,
    cities: {
      ...progress.cities,
      [city.id]: { visits: cp.visits, seenFactIds: [...cp.seenFactIds, fact.id] },
    },
  };
  saveProgress(next);
  return { progress: next, fact, allSeen: allSeenAfterPick };
}

export function recordQuizResult(progress: Progress, score: number, bestStreak: number): Progress {
  const next: Progress = {
    ...progress,
    quiz: {
      completed: progress.quiz.completed + 1,
      totalCorrect: progress.quiz.totalCorrect + score,
      bestScore: Math.max(progress.quiz.bestScore, score),
      bestStreak: Math.max(progress.quiz.bestStreak, bestStreak),
    },
  };
  saveProgress(next);
  return next;
}
