import { Matches } from 'class-validator';

export class LikePostDto {
  @Matches(/like/ || /unlike/)
  like: string;
}
