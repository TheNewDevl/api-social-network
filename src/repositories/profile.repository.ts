import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Profile } from 'src/profile/entities/profile.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Profile)
export class ProfileRepository extends Repository<Profile> {
  /** save a complete profile that already includes user relation */
  async saveProfile(newProfile: Profile) {
    try {
      const profile = await this.save(newProfile);
      delete profile.user;
      return profile;
    } catch (error) {
      throw new ConflictException('Le profil a déjà été créé');
    }
  }

  /** Return all profiles, no pagination */
  async findAllProfiles() {
    // can not fail, will return an empty array if no profiles
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
    return profiles;
  }

  /**Find profile using user Id return a sigle profile including the user and his posts */
  async getProfileIncludingPosts(id: string) {
    const profile = await this.createQueryBuilder('profile')
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

  /**update profile passing updated profile and profile id */
  async updateProfile(newProfile: Partial<Profile>, profileId: string) {
    await this.createQueryBuilder('profile')
      .update('Profile')
      .set(newProfile)
      .where('profile.id = :id', { id: profileId })
      .execute();
    //the converter pipe will prevent to call this method with a wrong id
    /*  if (profile.affected === 0) {
      throw new NotFoundException(
        'Mise à jour impossible. Profil non trouvé !',
      );
    } */
  }
}
