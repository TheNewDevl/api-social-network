import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
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

      //save the post in the DB
      await this.postRepository.save(post);

      return { message: 'Publication enregistrée' };
    } catch (error) {
      throw new BadRequestException(
        'Une erreur est survenue lors de la création du post' + error,
      );
    }
  }

  /** Will return all posts with and their user id and user name */
  async findAll() {
    try {
      const posts = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .select([
          'post.id',
          'post.text',
          'post.image',
          'user.id',
          'user.username',
        ])
        .getMany();

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

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
