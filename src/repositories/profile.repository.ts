import { Profile } from 'src/profile/entities/profile.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Profile)
export class ProfileRepository extends Repository<Profile> {}
