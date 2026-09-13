import { cities, type FactCategory } from "@/data/cities";
import { getCityProgress, type Progress } from "@/lib/progress";

export const QUIZ_LENGTH = 10;

const FACT_CATEGORIES: FactCategory[] = [
  "eten",
  "literatuur",
  "voetbal & sport",
  "film",
  "geschiedenis",
  "kunst & cultuur",
  "muziek",
  "bekende personen",
  "tradities",
  "stad & geografie",
  "architectuur",
  "wetenschap & onderwijs",
  "economie & innovatie",
];

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  factId: string;
  cityId: string;
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

function unique(items: string[]): string[] {
  return [...new Set(items)];
}

function options(correct: string, candidates: string[]): string[] {
  return shuffle([
    correct,
    ...shuffle(unique(candidates).filter((item) => item !== correct)).slice(0, 3),
  ]);
}

function excerpt(text: string, maxLength = 150): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function getSeenFactCount(progress: Progress): number {
  return cities.reduce((total, city) => {
    const cp = getCityProgress(progress, city.id);
    return total + city.facts.filter((fact) => cp.seenFactIds.includes(fact.id)).length;
  }, 0);
}

export function getQuizPool(progress: Progress): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const cityNames = cities.map((city) => city.name);
  const regions = unique(cities.map((city) => city.region));
  const factTitles = unique(cities.flatMap((city) => city.facts.map((fact) => fact.title)));

  for (const city of cities) {
    const cp = getCityProgress(progress, city.id);
    const seenFacts = city.facts.filter((fact) => cp.seenFactIds.includes(fact.id));

    for (const fact of seenFacts) {
      questions.push({
        id: `${fact.id}-category`,
        prompt: `Tot welke categorie hoorde het verhaal “${fact.title}” uit ${city.name}?`,
        options: options(fact.category, FACT_CATEGORIES),
        correctAnswer: fact.category,
        factId: fact.id,
        cityId: city.id,
      });

      questions.push({
        id: `${fact.id}-city`,
        prompt: `Bij welke stad hoorde dit verhaal: “${excerpt(fact.text)}”`,
        options: options(city.name, cityNames),
        correctAnswer: city.name,
        factId: fact.id,
        cityId: city.id,
      });

      questions.push({
        id: `${fact.id}-title`,
        prompt: `Welke titel hoorde bij dit verhaal uit ${city.name}: “${excerpt(fact.text)}”`,
        options: options(fact.title, factTitles),
        correctAnswer: fact.title,
        factId: fact.id,
        cityId: city.id,
      });
    }

    if (seenFacts.length > 0) {
      questions.push({
        id: `${city.id}-region`,
        prompt: `In welke regio ligt ${city.name}?`,
        options: options(city.region, regions),
        correctAnswer: city.region,
        factId: seenFacts[0]!.id,
        cityId: city.id,
      });
    }
  }

  return questions;
}

export function canStartQuiz(progress: Progress): boolean {
  return getQuizPool(progress).length >= QUIZ_LENGTH;
}

export function buildQuiz(progress: Progress): QuizQuestion[] {
  return shuffle(getQuizPool(progress)).slice(0, QUIZ_LENGTH);
}
