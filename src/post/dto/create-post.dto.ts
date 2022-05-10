import {
  IsAlphanumeric,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  text: string;

  @IsOptional()
  @IsString()
  file: string;
}
