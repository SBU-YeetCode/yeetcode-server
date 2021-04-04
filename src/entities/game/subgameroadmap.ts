import { prop } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { Field, InputType, ObjectType, Int } from 'type-graphql'

@InputType('SubGameRoadmapInput')
@ObjectType()
export class SubGameRoadmap {
	@Field()
	readonly _id!: ObjectId

	@prop()
	@Field()
	refId!: string

	@prop()
	@Field(() => Int)
	sequence!: string

	@prop()
	@Field()
	kind!: string

	// @prop({ type: SubGameRoadmap })
	// @Field(() => [SubGameRoadmap])
	// matchings: SubGameRoadmap[]
}

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
