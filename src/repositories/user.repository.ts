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

  async findOneUserById(id: string) {
    const user = await this.findOne({ id });
    if (!user)
      throw new NotFoundException(
        'Utilisateur introuvable, création impossible',
      );

    delete user.password;
    return user;
  }

  async findUserByUsername(username: string) {
    const user = await this.createQueryBuilder('user')
      .where('user.email = :username or user.username = :username', {
        username,
      })
      .getOne();
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }
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

  async deleteUser(id: string) {
    const deletion = await this.delete(id);
    if (deletion.affected === 0) {
      throw new NotFoundException("Cet utilisateur n'a pas été retrouvé");
    }
    return deletion;
  }
}
