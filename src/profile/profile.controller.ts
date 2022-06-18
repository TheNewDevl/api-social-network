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
import { Request } from 'express';
import { EntityConverterPipe } from 'src/pipes/app.entityConverter.pipe';
import { Profile } from './entities/profile.entity';
import { EntityOwnerValidationPipe } from 'src/pipes/app.entityOwnerValidation.pipe';

@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(FileInterceptor('file'))
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
  findAll() {
    return this.profileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profileService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param(
      'id',
      new EntityConverterPipe(Profile.name),
      EntityOwnerValidationPipe,
    )
    profile: Profile,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.profileService.update(profile, updateProfileDto, file, req);
  }
}
