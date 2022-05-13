import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { UserRoleEnum } from 'src/utils/enums/roles.enum';
import { LoginUserDto } from './dto/login-user.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  getAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @Roles(UserRoleEnum.ADMIN)
  getOne(@Param() id: Partial<LoginUserDto>) {
    return this.userService.findOne(id);
  }

  @Roles(UserRoleEnum.ADMIN)
  @Delete(':id')
  deleteUser(@Param() id: string) {
    return this.userService.deleteUser(id);
  }
}
