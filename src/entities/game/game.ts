import { getModelForClass, Index, prop } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { Field, Float, InputType, Int, ObjectType } from 'type-graphql'
import { DateScalar } from '../../utils/scalars'
import { Level } from './level'
import { Question } from './question'
import { Stage } from './stage'
import { Roadmap } from './subgameroadmap'

@ObjectType()
@InputType('GameInput')
@Index({ title: 'text', description: 'text', tags: 'text', codingLanguage: 'text' }, {background: false})
@Index({playCount: 1}, {background: false})
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
	codingLanguage!: string

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

	@prop({ type: Roadmap })
	@Field(() => [Roadmap])
	roadmap: Roadmap[]
}

@ObjectType()
export class Game extends GameInput {
	@Field()
	readonly _id!: ObjectId
}

const GameModel = getModelForClass(Game)

GameModel.syncIndexes()