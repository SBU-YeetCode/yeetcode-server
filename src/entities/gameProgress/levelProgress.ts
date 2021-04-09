import { ObjectType, Field, Int, InputType } from 'type-graphql'
import { prop } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'

@InputType('LevelProgressInput')
@ObjectType()
export class LevelProgress {

	@prop()
	@Field()
	levelId: string

	@prop({ type: Boolean })
	@Field(() => Boolean)
	completed: boolean
}


