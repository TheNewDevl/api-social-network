import { BadRequestException } from '@nestjs/common';
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
}
