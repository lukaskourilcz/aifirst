// Returns `word` for n === 1, otherwise `word + suffix`.
export function plural(n: number, word: string, suffix = "s"): string {
  return n === 1 ? word : `${word}${suffix}`;
}
