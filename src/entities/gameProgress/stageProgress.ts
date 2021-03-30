import { ObjectType, Field, Int, InputType } from 'type-graphql'
import { prop } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'

@InputType('StageProgressInput')
@ObjectType()
export class StageProgress {
	@Field()
	readonly _id: ObjectId

	@prop()
	@Field()
	levelId: string

	@prop({ type: Boolean })
	@Field(() => Boolean)
	completed: boolean
}
