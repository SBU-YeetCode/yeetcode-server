import { prop } from '@typegoose/typegoose'
import { Field, InputType, ObjectType, FieldResolver } from 'type-graphql'
import { ObjectId } from 'mongodb'

@InputType('LevelInput')
@ObjectType()
export class Level {
	@Field()
	readonly _id!: ObjectId

	@prop()
	@Field()
	title: string

	@prop()
	@Field()
	description: string
}