import { ArgsType, Field, InputType } from 'type-graphql'
import IsValidUser from '../validators/isValidUser'
// import IsValidGameProgress from '../validators/isValidGameProgress'
import IsValidGame from '../validators/isValidGame'
import { ObjectId } from 'mongodb'
import { MatchingCard } from '../../entities'

@ArgsType()
export class CreateGameProgress {
	@IsValidUser()
	@Field(() => ObjectId)
	userId: ObjectId

	@IsValidGame()
	@Field(() => String)
	gameId: string
}

@ArgsType()
export class DeleteGameProgress {
	@IsValidUser()
	@Field(() => ObjectId)
	userId: ObjectId

	// @IsValidGameProgress()
	@Field(() => String)
	gameProgressId: string
}

@InputType()
export class SubmittedAnswer {
	@Field(() => String, { nullable: true })
	multipleChoice?: string

	@Field(() => [String], { nullable: true })
	fillInTheBlank?: string[]

	@Field(() => String, { nullable: true })
	spotTheBug?: string

	@Field(() => String, { nullable: true })
	liveCoding?: string

	@Field(() => [MatchingCard], { nullable: true })
	matching?: MatchingCard[]
}

@ArgsType()
export class SubmitGameInput {
	@IsValidUser()
	@Field(() => ObjectId)
	userId: ObjectId

	@IsValidGame()
	@Field(() => String)
	gameId: string

	@Field(() => String)
	questionId: string

	@Field(() => SubmittedAnswer)
	submittedAnswer: SubmittedAnswer
}
