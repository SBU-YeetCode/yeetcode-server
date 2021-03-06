import { prop } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { Field, InputType, ObjectType, Int } from 'type-graphql'

@InputType('RoadmapInput')
@ObjectType()
export class RoadmapInput {
	@prop()
	@Field({ nullable: true })
	parent!: ObjectId

	@prop()
	@Field(() => Int)
	sequence!: number

	@prop()
	@Field(() => String)
	kind!: string

	@prop()
	@Field(() => String)
	refId: string
}

@InputType()
@ObjectType('RoadmapObject')
export class Roadmap extends RoadmapInput {
	@Field()
	readonly _id!: ObjectId
}

// const tempLevelId = new ObjectId()

// const temp: Roadmap[] = [
// 	{
// 		_id: tempLevelId,
// 		sequence: 0,
// 		kind: 'Level',
// 		parent: null,
// 	},
// 	{
// 		_id: new ObjectId(),
// 		sequence: 0,
// 		kind: 'Stage',
// 		parent: tempLevelId, //
// 	},
// 	{
// 		_id: new ObjectId(),
// 		sequence: 1,
// 		kind: 'Question',
// 		parent: tempLevelId, //
// 	},
// 	{
// 		_id: new ObjectId(),
// 		sequence: 1,
// 		kind: 'Level',
// 		parent: null,
// 	},
// 	{
// 		_id: new ObjectId(),
// 		sequence: 2,
// 		kind: 'Stage',
// 		parent: tempLevelId, //
// 	},
// ]

// interface Roadmap {
// 	_id: ObjectId
// 	sequence: number
// 	kind: 'Level' | 'Stage' | 'Question'
// 	parent: ObjectId | null
// }

/**
 *  roadmap: [LevelRoadmap]
 *  levelRoadmap: {
 * 	id:
 * 	position
 * stages: [StageRoadmap]
 * questions: [QuestionRoadmap]
 * }
 * stageRoadmap: {
 * id:
 * description:
 * questions: [QuestionRoadmap]
 * }
 *
 */
