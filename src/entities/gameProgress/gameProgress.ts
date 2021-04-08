import { ObjectType, Field, Int, InputType } from 'type-graphql'
import { prop } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { LevelProgress } from './levelProgress'
import { StageProgress } from './stageProgress'
import { QuestionProgress } from './questionProgress'
import { DateScalar } from '../../utils/scalars'

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

	@prop({ type: Date })
	@Field(() => DateScalar)
	startedAt: string

	@prop({ type: Date })
	@Field(() => DateScalar)
	completedAt: string

	@prop()
	@Field()
	isCompleted: boolean

	@prop({ type: () => [LevelProgress] })
	@Field(() => [LevelProgress])
	levels: LevelProgress[]

	@prop({ type: () => [StageProgress] })
	@Field(() => [StageProgress])
	stages: StageProgress[]

	@prop({ type: () => [QuestionProgress] })
	@Field(() => [QuestionProgress])
	questions: QuestionProgress[]
}
