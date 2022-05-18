import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { unlink } from 'fs';
import { Comment } from 'src/comments/entities/comment.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { LikePostDto } from './dto/like-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
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
        likes: [],
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

  /** Will return all posts with their user id and username */
  async findAll({ limit, offset }) {
    try {
      console.log({ offset, limit });
      const posts = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .leftJoinAndSelect('user.profile', 'profile')
        .leftJoinAndSelect('post.likes', 'likes')
        .orderBy('post.createdAt', 'DESC')
        .select([
          'likes.id',
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
      console.log(error);
      throw new BadRequestException(
        'Il y a eu une erreur lors du chargement des données depuis le serveur',
      );
    }
  }

  async findOne(id: string) {
    try {
      const post = await this.postRepository.findOne({ id: id });
      return post;
    } catch (error) {
      throw new NotFoundException('Post introuvable');
    }
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    file: Express.Multer.File,
    req: Request,
  ) {
    try {
      //lets retrieve the post in DB
      const post = await this.postRepository.findOne({ id: id });
      if (!post) {
        throw new NotFoundException('Erreur lors de la récupération du post.');
      }
      //lets retrive the img url and delete it from storage
      if (file && post.image) {
        const filename = post.image.split(`${req.get('host')}/`)[1];
        unlink(`images/${filename}`, (err) => {
          console.log(err);
        });
      }

      const imgUrl = file
        ? `${req.protocol}://${req.get('host')}/${file.filename}`
        : null;

      post.text = updatePostDto.text;
      file && (post.image = imgUrl);

      const update = await this.postRepository.save(post);
      return update;
    } catch (error) {
      console.log(error);
      //if any error, unlink the image uploaded
      unlink(file.path, (err) => {
        if (err) {
          console.log(err);
        }
      });
      throw new BadRequestException(error);
    }
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

  async likesManagement(id: string, likePostDto: LikePostDto, user: User) {
    try {
      if (likePostDto.like === 'like') {
        await this.postRepository
          .createQueryBuilder()
          .relation(Post, 'likes')
          .of(id)
          .add(user.id);
      } else if (likePostDto.like === 'unlike') {
        await this.postRepository
          .createQueryBuilder()
          .relation(Post, 'likes')
          .of(id)
          .remove(user.id);
      }
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException('Vous avez déja liké cette publication.');
      }
      throw error;
    }
  }
}
