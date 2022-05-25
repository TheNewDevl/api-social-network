import {
  ArgumentMetadata,
  Inject,
  Injectable,
  PipeTransform,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import EntityOwnerInterface, {
  instanceOfEntityOwnerInterface,
} from './EntityOwnerInterface';

@Injectable({ scope: Scope.REQUEST })
export class EntityOwnerValidationPipe implements PipeTransform<any> {
  constructor(@Inject(REQUEST) private request) {}

  async transform(value: EntityOwnerInterface, metadata: ArgumentMetadata) {
    console.log(value);
    console.log(this.request.user.id);

    if (!instanceOfEntityOwnerInterface(value)) {
      throw new Error(
        `Object ${JSON.stringify(value)} must implement EntityOwnerInterface`,
      );
    }
    if (this.request.user.roles === 'admin') {
      return value;
    }
    if (value.getUserId() !== this.request.user.id) {
      throw new UnauthorizedException(
        "Vous n'avez pas le droit d'effectuer cette action",
      );
    }
    return value;
  }
}
