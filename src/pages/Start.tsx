import { useState } from 'react'
import { motion } from 'framer-motion'

type Props = {
	onStart: (difficulty?: 'easy' | 'medium' | 'hard') => void
}

export default function StartPage({ onStart }: Props) {
	const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | undefined>('easy')

	return (
		<div className="min-h-[60vh] flex items-center justify-center">
			<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="w-full max-w-md">
				<h2 className="text-xl font-semibold mb-2">Start Quiz</h2>
				<p className="text-sm text-gray-600 mb-4">Choose a difficulty level and click Start to begin your quiz.</p>
				<div className="mb-4">
					<label htmlFor="difficulty" className="block text-sm text-gray-700 mb-1">Difficulty</label>
					<select
						id="difficulty"
						className="border rounded px-3 py-2 w-full"
						value={difficulty ?? ''}
						onChange={(e) => setDifficulty(e.target.value as any)}
					>
						<option value="easy">Easy</option>
						<option value="medium">Medium</option>
						<option value="hard">Hard</option>
					</select>
				</div>
				<motion.button
					className="btn btn-primary w-full"
					onClick={() => onStart(difficulty)}
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
				>
					Start Quiz
				</motion.button>
			</motion.div>
		</div>
	)
}
