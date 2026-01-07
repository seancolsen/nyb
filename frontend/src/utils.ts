export function buildOptions<Value extends string>(
  optionsMap: Record<Value, string>,
): { value: Value; label: string }[] {
  return Object.entries(optionsMap).map(([value, label]) => ({
    value: value as Value,
    label: label as string,
  }));
}
