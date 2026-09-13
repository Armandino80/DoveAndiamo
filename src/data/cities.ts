import { citySeeds } from "@/data/cities/catalog";
import type { City, CityFact, CitySeed, PatronSaint } from "@/data/cityTypes";

export type { City, CityFact, FactCategory, PatronSaint } from "@/data/cityTypes";

const monthNames = [
  "januari",
  "februari",
  "maart",
  "april",
  "mei",
  "juni",
  "juli",
  "augustus",
  "september",
  "oktober",
  "november",
  "december",
] as const;

const populationFormatter = new Intl.NumberFormat("nl-NL");

function formatFeast(feast: string): string {
  const month = Number(feast.slice(0, 2));
  const day = Number(feast.slice(3, 5));
  const monthName = monthNames[month - 1];
  return monthName && day ? `${day} ${monthName}` : feast;
}

function baselineFacts(seed: CitySeed): CityFact[] {
  const saints = seed.patronSaints.map((saint) => saint.name).join(" en ");
  const feastDays = [...new Set(seed.patronSaints.map((saint) => formatFeast(saint.feast)))];

  return [
    {
      id: `${seed.id}-basis-populatie`,
      category: "stad & geografie",
      title: `Nummer ${seed.populationRank} van Italië`,
      text: `Op 1 januari 2025 telde ${seed.name} ongeveer ${populationFormatter.format(seed.population2025)} inwoners en stond de gemeente daarmee op plek ${seed.populationRank} van Italië.`,
    },
    {
      id: `${seed.id}-basis-regio`,
      category: "stad & geografie",
      title: `In ${seed.region}`,
      text: seed.role,
    },
    {
      id: `${seed.id}-basis-ligging`,
      category: "stad & geografie",
      title: "Op de kaart",
      text: seed.setting,
    },
    {
      id: `${seed.id}-basis-patroonheilige`,
      category: "tradities",
      title: seed.patronSaints.length > 1 ? "De patroonheiligen" : "De patroonheilige",
      text: `${seed.name} viert ${saints} als ${seed.patronSaints.length > 1 ? "patroonheiligen" : "patroonheilige"}; ${feastDays.length > 1 ? "hun feestdagen vallen" : "de feestdag valt"} op ${feastDays.join(" en ")}.`,
    },
    {
      id: `${seed.id}-basis-identiteit`,
      category: "kunst & cultuur",
      title: "De stad in één zin",
      text: seed.identity,
    },
  ];
}

function buildCity(seed: CitySeed): City {
  if (seed.facts.length !== 20) {
    throw new Error(
      `${seed.name} must contain exactly 20 curated facts; found ${seed.facts.length}.`,
    );
  }

  const curatedFacts: CityFact[] = seed.facts.map(([id, category, title, text]) => ({
    id,
    category,
    title,
    text,
  }));
  const facts = [...baselineFacts(seed), ...curatedFacts];
  const factIds = new Set(facts.map((fact) => fact.id));

  if (facts.length !== 25 || factIds.size !== facts.length) {
    throw new Error(`${seed.name} must expose 25 unique facts.`);
  }

  return {
    id: seed.id,
    name: seed.name,
    region: seed.region,
    image: seed.image,
    coordinates: seed.coordinates,
    patronSaints: seed.patronSaints,
    facts,
  };
}

const ranks = citySeeds.map((city) => city.populationRank);
const expectedRanks = Array.from({ length: 30 }, (_, index) => index + 1);

if (
  citySeeds.length !== 30 ||
  ranks.length !== new Set(ranks).size ||
  expectedRanks.some((rank) => !ranks.includes(rank))
) {
  throw new Error(
    "The city catalog must contain each of Italy's 2025 population ranks 1 through 30 exactly once.",
  );
}

export const cities: City[] = citySeeds.map(buildCity);

export function getCity(id: string): City | undefined {
  return cities.find((city) => city.id === id);
}

function feastMatches(date: Date, patronSaint: PatronSaint): boolean {
  const mmdd = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return patronSaint.feast === mmdd;
}

export function todaysFeastCities(date = new Date()): City[] {
  return cities.filter((city) => city.patronSaints.some((saint) => feastMatches(date, saint)));
}
