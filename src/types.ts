export type QuizQuestion = {
	id: string;
	question: string;
	options: string[]; // length 4
	correctIndex: number; // 0-3
	difficulty?: 'easy' | 'medium' | 'hard';
	category?: string;
};

export type UserAnswer = {
	questionId: string;
	selectedIndex: number | null; // null means no answer / timeout
	isCorrect: boolean;
	correctIndex: number;
};

export type QuizResult = {
	score: number;
	total: number;
	answers: UserAnswer[];
	bestScore?: number;
	questions?: QuizQuestion[];
};
