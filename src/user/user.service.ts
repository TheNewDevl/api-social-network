import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOne(id: Partial<LoginUserDto>) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', id)
      .getOne();

    delete user.password;

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return user;
  }

  async deleteUser(id: string) {
    const deletion = await this.userRepository.delete(id);
    if (deletion.affected === 0) {
      throw new NotFoundException("Cet utilisateur n'a pas été retrouvé");
    }

    return { deletion, message: 'Utilisateur supprimé !' };
  }

  async findAll() {
    return await this.userRepository.find();
  }
}
