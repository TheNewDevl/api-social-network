import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MaxLength(2000)
  @MinLength(3)
  text: string;

  @IsOptional()
  @IsString()
  file?: string;
}
