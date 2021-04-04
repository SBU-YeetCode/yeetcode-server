import { prop } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { Field, InputType, ObjectType, Int, Float } from 'type-graphql'
import { Level } from './level'
import { Stage } from './stage'
import { Question } from './question'
import { SubGameRoadmap } from './subgameroadmap'
import { DateScalar } from '../../utils/scalars'

@ObjectType()
@InputType('GameInput')
export class GameInput {
	@prop()
	@Field()
	createdBy!: string

	@prop({ type: Date })
	@Field(() => DateScalar)
	dateCreated!: string

	@prop({ type: Date })
	@Field(() => DateScalar)
	lastUpdated!: string

	@prop()
	@Field(() => Int)
	commentCount!: number

	@prop()
	@Field(() => Int)
	totalStars!: number

	@prop()
	@Field(() => Float)
	rating!: number

	@prop()
	@Field(() => Int)
	playCount!: number

	@prop({ type: () => [String] })
	@Field(() => [String])
	commentsRef!: string[]

	@prop()
	@Field()
	language!: string

	@prop()
	@Field()
	title!: string

	@prop()
	@Field()
	difficulty: string

	@prop({ type: () => [String] })
	@Field(() => [String])
	tags!: string[]

	@prop()
	@Field()
	description: string

	@prop({ type: Level })
	@Field(() => [Level])
	levels: Level[]

	@prop({ type: Stage })
	@Field(() => [Stage])
	stages: Stage[]

	@prop({ type: Question })
	@Field(() => [Question])
	questions: Question[]

	@prop({ type: SubGameRoadmap })
	@Field(() => [SubGameRoadmap])
	roadmap: SubGameRoadmap[]
}

@ObjectType()
export class Game extends GameInput {
	@Field()
	readonly _id!: ObjectId
}
