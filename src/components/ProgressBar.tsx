import { motion } from 'framer-motion'

type Props = {
	value: number // 0..100
}

export default function ProgressBar({ value }: Props) {
	const safe = Math.max(0, Math.min(100, value))
	return (
		<div className="w-full h-2 bg-gray-200 rounded overflow-hidden" aria-label="Progress">
			<motion.div
				className="h-full bg-blue-600"
				initial={false}
				animate={{ width: `${safe}%` }}
				transition={{ type: 'spring', stiffness: 200, damping: 30 }}
			/>
		</div>
	)
}
