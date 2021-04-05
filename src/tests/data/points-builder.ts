import * as faker from 'faker'
import { ObjectId } from 'mongodb'
import { Points, User } from '../../entities'

export const createPoints = (points?: Partial<Points>): Points => {
	const pointObj: Points = {
		c: 0,
		cpp: 0,
		java: 0,
		javascript: 0,
		python: 0,
		total: 0,
	}
	// Set points
	for (const [key, value] of Object.entries(pointObj)) {
		if (key != 'total') {
			const langPoints = faker.datatype.number(100)
			pointObj.total += langPoints
			pointObj[key] = langPoints
		}
	}
	return pointObj
}
