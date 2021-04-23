import { prop } from '@typegoose/typegoose'
import { Field, InputType, ObjectType, FieldResolver } from 'type-graphql'
import { ObjectId } from 'mongodb'

@InputType('MatchingCardInput')
@ObjectType()
export class MatchingCard {
	@prop()
	@Field()
	pairOne: string

	@prop()
	@Field()
	pairTwo: string
}
@InputType('MatchingInput')
@ObjectType()
export class Matching {
	@Field()
	readonly _id!: ObjectId

	@prop()
	@Field()
	prompt!: string

	@prop({ type: [MatchingCard] })
	@Field(() => [MatchingCard])
	matching: MatchingCard[]
}
