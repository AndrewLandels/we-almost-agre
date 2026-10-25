import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createMemoryRepo, type MemoryData } from './memoryRepo'
import type { AgreeRepo, EventName } from './repo'

async function load(filePath: string): Promise<Pick<MemoryData, 'comparisons' | 'events'>> {
  try {
    const parsed = JSON.parse(await readFile(filePath, 'utf8')) as Partial<MemoryData>
    return {
      comparisons: Array.isArray(parsed.comparisons) ? parsed.comparisons : [],
      events: Array.isArray(parsed.events) ? parsed.events : [],
    }
  } catch {
    return { comparisons: [], events: [] }
  }
}

/** Local development store. Topics always come from the starter list in code. */
export async function createFileRepo(filePath = path.join(process.cwd(), '.data', 'agree.json')): Promise<AgreeRepo> {
  const state = await load(filePath)
  const memory = createMemoryRepo(state)
  let chain = Promise.resolve()

  const save = () => {
    const run = chain.then(async () => {
      await mkdir(path.dirname(filePath), { recursive: true })
      await writeFile(
        filePath,
        JSON.stringify({ comparisons: state.comparisons, events: state.events }, null, 2),
      )
    })
    chain = run.then(
      () => undefined,
      () => undefined,
    )
    return run
  }

  return {
    listTopics: () => memory.listTopics(),
    getTopic: (id) => memory.getTopic(id),
    getByCode: (code) => memory.getByCode(code),
    countStartsSince: (iso) => memory.countStartsSince(iso),
    listAnswerSets: (topicId) => memory.listAnswerSets(topicId),
    async insertComparison(row) {
      await memory.insertComparison(row)
      await save()
    },
    async setFriendAnswers(code, answers, tokenHash, completedAt) {
      const ok = await memory.setFriendAnswers(code, answers, tokenHash, completedAt)
      if (ok) await save()
      return ok
    },
    async incrementShare(code) {
      await memory.incrementShare(code)
      await save()
    },
    async addEvent(name: EventName, topicId: string, code: string, at: string) {
      await memory.addEvent(name, topicId, code, at)
      await save()
    },
  }
}
