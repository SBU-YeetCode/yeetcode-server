import { ObjectType, Field, Int } from 'type-graphql'

@ObjectType()
export class Deleted {
	@Field()
	success: boolean
	@Field(() => String, { nullable: true })
	err: string | null
	@Field(() => Int)
	amountDeleted: number
}

@ObjectType()
export class SubmitQuestion {
	@Field()
	isCorrect: boolean
}
