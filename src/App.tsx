import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import QuizPage from './pages/Quiz'
import ResultsPage from './pages/Results'
import StartPage from './pages/Start'
import ProgressBar from './components/ProgressBar'
import type { QuizQuestion, QuizResult, UserAnswer } from './types'
import localData from './data/questions.json'
import { fetchTrivia, normalizeLocal } from './utils/trivia'

const QUESTION_TIME_SECONDS = 30
const QUESTION_COUNT = 10

function App() {
	const navigate = useNavigate()
	const location = useLocation()
	const isQuizRoute = location.pathname.startsWith('/quiz')
	const [questions, setQuestions] = useState<QuizQuestion[]>([])
	const [currentIndex, setCurrentIndex] = useState<number>(0)
	const [answers, setAnswers] = useState<UserAnswer[]>([])
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string>('')
	const [secondsLeft, setSecondsLeft] = useState<number>(QUESTION_TIME_SECONDS)
	const timerRef = useRef<number | null>(null)

	const total = questions.length
	const progressText = useMemo(() => `Question ${Math.min(currentIndex + 1, total)} of ${total || QUESTION_COUNT}`, [currentIndex, total])
	const progressPercent = useMemo(() => (total ? Math.round(((currentIndex) / total) * 100) : 0), [currentIndex, total])

	async function startQuiz(difficulty?: 'easy' | 'medium' | 'hard') {
		setLoading(true)
		setError('')
		try {
			let qs = await fetchTrivia(QUESTION_COUNT, difficulty)
			if (!qs?.length) throw new Error('Empty API data')
			setQuestions(qs)
		} catch (e) {
			const fallback = normalizeLocal(localData as QuizQuestion[], QUESTION_COUNT)
			setQuestions(fallback)
		} finally {
			setCurrentIndex(0)
			setAnswers([])
			setSecondsLeft(QUESTION_TIME_SECONDS)
			setLoading(false)
			navigate('/quiz')
		}
	}

	useEffect(() => {
		if (!isQuizRoute || loading || !total) {
			if (timerRef.current) {
				window.clearInterval(timerRef.current)
				timerRef.current = null
			}
			return
		}
		if (timerRef.current) window.clearInterval(timerRef.current)
		setSecondsLeft(QUESTION_TIME_SECONDS)
		timerRef.current = window.setInterval(() => {
			setSecondsLeft(prev => {
				if (prev <= 1) {
					window.clearInterval(timerRef.current!)
					timerRef.current = null
					autoLockAndAdvance()
					return QUESTION_TIME_SECONDS
				}
				return prev - 1
			})
		}, 1000)
		return () => {
			if (timerRef.current) {
				window.clearInterval(timerRef.current)
				timerRef.current = null
			}
		}
	}, [currentIndex, total, loading, isQuizRoute])

	function recordAnswer(selectedIndex: number | null) {
		const question = questions[currentIndex]
		if (!question) return
		const isCorrect = selectedIndex != null && selectedIndex === question.correctIndex
		const newAnswer: UserAnswer = {
			questionId: question.id,
			selectedIndex,
			isCorrect,
			correctIndex: question.correctIndex,
		}
		const existingIndex = answers.findIndex(a => a.questionId === question.id)
		let nextAnswers = [...answers]
		if (existingIndex >= 0) nextAnswers[existingIndex] = newAnswer
		else nextAnswers.push(newAnswer)
		setAnswers(nextAnswers)
	}

	function selectAnswer(selectedIndex: number) {
		recordAnswer(selectedIndex)
	}

	function autoLockAndAdvance() {
		recordAnswer(null)
		if (currentIndex < total - 1) setCurrentIndex(i => i + 1)
		else handleFinish()
	}

	function goNext() {
		if (currentIndex < total - 1) setCurrentIndex(i => i + 1)
		else handleFinish()
	}

	function goPrev() {
		if (currentIndex > 0) setCurrentIndex(i => i - 1)
	}

	function handleFinish() {
		if (timerRef.current) {
			window.clearInterval(timerRef.current)
			timerRef.current = null
		}
		const score = answers.filter(a => a.isCorrect).length
		const bestScore = Math.max(score, Number(localStorage.getItem('bestScore') || 0))
		localStorage.setItem('bestScore', String(bestScore))
		const result: QuizResult = { score, total, answers, bestScore, questions }
		navigate('/results', { state: result })
	}

	function handleRestart() {
		setQuestions([])
		setCurrentIndex(0)
		setAnswers([])
		setSecondsLeft(QUESTION_TIME_SECONDS)
		navigate('/', { replace: true })
	}

	return (
		<div className="app-container">
			<div className="card">
				<h1 className="text-2xl font-semibold mb-2">TodayPay Quiz</h1>
				{isQuizRoute && (
					<>
						<p className="text-sm text-gray-500 mb-4">{total > 0 ? progressText : 'Loading...'}</p>
						<ProgressBar value={progressPercent} />
					</>
				)}
				<Routes>
					<Route path="/" element={<StartPage onStart={startQuiz} />} />
					<Route
						path="/quiz"
						element={
							<QuizPage
								questions={questions}
								currentIndex={currentIndex}
								answers={answers}
								loading={loading}
								error={error}
								onSelect={selectAnswer}
								onNext={goNext}
								onPrev={goPrev}
								onFinish={handleFinish}
							/>
						}
					/>
					<Route path="/results" element={<ResultsPage onRestart={handleRestart} />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
				{isQuizRoute && (
					<div className="mt-4 text-sm text-gray-600">Time left: {secondsLeft}s</div>
				)}
			</div>
		</div>
	)
}

export default App
