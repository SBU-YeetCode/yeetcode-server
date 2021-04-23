import * as faker from 'faker'
import { ObjectId } from 'mongodb'
import { GAMETYPE, Question } from '../../entities'

export const createQuestion = (question?: Partial<Question>): Question => {
	return {
		_id: new ObjectId(),
		title: faker.lorem.word(),
		description: faker.lorem.sentence(),
		timeLimit: faker.datatype.number(300),
		points: faker.datatype.number(100),
		lives: 3,
		hints: [],
		multipleChoice: {
			_id: new ObjectId(),
			correctChoice: 'Hello',
			incorrectChoices: ['bye'],
			prompt: 'adele sang this song',
		},
		gameType: GAMETYPE.MULTIPLECHOICE,
		...Question,
	}
}
