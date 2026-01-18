import type { Comparison } from "@/api_types/Comparison";
import type { Measurement } from "@/api_types/Measurement";

function gt(value: number): Comparison {
  return { type: "gt", value };
}

function lt(value: number): Comparison {
  return { type: "lt", value };
}

const comparisonLookup: Record<Measurement["type"], Comparison> = {
  popularity: gt(0.8),
  count: gt(1000),
  denseRank: lt(10),
  femininity: gt(0.6),
  masculinity: gt(0.6),
  genderNeutrality: gt(0.7),
};

export function getDefaultComparison(
  measurementType: Measurement["type"],
): Comparison {
  return comparisonLookup[measurementType];
}
