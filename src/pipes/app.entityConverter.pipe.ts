import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
  Scope,
} from '@nestjs/common';
import { getManager } from 'typeorm';

@Injectable()
export class EntityConverterPipe implements PipeTransform<any> {
  constructor(private type: string) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    try {
      const entity = await getManager('default')
        .getRepository(this.type)
        .findOne(value);
      if (!entity) {
        throw new NotFoundException('Ressource introuvable');
      }
      return entity;
    } catch (error) {
      throw error;
    }
  }
}
