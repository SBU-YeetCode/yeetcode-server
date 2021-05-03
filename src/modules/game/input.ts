import {
	registerEnumType,
	ArgsType,
	Field,
	ObjectType,
	Int,
} from 'type-graphql'
import { Game } from '../../entities'
import { PaginatedResponse } from '../utils/pagination'
import { Min, Max } from 'class-validator'
import { ObjectId } from 'mongodb'

@ObjectType()
export class PaginatedGameResponse extends PaginatedResponse(Game) {}

enum LANGUAGES {
	C = 'c',
	CPP = 'cpp',
	JAVASCRIPT = 'javascript',
	JAVA = 'java',
	PYTHON = 'python',
}

registerEnumType(LANGUAGES, {
	name: 'LANGUAGES',
})

enum SORT_OPTIONS {
	RATING = 'rating',
	NEWEST = 'newest',
	PLAY_COUNT = 'play_count',
}

registerEnumType(SORT_OPTIONS, {
	name: 'SORT_OPTIONS',
})

export { LANGUAGES, SORT_OPTIONS }

@ArgsType()
export class GetFilterGamesInput {
	@Min(-1)
	@Max(1)
	@Field(() => Int, { defaultValue: 1, nullable: true })
	sortDir: number | null

	@Field(() => LANGUAGES, { nullable: true })
	language: LANGUAGES | null

	@Field(() => SORT_OPTIONS, { nullable: true })
	sort: SORT_OPTIONS | null
}

@ArgsType()
export class UpdateGame {
	@Field()
	readonly gameId!: ObjectId

	@Field({ nullable: true })
	newCodingLanguage?: string

	@Field({ nullable: true })
	newTitle?: string

	@Field({ nullable: true })
	newDifficulty?: string

	@Field(() => [String], { nullable: true })
	newTags?: string[]

	@Field({ nullable: true })
	newDescription?: string
}

@ArgsType()
export class NewGame {
	@Field({ nullable: true })
	codingLanguage: string

	@Field({ nullable: true })
	title: string

	@Field({ nullable: true })
	difficulty: string

	@Field(() => [String], { nullable: true })
	tags: string[]

	@Field({ nullable: true })
	description: string
}

@ArgsType()
export class NewInstance {
	// @Field({ nullable: true })
	// readonly parentId?: ObjectId

	@Field()
	title!: string

	@Field()
	kind!: string

	@Field({ nullable: true })
	roadmapId?: string
}
