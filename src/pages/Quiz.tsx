import { useMemo } from 'react'
import type { QuizQuestion, UserAnswer } from '../types'
import { motion } from 'framer-motion'

type Props = {
	questions: QuizQuestion[]
	currentIndex: number
	answers: UserAnswer[]
	loading: boolean
	error: string
	onSelect: (selectedIndex: number) => void
	onNext: () => void
	onPrev: () => void
	onFinish: () => void
}

export default function QuizPage({
	questions,
	currentIndex,
	answers,
	loading,
	error,
	onSelect,
	onNext,
	onPrev,
	onFinish,
}: Props) {
	const total = questions.length
	const question = questions[currentIndex]

	const selected = useMemo(() => {
		const existing = answers.find(a => a.questionId === question?.id)
		return existing?.selectedIndex ?? null
	}, [answers, question?.id])

	if (loading) {
		return <div>Loading questions…</div>
	}

	if (error) {
		return (
			<div>
				<p className="text-red-600 font-medium">{error}</p>
				<p className="text-sm text-gray-600 mt-2">Try refreshing the page.</p>
			</div>
		)
	}

	if (!question) {
		return <div>No questions available.</div>
	}

	function handleNext() {
		if (selected == null) return
		onNext()
	}

	const isLast = currentIndex === total - 1

	function onKeyDownOption(e: React.KeyboardEvent<HTMLButtonElement>, index: number) {
		// Left/Up selects previous, Right/Down selects next
		if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
			e.preventDefault()
			onSelect(Math.min(question.options.length - 1, (selected ?? 0) + 1))
		} else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
			e.preventDefault()
			onSelect(Math.max(0, (selected ?? 0) - 1))
		} else if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault()
			onSelect(index)
		}
	}

	return (
		<div>
			<div className="mb-6">
				<div className="flex items-center justify-between mb-2">
					<div className="text-sm text-gray-600">{question.category ?? 'General'}</div>
					<div className="text-xs uppercase tracking-wide text-gray-500">{question.difficulty ?? ''}</div>
				</div>
				<h2 className="text-xl font-semibold">{question.question}</h2>
			</div>

			<div className="grid gap-3 mb-6" role="radiogroup" aria-labelledby="options-label">
				<span id="options-label" className="sr-only">Choose one option</span>
				{question.options.map((opt, idx) => {
					const isSelected = selected === idx
					return (
						<motion.button
							key={idx}
							onClick={() => onSelect(idx)}
							onKeyDown={(e) => onKeyDownOption(e, idx)}
							role="radio"
							aria-checked={isSelected}
							className={`btn w-full text-left ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
							aria-label={`Option ${idx + 1}: ${opt}`}
							whileHover={{ scale: 1.01 }}
							whileTap={{ scale: 0.99 }}
						>
							{opt}
						</motion.button>
					)
				})}
			</div>

			{selected != null && (
				<div className="mb-4 text-sm text-gray-700">Selected: {question.options[selected]}</div>
			)}

			<div className="flex items-center justify-between">
				<motion.button className="btn btn-secondary disabled:opacity-50" onClick={onPrev} disabled={currentIndex === 0} whileHover={{ scale: currentIndex === 0 ? 1 : 1.02 }} whileTap={{ scale: currentIndex === 0 ? 1 : 0.98 }}>
					Previous
				</motion.button>
				<div className="flex gap-2">
					{!isLast ? (
						<motion.button
							className="btn btn-primary disabled:opacity-50"
							onClick={handleNext}
							disabled={selected == null}
							whileHover={{ scale: selected == null ? 1 : 1.02 }}
							whileTap={{ scale: selected == null ? 1 : 0.98 }}
						>
							Next
						</motion.button>
					) : (
						<motion.button className="btn btn-primary disabled:opacity-50" onClick={() => selected != null && onFinish()} disabled={selected == null} whileHover={{ scale: selected == null ? 1 : 1.02 }} whileTap={{ scale: selected == null ? 1 : 0.98 }}>
							Finish
						</motion.button>
					)}
				</div>
			</div>
		</div>
	)
}
