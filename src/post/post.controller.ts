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
import { Roles } from 'src/utils/decorators/roles.decorator';
import { UserRoleEnum } from 'src/utils/enums/roles.enum';

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
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @Roles(UserRoleEnum.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(id, updatePostDto);
  }

  @Roles(UserRoleEnum.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    console.log(id);

    return this.postService.remove(id);
  }
}
