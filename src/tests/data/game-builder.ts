import * as faker from 'faker'
import { ObjectId } from 'mongodb'
import { Game } from '../../entities'

export const createGame = (game?: Partial<Game>): Game => {
	// const { levels, stages, questions, roadmap, ...other } = game
	const dateCreation = faker.date.past().toISOString()
	return {
		_id: new ObjectId(),
		createdBy: faker.name.findName(),
		dateCreated: dateCreation,
		lastUpdated: dateCreation,
		commentCount: faker.datatype.number(100),
		totalStars: faker.datatype.number(5),
		playCount: faker.datatype.number(),
		rating: faker.datatype.number(5),
		commentsRef: ['testing123'],
		codingLanguage: 'python',
		title: 'game123',
		difficulty: 'easy',
		tags: ['tags'],
		description: faker.lorem.sentence(),
		levels: [],
		stages: [],
		questions: [],
		roadmap: [],
		...game,
	}
}
