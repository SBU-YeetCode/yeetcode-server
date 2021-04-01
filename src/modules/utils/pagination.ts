import { Min, Max } from 'class-validator'
import { ArgsType, Field, Int, ObjectType, ClassType } from 'type-graphql'

@ArgsType()
export class PaginationInput {
	@Min(1)
	@Max(100)
	@Field(() => Int, { defaultValue: 10 })
	amount: number

	@Field(() => String, { nullable: true })
	cursor: string
}
export function PaginatedResponse<TItem>(TItemClass: ClassType<TItem>) {
	// `isAbstract` decorator option is mandatory to prevent registering in schema
	@ObjectType({ isAbstract: true })
	abstract class PaginatedResponseClass {
		// here we use the runtime argument
		@Field((type) => [TItemClass])
		// and here the generic type
		nodes: TItem[]

		// @Field((type) => Int)
		// total: number

		@Field()
		hasMore: boolean

		@Field(() => String, { nullable: true })
		nextCursor: string | null
	}
	return PaginatedResponseClass
}
