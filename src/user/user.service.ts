import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/repositories/user.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  async findOne(id: string) {
    try {
      const user = await this.userRepository.findOneUserById(id);
      delete user.hashedRefreshToken;
      return user;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(id: string) {
    try {
      const deletion = await this.userRepository.delete(id);
      if (deletion.affected === 0) {
        throw new BadRequestException('Suppression impossible');
      } else {
        return { deletion, message: 'Utilisateur supprimé !' };
      }
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const users = await this.userRepository.find();
      return users;
    } catch (error) {
      throw error;
    }
  }
}
