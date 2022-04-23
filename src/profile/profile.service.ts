import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>

  ) { }

  async create(createProfileDto: CreateProfileDto, user: Partial<User>) {
    const { id } = user
    //Retrieve User
    const userToUpdate = await this.userRepository.createQueryBuilder('user')
      .where("user.id = :id", { id }).getOne()
      .catch((e) => {
        throw new NotFoundException('User non retrouvé, impossible de créer la relation !' + console.log(e)
        )
      })

    //Create Profile and link it to User
    const newProfile = {
      ...createProfileDto,
      user: userToUpdate
    }


    //save profile
    const profile = await this.profileRepository.save(newProfile)
      .catch((e) => {
        throw new BadRequestException('Il y a eu une erreur lors de la création du profil !' + e
        )
      })

    const update = await this.userRepository.createQueryBuilder("user")
      .update('User')
      .set({ profile: profile })
      .where('user.id = :id', { id })
      .execute()
    if (update.affected === 0) {
      throw new NotFoundException('Mise à jour de la relation impossible !')
    }
    await this.userRepository.save(userToUpdate)



    return { message: 'Profil sauvegardé', profile };
  }

  async findAll() {
    return await this.profileRepository.createQueryBuilder("profile")
      .leftJoinAndSelect("profile.user", "user")
      .select(['user.id', 'user.username', 'profile.id', 'profile.bio', 'profile.photo'])
      .getMany()
  }

  async findOne(id: string) {
    return await this.profileRepository.createQueryBuilder("profile")
      .leftJoinAndSelect("profile.user", "user")
      .select(['user.id', 'user.username', 'profile.id', 'profile.bio', 'profile.photo'])
      .where('profile.id = :id', { id })
      .getOne()
  }

  async update(id: string, updateProfileDto: UpdateProfileDto) {
    const profile = {
      ...updateProfileDto
    }

    const update = await this.profileRepository.createQueryBuilder("profile")
      .update('Profile')
      .set(profile)
      .where('profile.id = :id', { id })
      .execute()
    if (update.affected === 0) {
      throw new NotFoundException('Mise à jour impossible. Profil non trouvé !')
    }
    return { message: 'Profil modifié !', update }
  }
}
