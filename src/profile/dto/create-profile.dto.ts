import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  firstName: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  lastName: string;

  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  bio: string;

  @IsOptional()
  photo: string;
}
