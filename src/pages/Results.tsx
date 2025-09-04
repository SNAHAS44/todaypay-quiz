import { useLocation, useNavigate } from 'react-router-dom'
import type { QuizResult } from '../types'
import { motion } from 'framer-motion'

type Props = {
	onRestart: () => void
}

export default function ResultsPage({ onRestart }: Props) {
	const navigate = useNavigate()
	const location = useLocation()
	const state = (location.state ?? {}) as QuizResult

	if (!state || typeof state.score !== 'number') {
		return (
			<div>
				<p>No results to show.</p>
				<div className="mt-4">
					<button className="btn btn-primary" onClick={() => navigate('/quiz')}>Go to Quiz</button>
				</div>
			</div>
		)
	}

	const percentage = state.total ? Math.round((state.score / state.total) * 100) : 0

	return (
		<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
			<h2 className="text-xl font-semibold mb-2">Results</h2>
			<p className="text-gray-700 mb-1">You scored <span className="font-semibold">{state.score}</span>/{state.total} ({percentage}%)</p>
			{typeof state.bestScore === 'number' && (
				<p className="text-sm text-gray-600 mb-4">Best score: {state.bestScore}/{state.total}</p>
			)}

			<div className="space-y-3">
				{state.answers.map((ans, idx) => {
					const isCorrect = ans.isCorrect
					const q = state.questions?.[idx]
					const selectedLabel = ans.selectedIndex != null && q ? q.options[ans.selectedIndex] : '—'
					const correctLabel = q ? q.options[ans.correctIndex] : `${ans.correctIndex + 1}`
					return (
						<div key={idx} className={`rounded-xl border p-4 sm:p-5 ${isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
							<div className="flex items-start gap-2 mb-1">
								<span role="img" aria-label={isCorrect ? 'correct' : 'incorrect'} className="text-lg">
									{isCorrect ? '✅' : '❌'}
								</span>
								<div className="text-sm font-medium">Question {idx + 1}</div>
							</div>
							{q && <div className="text-sm mb-2">{q.question}</div>}
							<div className="text-sm font-medium">{isCorrect ? 'Correct' : 'Incorrect'}</div>
							<div className="mt-1 text-xs text-gray-700">Your answer: {selectedLabel} | Correct answer: {correctLabel}</div>
						</div>
					)
				})}
			</div>

			<div className="mt-6 flex gap-2">
				<button className="btn btn-secondary" onClick={() => navigate('/quiz')}>Back</button>
				<button className="btn btn-primary" onClick={onRestart}>Restart Quiz</button>
			</div>
		</motion.div>
	)
}
