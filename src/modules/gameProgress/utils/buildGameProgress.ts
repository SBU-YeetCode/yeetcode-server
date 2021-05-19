import {
	Game,
	GameProgressInput,
	LevelProgress,
	QuestionProgress,
	StageProgress,
} from '../../../entities'

export default function buildGameProgress(
	game: Game,
	userId: string,
	prevPoints?: number
): GameProgressInput {
	let questions: QuestionProgress[] = []
	let stages: StageProgress[] = []
	let levels: LevelProgress[] = []

	for (const question of game.questions) {
		questions.push({
			questionId: question._id.toHexString(),
			completed: false,
			pointsReceived: 0,
			livesLeft: question.lives,
			hintsRevealed: [],
		})
	}

	for (const stage of game.stages) {
		stages.push({
			stageId: stage._id.toHexString(),
			completed: false,
		})
	}

	for (const level of game.levels) {
		levels.push({
			completed: false,
			levelId: level._id.toHexString(),
		})
	}

	return {
		gameId: game._id.toHexString(),
		isCompleted: false,
		userId: userId,
		completedAt: null,
		levels: levels,
		stages: stages,
		questions: questions,
		totalPoints: prevPoints ?? 0,
		codingLanguage: game.codingLanguage,
	}
}
