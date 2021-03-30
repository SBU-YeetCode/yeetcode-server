import { ObjectType, Field, Int, InputType } from 'type-graphql'
import { prop } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { LevelProgress } from './levelProgress'
import { StageProgress } from './stageProgress'
import { QuestionProgress } from './questionProgress'

@InputType('GameProgressInput')
@ObjectType()
export class GameProgress {
	@Field()
	readonly _id: ObjectId

	@prop()
	@Field()
	userId: string

	@prop()
	@Field()
	gameId: string

	// date
	@prop({ type: Number })
	@Field(() => Int)
	startedAt: number
	// date
	@prop({ type: Number })
	@Field(() => Int)
	completedAt: number

	@prop({ type: () => [LevelProgress] })
	@Field(() => [LevelProgress])
	levels: [LevelProgress]

	@prop({ type: () => [StageProgress] })
	@Field(() => [StageProgress])
	stages: [StageProgress]

	@prop({ type: () => [QuestionProgress] })
	@Field(() => [QuestionProgress])
	questions: [QuestionProgress]
}
