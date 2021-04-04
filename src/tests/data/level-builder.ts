import * as faker from 'faker'
import { ObjectId } from 'mongodb'
import { Level } from '../../entities'

export const createLevel = (level?: Partial<Level>): Level => {
	return {
		_id: new ObjectId(),
		title: faker.lorem.word(),
		description: faker.lorem.sentence(),
		...level,
	}
}
