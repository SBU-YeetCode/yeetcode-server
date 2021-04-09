import * as faker from 'faker'
import { ObjectId } from 'mongodb'
import { GameProgress } from '../../entities'

export const createGameProgress = (
	gameProgress?: Partial<GameProgress>
): GameProgress => {
	return {
		_id: new ObjectId(),
		completedAt: faker.date.past().toISOString(),
		gameId: 'game123',
		levels: [],
		questions: [],
		stages: [],
		isCompleted: faker.datatype.boolean(),
		startedAt: faker.date.recent().toISOString(),
		userId: 'user123',
		codingLanguage: 'javascript',
		totalPoints: 0,
		...gameProgress,
	}
}
