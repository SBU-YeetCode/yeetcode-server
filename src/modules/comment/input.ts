import { PaginatedResponse } from '../utils/pagination'
import { Comment } from '../../entities'
import { ObjectType } from 'type-graphql'

@ObjectType()
export class PaginatedCommentResponse extends PaginatedResponse(Comment) {}
