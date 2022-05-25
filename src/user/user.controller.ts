import { Controller, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { UserRoleEnum } from 'src/utils/enums/roles.enum';
import { EntityConverterPipe } from 'src/app.entityConverter.pipe';
import { User } from 'src/user/entities/user.entity';
import { EntityOwnerValidationPipe } from 'src/app.entityOwnerValidation.pipe';
import { UserService } from 'src/user/user.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  @Roles(UserRoleEnum.ADMIN)
  getAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @Roles(UserRoleEnum.ADMIN)
  async getOne(@Param('id') id: string) {
    return await this.userService.findOne(id);
  }

  @Roles(UserRoleEnum.ADMIN)
  @Delete(':id')
  async deleteUser(
    @Param('id', new EntityConverterPipe(User.name), EntityOwnerValidationPipe)
    user: User,
  ) {
    return await this.userService.deleteUser(user.id);
  }
}
