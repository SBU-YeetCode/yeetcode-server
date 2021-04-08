import {
	registerEnumType,
	ArgsType,
	Field,
	ObjectType,
	InputType,
	Int,
} from 'type-graphql'
import { Game, Level } from '../../entities'
import { PaginatedResponse } from '../utils/pagination'
import { Min, Max } from 'class-validator'

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

@InputType()
export class UpdateLevels {
	@Field(() => [Level])
	levels: Level[]
}
