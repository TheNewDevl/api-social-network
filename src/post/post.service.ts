import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { unlinkSync } from 'fs';
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
        commentsCount: 0,
        user: {
          id,
          username,
          profile: { photo: dbUser.profile && dbUser.profile.photo },
        },
      };

      return { post: returnPost };
    } catch (error) {
      //if any error, unlink the image uploaded
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

  /** Will return all posts with their user id and username */
  async findAll(queryParams) {
    const offset = queryParams.offset;
    const limit = queryParams.limit;

    try {
      const posts = !queryParams.user
        ? await this.postRepository.getAllPaginated(+offset, +limit)
        : await this.postRepository.getAllByUserPaginated(
            +offset,
            +limit,
            queryParams.user,
          );
      return posts;
    } catch (error) {
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
    post: Post,
    updatePostDto: UpdatePostDto,
    file: Express.Multer.File,
    req: Request,
  ) {
    try {
      //lets retrive the img url and delete it from storage
      if (file && post.image) {
        const filename = post.image.split(`${req.get('host')}/`)[1];
        try {
          unlinkSync(`images/${filename}`);
        } catch (error) {
          console.log(error);
        }
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
      try {
        unlinkSync(file.path);
      } catch (error) {
        console.log(error);
      }
      throw new BadRequestException(error);
    }
  }

  async remove(post: Post, req: Request) {
    try {
      await this.postRepository.deletePost(post.id);
      //if post contains a photo retrive the filename and detele it
      if (post.image) {
        const filename = post.image.split(`${req.get('host')}/`)[1];
        try {
          unlinkSync(`images/${filename}`);
        } catch (error) {
          console.log(error);
        }
      }
      return { message: 'Publication supprimée !' };
    } catch (error) {
      throw error;
    }
  }

  async likesManagement(id: string, likePostDto: LikePostDto, user: User) {
    try {
      if (likePostDto.like === 'like') {
        await this.postRepository.addLike(id, user.id);
        return { message: 'Like enregistré' };
      } else if (likePostDto.like === 'unlike') {
        await this.postRepository.removeLike(id, user.id);
        return { message: 'Like supprimé' };
      } else {
        throw new BadRequestException('Valeur de like incorrecte !');
      }
    } catch (error) {
      throw error;
    }
  }
}
