import type { Moderator, Moderatoren } from '@/types/Moderatorenliste'

function countModerators(dictionary: Moderatoren[]): Moderator[] {
  const moderatorCounts: { [name: string]: number } = {}

  for (const entry of dictionary) {
    const { moderator1, moderator2 } = entry

    if (moderator1 === '-' || moderator1 === ' -') continue

    if (moderator1 in moderatorCounts) {
      moderatorCounts[moderator1]++
    } else {
      moderatorCounts[moderator1] = 1
    }

    if (moderator2 == '-' || moderator2 === ' -') continue

    if (moderator2 in moderatorCounts) {
      moderatorCounts[moderator2]++
    } else {
      moderatorCounts[moderator2] = 1
    }
  }

  const moderators: Moderator[] = []
  for (const moderator in moderatorCounts) {
    moderators.push({ moderator, amount: moderatorCounts[moderator] })
  }

  return moderators
}

export { countModerators }
