import { ObjectType, Field, Int, InputType } from 'type-graphql'
import { prop } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'

@InputType('StageProgressInput')
@ObjectType()
export class StageProgress {
	@prop()
	@Field()
	stageId: string

	@prop({ type: Boolean })
	@Field(() => Boolean)
	completed: boolean
}

