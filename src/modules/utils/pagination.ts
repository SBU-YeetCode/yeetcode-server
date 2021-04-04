import { Min, Max } from 'class-validator'
import { ArgsType, Field, Int, ObjectType, ClassType } from 'type-graphql'
import { ObjectId } from 'mongodb'
import { Types } from 'mongoose'

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
interface VI {
	_id: ObjectId
}
export function cursorMatch<V extends VI, T extends keyof V>(
	variable: keyof V,
	sortDir: number,
	obj: V,
	cb?: (v: V[T]) => any
) {
	const val = sortDir === 1 ? '$gt' : '$lt'
	return {
		$or: [
			{
				[variable]: {
					[val]: cb ? cb(obj[variable] as any) : obj[variable],
				},
			},
			{
				$and: [
					{
						[variable]: {
							$eq: cb ? cb(obj[variable] as any) : obj[variable],
						},
					},
					{
						_id: {
							$lt: Types.ObjectId(obj._id! as any),
						},
					},
				],
			},
		],
	}
}
