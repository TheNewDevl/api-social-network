import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { getManager } from 'typeorm';

@Injectable()
export class EntityConverterPipe implements PipeTransform<any> {
  constructor(private type: string) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    const entity = await getManager('default')
      .getRepository(this.type)
      .findOne(value);

    return entity;
  }
}
