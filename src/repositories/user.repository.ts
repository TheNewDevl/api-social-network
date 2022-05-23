import { NotFoundException } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  /** Return User entity and profile photo using user id  */
  async findUserWithAvatar(id: string) {
    const user = await this.createQueryBuilder('user')
      .where('user.id = :id', { id })
      .leftJoinAndSelect('user.profile', 'profile')
      .getOne();
    if (!user) {
      throw new NotFoundException(
        'Utilisateur souhaitant effectuer la publication introuvable',
      );
    }
    return user;
  }
}
