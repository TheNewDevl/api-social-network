import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { User } from 'src/user/entities/user.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { unlink } from 'fs';
import { ProfileRepository } from 'src/repositories/profile.repository';
import { UserRepository } from 'src/repositories/user.repository';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(ProfileRepository)
    private readonly profileRepository: ProfileRepository,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async create(
    file: Express.Multer.File,
    createProfileDto: CreateProfileDto,
    user: Partial<User>,
    req: Request,
  ) {
    try {
      //User wanting to create a profile
      const dbUser = await this.userRepository.findOneUser(user.id);

      // create url for the file if file uploaded
      const imgUrl = file
        ? `${req.protocol}://${req.get('host')}/${file.filename}`
        : null;

      //Create Profile
      const newProfile = this.profileRepository.create({
        ...createProfileDto,
        user: dbUser,
      });
      file && (newProfile.photo = imgUrl);

      //save profile
      const profile = await this.profileRepository.saveProfile(newProfile);

      dbUser.hasProfile = 1;
      await this.userRepository.saveUser(dbUser);
      return { message: 'Profil sauvegardé', profile };
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    return await this.profileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .select([
        'user.id',
        'user.username',
        'profile.id',
        'profile.bio',
        'profile.photo',
      ])
      .getMany();
  }

  async findOne(id: string) {
    console.log(id);

    return await this.profileRepository

      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .select([
        'user.id',
        'user.username',
        'profile.id',
        'profile.bio',
        'profile.photo',
        'profile.firstName',
        'profile.lastName',
      ])
      .where('profile.userId = :id', { id })
      .getOne();
  }

  async update(
    id: string,
    updateProfileDto: UpdateProfileDto,
    file: Express.Multer.File,
    req: Request,
  ) {
    // If contains file,find the sauce and delete the old image before saving the new one
    try {
      const newProfile = {
        ...updateProfileDto,
      };

      if (file) {
        const profile = await this.profileRepository.findOne({
          where: {
            user: id,
          },
        });

        //if profile contains a photo retrive de filename and detele it
        if (profile.photo) {
          const filename = profile.photo.split(`${req.get('host')}/`)[1];
          unlink(`images/${filename}`, (err) => {
            console.log(err);
          });
        }

        //set image url
        const imgUrl = `${req.protocol}://${req.get('host')}/${file.filename}`;
        newProfile.photo = imgUrl;
      }

      const update = await this.profileRepository
        .createQueryBuilder('profile')
        .update('Profile')
        .set(newProfile)
        .where('profile.userId = :id', { id })
        .execute();
      if (update.affected === 0) {
        throw new NotFoundException(
          'Mise à jour impossible. Profil non trouvé !',
        );
      }
      return { message: 'Profil modifié !' };
    } catch (error) {
      //if any error, unlink the image uploaded
      unlink(file.path, (err) => {
        if (err) {
          console.log(err);
        }
      });
      throw new BadRequestException(error);
    }
  }
}
