import { BadRequestException, NotFoundException } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  /** Return User entity and profile photo using user id  */
  async findUserAndAvatar(id: string) {
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

  async findOneUser(id: string) {
    const user = await this.findOne({ id: id });
    if (!user)
      throw new NotFoundException(
        'Utilisateur introuvable, création impossible',
      );
    return user;
  }

  async saveUser(userEntity: User) {
    const user = this.save(userEntity);
    if (!user) {
      throw new BadRequestException(
        "Il y a eu une erreur lors de l'enregistrement du profil !",
      );
    }
    return user;
  }
}
