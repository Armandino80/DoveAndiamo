export type FactCategory =
  | "eten"
  | "literatuur"
  | "voetbal & sport"
  | "film"
  | "geschiedenis"
  | "kunst & cultuur"
  | "muziek"
  | "bekende personen"
  | "tradities"
  | "stad & geografie"
  | "architectuur"
  | "wetenschap & onderwijs"
  | "economie & innovatie";

export interface CityFact {
  id: string;
  category: FactCategory;
  title: string;
  text: string;
}

export interface PatronSaint {
  name: string;
  /** "MM-DD" — feast day, checked against today's local date */
  feast: string;
}

export interface City {
  id: string;
  name: string;
  region: string;
  image: string;
  /** Official geographic coordinates (WGS84) */
  coordinates: { lat: number; lng: number };
  patronSaints: PatronSaint[];
  facts: CityFact[];
}

export type FactSeed = readonly [id: string, category: FactCategory, title: string, text: string];

export interface CitySeed {
  id: string;
  name: string;
  region: string;
  image: string;
  coordinates: { lat: number; lng: number };
  patronSaints: PatronSaint[];
  /** Rank among Italian comuni by 2025-01-01 resident population. */
  populationRank: number;
  /** Resident population estimate/reference value at 2025-01-01. */
  population2025: number;
  /** Administrative role inside the region/province. */
  role: string;
  /** Concise geographic context for the city. */
  setting: string;
  /** A distinctive one-sentence introduction to the city. */
  identity: string;
  /** Twenty curated stories; five baseline facts are added in cities.ts. */
  facts: FactSeed[];
}
