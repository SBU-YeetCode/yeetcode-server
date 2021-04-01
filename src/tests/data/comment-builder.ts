import * as faker from 'faker'
import { ObjectId } from 'mongodb'
import { Comment } from '../../entities'

export const createComment = (comment?: Partial<Comment>): Comment => {
	return {
		_id: new ObjectId(),
		dateCreated: faker.date.past().getTime(),
		gameId: 'game123',
		lastUpdated: faker.date.past().getTime(),
		rating: faker.datatype.number(5),
		review: faker.lorem.paragraph(3),
		userId: 'user123',
		...comment,
	}
}
