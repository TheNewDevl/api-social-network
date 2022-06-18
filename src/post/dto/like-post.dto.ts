import { IsString } from 'class-validator';

export class LikePostDto {
  @IsString()
  like: string;
}
