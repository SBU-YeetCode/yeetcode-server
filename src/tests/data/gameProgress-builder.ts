import * as faker from 'faker'
import { ObjectId } from 'mongodb'
import { GameProgress } from '../../entities'

export const createGameProgress = (
	gameProgress?: Partial<GameProgress>
): GameProgress => {
	return {
		_id: new ObjectId(),
		completedAt: faker.date.past().getTime(),
		gameId: 'game123',
		levels: [],
		questions: [],
		stages: [],
		startedAt: faker.date.recent().getTime(),
		userId: 'user123',
		...gameProgress,
	}
}
