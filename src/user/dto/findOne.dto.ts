import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class findOneDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(36)
  id: string;
}
