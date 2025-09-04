import type { QuizQuestion } from '../types'

function decodeHtml(input: string): string {
	const parser = new DOMParser()
	const doc = parser.parseFromString(input, 'text/html')
	return doc.documentElement.textContent || input
}

function shuffle<T>(array: T[]): T[] {
	const copy = [...array]
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[copy[i], copy[j]] = [copy[j], copy[i]]
	}
	return copy
}

export async function fetchTrivia(amount: number, difficulty?: 'easy' | 'medium' | 'hard'): Promise<QuizQuestion[]> {
	const params = new URLSearchParams({ amount: String(amount), type: 'multiple' })
	if (difficulty) params.set('difficulty', difficulty)
	const url = `https://opentdb.com/api.php?${params.toString()}`
	const res = await fetch(url)
	if (!res.ok) throw new Error('Failed to fetch trivia')
	const json = await res.json()
	const results = Array.isArray(json?.results) ? json.results : []
	const mapped: QuizQuestion[] = results.map((r: any, idx: number) => {
		const questionText = decodeHtml(r.question)
		const correct = decodeHtml(r.correct_answer)
		const incorrect: string[] = (r.incorrect_answers || []).map((x: string) => decodeHtml(x))
		const options = shuffle([correct, ...incorrect])
		const correctIndex = options.findIndex(o => o === correct)
		return {
			id: `api-${Date.now()}-${idx}`,
			question: questionText,
			options,
			correctIndex: Math.max(0, correctIndex),
			difficulty: r.difficulty as any,
			category: decodeHtml(r.category || 'General'),
		}
	})
	return mapped
}

export function normalizeLocal(data: QuizQuestion[], amount: number): QuizQuestion[] {
	return data
		.filter(q => q.options?.length === 4)
		.slice(0, amount)
}
