import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { User } from 'src/user/entities/user.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { unlinkSync } from 'fs';
import { ProfileRepository } from 'src/repositories/profile.repository';
import { UserRepository } from 'src/repositories/user.repository';
import { Profile } from './entities/profile.entity';

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
      const dbUser = await this.userRepository.findOneUserById(user.id);

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
      await this.userRepository.save(dbUser);
      return { message: 'Profil sauvegard√©', profile };
    } catch (error) {
      if (file) {
        try {
          unlinkSync(file.path);
        } catch (error) {
          console.log(error);
        }
      }
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.profileRepository.findAllProfiles();
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      // Be carefull, use the user id to retrive the profile, not de profile id
      return await this.profileRepository.getProfileIncludingPosts(id);
    } catch (error) {
      throw error;
    }
  }

  async update(
    profile: Profile,
    updateProfileDto: UpdateProfileDto,
    file: Express.Multer.File,
    req: Request,
  ) {
    // If contains file,find the sauce and delete the old image before saving the new one
    try {
      const newProfile = {
        ...updateProfileDto,
      };

      //if file check if profile has already a photo, retrive filename and detele it
      if (file) {
        if (profile.photo) {
          const filename = profile.photo.split(`${req.get('host')}/`)[1];
          try {
            unlinkSync(`images/${filename}`);
          } catch (error) {
            console.log(error);
          }
        }
        const imgUrl = `${req.protocol}://${req.get('host')}/${file.filename}`;
        newProfile.photo = imgUrl;
      }

      await this.profileRepository.updateProfile(newProfile, profile.id);
      return { message: 'Profil modifi√© !' };
    } catch (error) {
      //if any error, unlink the image uploaded
      try {
        unlinkSync(file.path);
      } catch (error) {
        console.log(error);
      }
      throw error;
    }
  }
}
