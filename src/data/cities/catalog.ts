import type { CitySeed } from "@/data/cityTypes";
import { centralCities } from "./central";
import { northCities } from "./north";
import { southCities } from "./south";

export const citySeeds: CitySeed[] = [...northCities, ...centralCities, ...southCities].sort(
  (a, b) => a.populationRank - b.populationRank,
);
