import {
	registerDecorator,
	ValidationOptions,
	ValidationArguments,
} from 'class-validator'
import { getModelForClass } from '@typegoose/typegoose'
import { Game } from '../../entities/game/game'

const GameMongooseModel = getModelForClass(Game)

export default function IsValidGame(validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			name: 'isValidGame',
			target: object.constructor,
			propertyName: propertyName,
			options: { message: 'Invalid Game Id', ...validationOptions },
			validator: {
				async validate(value: any, args: ValidationArguments) {
					return GameMongooseModel.exists({ _id: value })
				},
			},
		})
	}
}
