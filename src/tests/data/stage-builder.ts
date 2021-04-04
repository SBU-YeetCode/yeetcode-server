import * as faker from 'faker'
import { ObjectId } from 'mongodb'
import { Stage } from '../../entities'

export const createStage = (stage?: Partial<Stage>): Stage => {
	return {
		_id: new ObjectId(),
		title: faker.lorem.word(),
		description: faker.lorem.sentence(),
		...stage,
	}
}
