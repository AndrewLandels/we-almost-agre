const BANNED = [
  /\byou should\b/i,
  /\bbuy this\b/i,
  /\bsell this\b/i,
  /\bwe recommend\b/i,
  /\bbased on our advice\b/i,
  /\bguaranteed\b/i,
]

export function bannedLanguageHits(text: string): string[] {
  return BANNED.filter((pattern) => pattern.test(text)).map((pattern) => String(pattern))
}

export function assertEducationalCopy(text: string, label = 'copy'): void {
  const hits = bannedLanguageHits(text)
  if (hits.length) {
    throw new Error(`${label} uses banned advice wording: ${hits.join(', ')}`)
  }
}
