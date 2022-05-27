import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { EntityConverterPipe } from 'src/app.entityConverter.pipe';
import { EntityOwnerValidationPipe } from 'src/app.entityOwnerValidation.pipe';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/user/entities/user.entity';
import { reqUser } from 'src/utils/decorators/user.decorator';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';

@UseGuards(JwtAuthGuard)
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @reqUser() user: Partial<User>,
  ) {
    return await this.commentService.create(createCommentDto, user);
  }

  @Get('post/:id')
  async findAllByPost(@Param('id') postId: string, @Query() queryParams) {
    return await this.commentService.findAllByPost(queryParams, postId);
  }

  @Patch(':id')
  update(
    @Param(
      'id',
      new EntityConverterPipe(Comment.name),
      EntityOwnerValidationPipe,
    )
    comment: Partial<Comment>,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.update(comment, updateCommentDto);
  }

  @Delete(':id')
  remove(
    @Param(
      'id',
      new EntityConverterPipe(Comment.name),
      EntityOwnerValidationPipe,
    )
    comment: Comment,
  ) {
    return this.commentService.remove(comment);
  }
}
