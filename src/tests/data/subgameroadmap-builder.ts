import * as faker from 'faker'
import { ObjectId } from 'mongodb'
import { SubGameRoadmap } from '../../entities'

export const createSubGameRoadmap = (question?: Partial<SubGameRoadmap>): SubGameRoadmap => {
	return {
		_id: new ObjectId(),
        refId: 'testing123',
        sequence: '0',
        kind: 'question',
		...SubGameRoadmap,
	}
}
