import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { unlink } from 'fs';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async create(
    file: Express.Multer.File,
    createPostDto: CreatePostDto,
    user: Partial<User>,
    req: Request,
  ) {
    try {
      //first retrieve User from DB
      const dbUser = await this.userRepository.findOne(user.id);
      if (!dbUser)
        throw new NotFoundException(
          'Utilisateur introuvable, création impossible',
        );

      const imgUrl = file
        ? `${req.protocol}://${req.get('host')}/${file.filename}`
        : null;

      //create the new post adding the user ref and file if req contains file
      const post = new Post();
      post.text = createPostDto.text;
      post.user = dbUser;
      file && (post.image = imgUrl);

      //save the post in the DB and return some data from the post created and the user
      const newPost = await this.postRepository.save(post);
      const { id, username } = user;
      delete newPost.user;
      const returnPost = {
        ...newPost,
        user: { id, username },
      };
      return { message: 'Publication enregistrée', post: returnPost };
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

  /** Will return all posts with and their user id and user name */
  async findAll({ limit, offset }) {
    try {
      console.log({ offset, limit });

      const posts = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .leftJoinAndSelect('user.profile', 'profile')
        .orderBy('post.createdAt', 'DESC')
        .select([
          'post.id',
          'post.text',
          'post.image',
          'post.createdAt',
          'user.id',
          'user.username',
          'profile.photo',
        ])
        .offset(parseInt(offset))
        .limit(parseInt(limit))
        .getManyAndCount();
      return posts;
    } catch (error) {
      throw new BadRequestException(
        'Il y a eu une erreur lors du chargement des données depuis le serveur',
      );
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  update(id: string, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  async remove(id: string, req: Request) {
    const post = await this.postRepository.findOne({ id: id });
    //if post contains a photo retrive the filename and detele it
    if (post.image) {
      const filename = post.image.split(`${req.get('host')}/`)[1];
      unlink(`images/${filename}`, (err) => {
        console.log(err);
      });
    }

    const deletion = await this.postRepository.delete({ id });
    if (deletion.affected === 0) {
      throw new NotFoundException('Suppression du post impossible');
    }

    return { message: 'Publication supprimée !' };
  }
}
