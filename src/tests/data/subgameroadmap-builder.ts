import * as faker from 'faker'
import { ObjectId } from 'mongodb'
import { Roadmap } from '../../entities'

export const createRoadmap = (roadmap?: Partial<Roadmap>): Roadmap => {
	return {
		_id: new ObjectId(),
		parent: new ObjectId(),
		sequence: 0,
		kind: 'question',
		refId: new ObjectId().toHexString(),
		...roadmap,
	}
}
