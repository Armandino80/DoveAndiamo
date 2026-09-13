import { cities, type FactCategory } from "@/data/cities";
import { getCityProgress, type Progress } from "@/lib/progress";

export type AwardKind = "ontdekken" | "quiz" | "ludiek" | "regio";

export interface Award {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlocked: boolean;
  kind: AwardKind;
  progressLabel?: string;
}

function seenFactIds(progress: Progress): Set<string> {
  return new Set(cities.flatMap((city) => getCityProgress(progress, city.id).seenFactIds));
}

function visitedCityIds(progress: Progress): Set<string> {
  return new Set(
    cities.filter((city) => getCityProgress(progress, city.id).visits > 0).map((city) => city.id),
  );
}

function categoryFacts(category: FactCategory) {
  return cities.flatMap((city) => city.facts.filter((fact) => fact.category === category));
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getAwards(progress: Progress): Award[] {
  const seen = seenFactIds(progress);
  const visited = visitedCityIds(progress);
  const allFacts = cities.flatMap((city) => city.facts);
  const foodFacts = categoryFacts("eten");
  const cultureFacts = categoryFacts("kunst & cultuur");
  const highDuomoIds = new Set(["firenze", "milano"]);
  const duomoCities = cities.filter((city) => highDuomoIds.has(city.id));

  const regions = Array.from(new Set(cities.map((city) => city.region))).sort();
  const regionAwards: Award[] = regions.map((region) => {
    const regionCities = cities.filter((city) => city.region === region);
    const visitedInRegion = regionCities.filter((city) => visited.has(city.id)).length;

    return {
      id: `regione-${slugify(region)}`,
      name: `Regione completa: ${region}`,
      emoji: "🗺️",
      description: `Ontdek alle steden uit ${region} die in La Dolce Scoperta zitten.`,
      unlocked: visitedInRegion === regionCities.length,
      kind: "regio",
      progressLabel: `${visitedInRegion}/${regionCities.length} steden`,
    };
  });

  return [
    {
      id: "primo-passo",
      name: "Primo passo",
      emoji: "👣",
      description: "Ontdek je eerste Italiaanse stad.",
      unlocked: visited.size >= 1,
      kind: "ontdekken",
      progressLabel: `${visited.size}/${cities.length} steden bezocht`,
    },
    {
      id: "giro-espresso",
      name: "Giro corto, espresso lungo",
      emoji: "☕",
      description: "Bezoek iedere stad die momenteel in de app zit.",
      unlocked: visited.size === cities.length,
      kind: "ludiek",
      progressLabel: `${visited.size}/${cities.length} steden`,
    },
    {
      id: "biblioteca-tascabile",
      name: "Biblioteca tascabile",
      emoji: "📚",
      description: "Ontdek minstens zes verschillende weetjes.",
      unlocked: seen.size >= 6,
      kind: "ontdekken",
      progressLabel: `${Math.min(seen.size, 6)}/6 weetjes`,
    },
    {
      id: "enciclopedia-italiana",
      name: "Enciclopedia italiana",
      emoji: "🧠",
      description: "Ontdek ieder weetje dat momenteel in de app zit.",
      unlocked: allFacts.every((fact) => seen.has(fact.id)),
      kind: "ontdekken",
      progressLabel: `${seen.size}/${allFacts.length} weetjes`,
    },
    {
      id: "non-spaghetti-bolognese",
      name: "Non chiamarla spaghetti bolognese",
      emoji: "🍝",
      description: "Ontdek alle weetjes in de categorie eten.",
      unlocked: foodFacts.length > 0 && foodFacts.every((fact) => seen.has(fact.id)),
      kind: "ludiek",
      progressLabel: `${foodFacts.filter((fact) => seen.has(fact.id)).length}/${foodFacts.length} eetweetjes`,
    },
    {
      id: "cultura-senza-fine",
      name: "Cultura senza fine",
      emoji: "🎨",
      description: "Ontdek alle kunst- en cultuurweetjes.",
      unlocked: cultureFacts.length > 0 && cultureFacts.every((fact) => seen.has(fact.id)),
      kind: "ontdekken",
      progressLabel: `${cultureFacts.filter((fact) => seen.has(fact.id)).length}/${cultureFacts.length} cultuurweetjes`,
    },
    {
      id: "testa-tra-le-nuvole",
      name: "Testa tra le nuvole",
      emoji: "⛪",
      description:
        "Bezoek Firenze en Milano — de steden in de huidige collectie met een duomo boven de 100 meter.",
      unlocked: duomoCities.length > 0 && duomoCities.every((city) => visited.has(city.id)),
      kind: "ludiek",
      progressLabel: `${duomoCities.filter((city) => visited.has(city.id)).length}/${duomoCities.length} hoge-duomo-steden`,
    },
    {
      id: "streak-3",
      name: "Tre di fila",
      emoji: "🔥",
      description: "Beantwoord drie quizvragen achter elkaar goed.",
      unlocked: progress.quiz.bestStreak >= 3,
      kind: "quiz",
      progressLabel: `Beste reeks: ${progress.quiz.bestStreak}`,
    },
    {
      id: "streak-5",
      name: "Cinque di fila",
      emoji: "🌶️",
      description: "Beantwoord vijf quizvragen achter elkaar goed.",
      unlocked: progress.quiz.bestStreak >= 5,
      kind: "quiz",
      progressLabel: `Beste reeks: ${progress.quiz.bestStreak}`,
    },
    {
      id: "streak-10",
      name: "Dieci e lode",
      emoji: "⚡",
      description: "Beantwoord tien quizvragen achter elkaar goed.",
      unlocked: progress.quiz.bestStreak >= 10,
      kind: "quiz",
      progressLabel: `Beste reeks: ${progress.quiz.bestStreak}`,
    },
    {
      id: "perfect-score",
      name: "Professore per un giorno",
      emoji: "🏆",
      description: "Scoor 10 uit 10 in één quizronde.",
      unlocked: progress.quiz.bestScore >= 10,
      kind: "quiz",
      progressLabel: `Beste score: ${progress.quiz.bestScore}/10`,
    },
    {
      id: "quiz-veteran",
      name: "Ancora una domanda!",
      emoji: "🎯",
      description: "Rond vijf volledige quizzen af.",
      unlocked: progress.quiz.completed >= 5,
      kind: "quiz",
      progressLabel: `${progress.quiz.completed}/5 quizzen`,
    },
    {
      id: "quiz-25",
      name: "Il saputello simpatico",
      emoji: "🤓",
      description: "Geef in totaal 25 goede quizantwoorden.",
      unlocked: progress.quiz.totalCorrect >= 25,
      kind: "quiz",
      progressLabel: `${progress.quiz.totalCorrect}/25 goede antwoorden`,
    },
    ...regionAwards,
  ];
}
