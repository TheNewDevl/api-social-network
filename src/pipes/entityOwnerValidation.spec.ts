import { createMock } from '@golevelup/ts-jest';
import { ArgumentMetadata } from '@nestjs/common';
import { Request } from 'express';
import { EntityOwnerValidationPipe } from 'src/pipes/app.entityOwnerValidation.pipe';
import EntityOwnerInterface from 'src/pipes/EntityOwnerInterface';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Profile2 {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}

describe('entity owner validation error test', () => {
  const mockRequest = createMock<Request>({});
  const mockArgMetaData = createMock<ArgumentMetadata>({});
  const profile = new Profile2();

  it('should throw an error', () => {
    const entityOwnerValidationPipe = new EntityOwnerValidationPipe(
      mockRequest,
    );
    entityOwnerValidationPipe
      .transform(profile as unknown as EntityOwnerInterface, mockArgMetaData)
      .catch((e) =>
        expect(e).toEqual(
          new Error('Object {} must implement EntityOwnerInterface'),
        ),
      );
  });
});
