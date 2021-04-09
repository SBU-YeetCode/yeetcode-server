import {
	registerDecorator,
	ValidationOptions,
	ValidationArguments,
} from 'class-validator'
import { GameProgressMongooseModel } from '../gameProgress/model'

export default function IsValidGameProgress(validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			name: 'isValidGameProgress',
			target: object.constructor,
			propertyName: propertyName,
			options: { message: 'Invalid GameProgress Id', ...validationOptions },
			validator: {
				async validate(value: any, args: ValidationArguments) {
					return GameProgressMongooseModel.exists({ _id: value })
				},
			},
		})
	}
}
