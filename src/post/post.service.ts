import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { unlink } from 'fs';
import { User } from 'src/user/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { LikePostDto } from './dto/like-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { PostRepository } from '../repositories/post.repository';
import { UserRepository } from 'src/repositories/user.repository';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostRepository)
    private postRepository: PostRepository,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  async create(
    file: Express.Multer.File,
    createPostDto: CreatePostDto,
    user: Partial<User>,
    req: Request,
  ) {
    try {
      //first retrieve User from DB
      const dbUser = await this.userRepository.findUserAndAvatar(user.id);

      //set imgUrl user sent file
      const imgUrl = file
        ? `${req.protocol}://${req.get('host')}/${file.filename}`
        : null;

      //create the new post adding the user ref and file if req contains file
      const post = new Post();
      post.text = createPostDto.text;
      post.user = dbUser;
      file && (post.image = imgUrl);

      //save the post in the DB and return some data from the post created and the user
      const newPost = await this.postRepository.savePost(post);
      const { id, username } = user;
      const returnPost = {
        ...newPost,
        likes: [],
        user: { id, username, profile: { photo: dbUser.profile.photo } },
      };

      return { message: 'Publication enregistrée', post: returnPost };
    } catch (error) {
      //if any error, unlink the image uploaded
      unlink(file.path, (err) => {
        if (err) {
          console.log(err);
        }
      });
      throw error;
    }
  }

  /** Will return all posts with their user id and username */
  async findAll({ limit, offset }) {
    try {
      const posts = await this.postRepository.getAllPaginated(+offset, +limit);
      return posts;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const post = await this.postRepository.findOneByPostId(id);
      return post;
    } catch (error) {
      throw error;
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
      const post = await this.postRepository.findOneByPostId(id);

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
    const post = await this.postRepository.findOneByPostId(id);
    await this.postRepository.deletePost(id);
    //if post contains a photo retrive the filename and detele it
    if (post.image) {
      const filename = post.image.split(`${req.get('host')}/`)[1];
      unlink(`images/${filename}`, (err) => {
        console.log(err);
      });
    }
    return { message: 'Publication supprimée !' };
  }

  async likesManagement(id: string, likePostDto: LikePostDto, user: User) {
    try {
      if (likePostDto.like === 'like') {
        await this.postRepository.addLike(id, user.id);
      } else if (likePostDto.like === 'unlike') {
        await this.postRepository.removeLike(id, user.id);
      } else {
        throw new BadRequestException('Valeur de like incorrecte !');
      }
    } catch (error) {
      throw error;
    }
  }
}
