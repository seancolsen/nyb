import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

export function buildOptions<Value extends string>(
  optionsMap: Record<Value, string>,
): { value: Value; label: string }[] {
  return Object.entries(optionsMap).map(([value, label]) => ({
    value: value as Value,
    label: label as string,
  }));
}

export function match<
  P extends string,
  O,
  V extends Record<P, string> & O,
  C extends { [K in V[P]]: (v: Extract<V, Record<P, K>>) => unknown },
>(value: V, property: P, cases: C) {
  return cases[value[property]](
    value as Extract<V, Record<P, string>>,
  ) as ReturnType<C[keyof C]>;
}

export function exhaustive(value: never): never {
  throw new Error(`Exhaustive condition error ${JSON.stringify(value)}`);
}

export function capitalize(s: string): string {
  if (s.length === 0) return "";
  return s[0].toUpperCase() + s.slice(1);
}
