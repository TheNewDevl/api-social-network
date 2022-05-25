import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { reqUser } from 'src/utils/decorators/user.decorator';
import { User } from 'src/user/entities/user.entity';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import {
  customFileName,
  fileFilter,
  limits,
} from 'src/utils/config/multerConfig';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { LikePostDto } from './dto/like-post.dto';
import { EntityConverterPipe } from 'src/app.entityConverter.pipe';
import { Post as PostEntity } from './entities/post.entity';
import { EntityOwnerValidationPipe } from 'src/app.entityOwnerValidation.pipe';

@Controller('posts')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: './images',
      filename: customFileName,
    }),
    fileFilter: fileFilter,
    limits: limits,
  }),
)
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
