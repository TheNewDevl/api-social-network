import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';
import { unlink } from 'fs';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    file: Express.Multer.File,
    createProfileDto: CreateProfileDto,
    user: Partial<User>,
    req: Request,
  ) {
    //first retrieve User from DB
    const dbUser = await this.userRepository.findOne(user.id);
    if (!dbUser)
      throw new NotFoundException(
        'Utilisateur introuvable, création impossible',
      );

    //Create Profile and link it to User
    const newProfile = this.profileRepository.create({
      ...createProfileDto,
      user: dbUser,
    });
    console.log(file);

    //Create img url if file exists and push it to the profile
    if (file) {
      const imgUrl = `${req.protocol}://${req.get('host')}/${file.filename}`;
      newProfile.photo = imgUrl;

      console.log(imgUrl);
    }

    //save profile
    await this.profileRepository.save(newProfile).catch((e) => {
      throw new BadRequestException(
        'Il y a eu une erreur lors de la création du profil !' + e,
      );
    });

    //set hasprofile to true
    dbUser.hasProfile = 1;
    const updatedUser = await this.userRepository.save(dbUser);
    if (!updatedUser) {
      throw new NotFoundException("Mise à jour de l'utilisateur impossible !");
    }
    return { message: 'Profil sauvegardé' };
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
