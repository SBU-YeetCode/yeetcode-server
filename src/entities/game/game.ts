import { prop } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { Field, InputType, ObjectType, Int } from 'type-graphql'
import { Level } from './level'
import { Stage } from './stage'
import { Question } from './question'
import { SubGameRoadmap } from './subgameroadmap'

@ObjectType('Game')
@InputType('GameInput')
export class Game {
	@Field()
	readonly _id!: ObjectId

	@prop()
	@Field()
	createdBy!: string

	@prop()
	@Field(() => Int)
	dateCreated!: number

	@prop()
	@Field(() => Int)
	lastUpdated!: number

	@prop()
	@Field(() => Int)
	commentCount!: number

	@prop()
	@Field(() => Int)
	totalStars!: number

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
