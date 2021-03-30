import { prop } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { Field, InputType, ObjectType, FieldResolver, Int } from 'type-graphql'

@InputType('PointsInput')
@ObjectType()
export class Points {
	@prop()
	@Field(() => Int)
	total!: number

	@prop()
	@Field(() => Int)
	javascript!: number

	@prop()
	@Field(() => Int)
	python!: number

	@prop()
	@Field(() => Int)
	c!: number

	@prop()
	@Field(() => Int)
	cpp: number

	@prop()
	@Field(() => Int)
	java: number
}
