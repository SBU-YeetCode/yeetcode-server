import { prop } from '@typegoose/typegoose'
import { Field, InputType, ObjectType, FieldResolver } from 'type-graphql'
import { ObjectId } from 'mongodb'

@InputType('StageInput')
@ObjectType()
export class StageInput {
	@prop()
	@Field()
	title: string

	@prop()
	@Field()
	description: string
}

@InputType()
@ObjectType('StageObject')
export class Stage extends StageInput {
	@Field()
	readonly _id!: ObjectId
}
