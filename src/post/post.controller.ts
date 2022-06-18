import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { EntityConverterPipe } from 'src/pipes/app.entityConverter.pipe';
import { EntityOwnerValidationPipe } from 'src/pipes/app.entityOwnerValidation.pipe';
import { User } from 'src/user/entities/user.entity';
import { reqUser } from 'src/utils/decorators/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { LikePostDto } from './dto/like-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post as PostEntity } from './entities/post.entity';
import { PostService } from './post.service';

@Controller('posts')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(FileInterceptor('file'))
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('upload')
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createPostDto: CreatePostDto,
    @reqUser() user: Partial<User>,
    @Req() req: Request,
  ) {
    return this.postService.create(file, createPostDto, user, req);
  }

  @Get()
  async findAll(@Query() queryParams) {
    return await this.postService.findAll(queryParams);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.postService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param(
      'id',
      new EntityConverterPipe(PostEntity.name),
      EntityOwnerValidationPipe,
    )
    post: PostEntity,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return await this.postService.update(post, updatePostDto, file, req);
  }

  @Delete(':id')
  async remove(
    @Param(
      'id',
      new EntityConverterPipe(PostEntity.name),
      EntityOwnerValidationPipe,
    )
    post: PostEntity,
    @Req() req: Request,
  ) {
    return await this.postService.remove(post, req);
  }

  @Patch('likes/:id')
  async likesManagement(
    @Param('id') id: string,
    @Body() likePostDto: LikePostDto,
    @reqUser() user: User,
  ) {
    return await this.postService.likesManagement(id, likePostDto, user);
  }
}
