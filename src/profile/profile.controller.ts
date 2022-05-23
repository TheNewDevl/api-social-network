import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { User } from 'src/user/entities/user.entity';
import { reqUser } from 'src/utils/decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  customFileName,
  fileFilter,
  limits,
} from 'src/utils/config/multerConfig';
import { Request } from 'express';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { UserRoleEnum } from 'src/utils/enums/roles.enum';

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
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createProfileDto: CreateProfileDto,
    @reqUser() user: Partial<User>,
    @Req() req: Request,
  ) {
    return await this.profileService.create(file, createProfileDto, user, req);
  }

  @Get()
  async findAll() {
    return await this.profileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profileService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRoleEnum.USER)
  update(
    @Param('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.profileService.update(userId, updateProfileDto, file, req);
  }
}
