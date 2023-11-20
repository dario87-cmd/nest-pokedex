import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform {

  transform(value: string, metadata: ArgumentMetadata) {
    console.log({ value, metadata });
    //evaluamos si es uui
    if (!isValidObjectId(value)) { //si noes es un id valido ejecuta la liena de codigo 
      throw new BadRequestException(`${value} no es un mongoId valido`)
    }

    return value;
  }
}
