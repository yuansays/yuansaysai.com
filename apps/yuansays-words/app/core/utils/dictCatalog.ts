export function uniqueTaggedDicts<T extends { id: string | number }>(groupByTag: Record<string, T[]>): T[] {
  const seen = new Set<string>()
  const dicts: T[] = []

  for (const taggedDicts of Object.values(groupByTag)) {
    for (const dict of taggedDicts) {
      const id = String(dict.id)
      if (seen.has(id)) continue
      seen.add(id)
      dicts.push(dict)
    }
  }

  return dicts
}
