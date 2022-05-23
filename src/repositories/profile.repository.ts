import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Profile } from 'src/profile/entities/profile.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Profile)
export class ProfileRepository extends Repository<Profile> {
  /** save a complete profile that already includes user relation */
  async saveProfile(newProfile: Profile) {
    const profile = await this.save(newProfile);
    delete profile.user;
    if (!profile) {
      throw new BadRequestException(
        "Il y a eu une problème lors de l'enregistrement du profil !",
      );
    }
    return profile;
  }

  /** Return all profiles, no pagination */
  async findAllProfiles() {
    const profiles = await this.createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .select([
        'user.id',
        'user.username',
        'profile.id',
        'profile.bio',
        'profile.photo',
      ])
      .getMany();

    if (!profiles) {
      throw new BadRequestException(
        'Il y a eu une erreur lors de la récupération des profils',
      );
    }
    return profiles;
  }

  /** return a sigle profile including the user and his posts */
  async getProfileIncludingPosts(id: string) {
    const profile = this.createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .leftJoinAndSelect('user.posts', 'posts')
      .select([
        'user.id',
        'user.username',
        'profile.id',
        'profile.bio',
        'profile.photo',
        'profile.firstName',
        'profile.lastName',
        'profile.createdAt',
        'posts.id',
      ])
      .where('profile.userId = :id', { id })
      .getOne();
    if (!profile) {
      throw new NotFoundException('Profil introuvable !');
    }
    return profile;
  }

  /** Find profile using user Id */
  async findProfileByUserID(id: string) {
    const profile = await this.findOne({
      where: {
        user: id,
      },
    });
    if (!profile) {
      throw new NotFoundException('Profil Introuvable !');
    }
    return profile;
  }

  /**update profile passing updated profile and user Id */
  async updateProfile(newProfile: Partial<Profile>, userId: string) {
    const profile = await this.createQueryBuilder('profile')
      .update('Profile')
      .set(newProfile)
      .where('profile.userId = :id', { id: userId })
      .execute();
    if (profile.affected === 0) {
      throw new NotFoundException(
        'Mise à jour impossible. Profil non trouvé !',
      );
    }
  }
}
