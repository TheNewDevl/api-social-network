import { createMock } from '@golevelup/ts-jest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Request } from 'express';
import { Profile } from 'src/profile/entities/profile.entity';
import { PostRepository } from 'src/repositories/post.repository';
import { UserRepository } from 'src/repositories/user.repository';
import { User } from 'src/user/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { PostService } from './post.service';
import * as fs from 'fs';
import { Post } from './entities/post.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import { LikePostDto } from './dto/like-post.dto';

console.log = jest.fn();
describe('PostService', () => {
  let service: PostService;

  const file = null;
  const file2 = createMock<Express.Multer.File>({
    filename: 'cutedogs.jpg',
    path: './images/cutedogs.jpg',
  });
  const req = createMock<Request>({
    protocol: 'http',
    host: 'localhost',
    get(): string {
      return this.host;
    },
  });

  const user = new User();
  user.id = '12345';
  user.username = 'mick';

  const post1 = new Post();
  post1.id = '1';
  const post2 = new Post();
  post2.id = '2';
  const postsArray = [post1, post2];

  const mockUserRepository = createMock<UserRepository>({
    findUserAndAvatar: jest.fn().mockImplementation(() => {
      const profile = new Profile();
      profile.photo = 'http://greatimg.png.com';
      user.profile = profile;
      return Promise.resolve(user);
    }),
  });

  const mockPostRepository = createMock<PostRepository>({
    savePost: jest.fn().mockImplementation((post) => {
      if (!post.text) {
        throw new BadRequestException(
          'Il y a eu une erreur lors de la création de la publication',
        );
      } else {
        return Promise.resolve(post);
      }
    }),
    getAllPaginated: jest.fn().mockImplementation((offset, limit) => {
      if (limit === 0) {
        throw new BadRequestException(
          'Il y a eu une erreur lors du chargement des données depuis le serveur',
        );
      } else {
        return Promise.resolve(postsArray);
      }
    }),
    findOneByPostId: jest.fn().mockImplementation((id) => {
      const post = postsArray.find((p) => p.id === id);
      if (!post) {
        throw new NotFoundException('Publication introuvable !');
      } else {
        return Promise.resolve(post);
      }
    }),
    save: jest.fn().mockImplementation((post) => {
      if (!post.text) {
        throw new Error('error');
      } else {
        return post;
      }
    }),
    deletePost: jest.fn().mockImplementation((id) => {
      const deletion = {
        raw: '',
        affected: 0,
      };
      const post = postsArray.find((p) => p.id === id);
      if (post) {
        deletion.affected = 1;
      } else {
        deletion.affected = 0;
      }
      if (deletion.affected === 0) {
        if (deletion.affected === 0) {
          throw new BadRequestException('Suppression du post impossible');
        }
      } else {
        return;
      }
    }),
    addLike: jest.fn().mockImplementation((postId, userId) => {
      const likes = ['999'];

      if (!likes.includes(userId)) {
        likes.push(userId);
      } else {
        throw new BadRequestException('Vous avez déja liké cette publication.');
      }
    }),
    removeLike: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: getRepositoryToken(PostRepository),
          useValue: mockPostRepository,
        },
        {
          provide: getRepositoryToken(UserRepository),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createPostDto = new CreatePostDto();
    createPostDto.text = 'hello this is a post';

    it('returned post image should be "http://localhost/cutedogs.jpg"', async () => {
      const containingFile = await service.create(
        file2,
        createPostDto,
        user,
        req,
      );
      expect(containingFile.post.image).toEqual(
        'http://localhost/cutedogs.jpg',
      );
    });

    it('should throw error', async () => {
      jest.spyOn(fs, 'unlinkSync').mockReset();
      try {
        const emptyCreatePostDto = new CreatePostDto();
        const fail = await service.create(file2, emptyCreatePostDto, user, req);
        expect(fail).toBeUndefined();
      } catch (error) {
        expect(error.status).toEqual(400);
        expect(error.message).toEqual(
          'Il y a eu une erreur lors de la création de la publication',
        );
      }
    });

    it('returned post image should be undefined  ', async () => {
      const returned = await service.create(file, createPostDto, user, req);
      expect(returned.post.image).toBeUndefined();
    });

    it('should return post  ', async () => {
      expect(await service.create(file, createPostDto, user, req)).toEqual({
        post: {
          commentsCount: 0,
          ...createPostDto,
          likes: [],
          user: {
            id: '12345',
            profile: { photo: 'http://greatimg.png.com' },
            username: 'mick',
          },
        },
      });
    });
    it('should call findUserAndAvatar repo method passsing user id ', async () => {
      expect(mockUserRepository.findUserAndAvatar).toBeCalledTimes(4);
      expect(mockUserRepository.findUserAndAvatar).toHaveBeenCalledWith(
        '12345',
      );
    });

    it('should call savePostMethod passing the created post containing data and user', async () => {
      expect(mockPostRepository.savePost).toBeCalledTimes(4);
      expect(mockPostRepository.savePost).toBeCalledWith({
        text: 'hello this is a post',
        user: {
          id: '12345',
          profile: { photo: 'http://greatimg.png.com' },
          username: 'mick',
        },
      });
    });
  });

  describe('find all', () => {
    const queryParams = {
      offset: '0',
      limit: '2',
    };

    it('should return post array  ', async () => {
      const posts = await service.findAll(queryParams);
      expect(posts).toEqual(postsArray);
    });

    it('should throw an error  ', async () => {
      try {
        const posts = await service.findAll({
          offset: '0',
          limit: '0',
        });
        expect(posts).toBeUndefined();
      } catch (error) {
        expect(error.status).toEqual(400);
      }
    });

    it('should call getAllPaginated method passing NUMBER params  ', () => {
      expect(mockPostRepository.getAllPaginated).toHaveBeenCalledTimes(2);
      expect(mockPostRepository.getAllPaginated).toHaveBeenCalledWith(0, 2);
    });
  });

  describe('find one', () => {
    it('should return a post', async () => {
      const post = await service.findOne('1');
      expect(post).toEqual(post1);
    });
    it('should call repo findOneByPostId  given the post id ', () => {
      expect(mockPostRepository.findOneByPostId).toHaveBeenCalledTimes(1);
      expect(mockPostRepository.findOneByPostId).toHaveBeenCalledWith('1');
    });
    it('should throw and error', async () => {
      try {
        const post = await service.findOne('5');
        expect(post).toBeUndefined();
      } catch (error) {
        expect(error.status).toEqual(404);
        expect(error.message).toEqual('Publication introuvable !');
      }
    });
  });

  describe('update', () => {
    const updatePostDto = new UpdatePostDto();
    updatePostDto.text = 'update text ';

    post1.text = 'initial text';

    it('should return post with updated text ', async () => {
      const post = await service.update(post1, updatePostDto, file, req);
      expect(post).toEqual({ id: '1', text: 'update text ' });
    });
    it('should should call save method ', async () => {
      expect(mockPostRepository.save).toHaveBeenCalledTimes(1);
      expect(mockPostRepository.save).toHaveBeenCalledWith(post1);
    });

    it('should retrieve filename and call unlink ', async () => {
      post1.image = 'http://localhost/funny.jpg';
      const unlinkSpy = jest.spyOn(fs, 'unlinkSync');
      await service.update(post1, updatePostDto, file2, req);
      expect(unlinkSpy).toHaveBeenCalled();
      unlinkSpy.mockClear();
    });

    it('shouldreturn post including image url  ', async () => {
      post1.image = 'http://localhost/funny.jpg';
      const unlinkSpy = jest.spyOn(fs, 'unlinkSync');
      const post = await service.update(post1, updatePostDto, file2, req);

      expect(post).toEqual({
        id: '1',
        image: 'http://localhost/cutedogs.jpg',
        text: 'update text ',
      });
      unlinkSpy.mockClear();
    });

    it(' should call save method with new file name  ', async () => {
      expect(mockPostRepository.save).toHaveBeenCalledWith({
        id: '1',
        image: 'http://localhost/cutedogs.jpg',
        text: 'update text ',
      });
    });

    it(' should throw an error ', async () => {
      try {
        await service.update(post1, { text: '' }, file2, req);
      } catch (error) {
        expect(error.status).toBe(400);
      }
    });
  });

  describe('delete', () => {
    post2.image = 'http://localhost/superfunny.jpg';
    const unlinkSpy = jest.spyOn(fs, 'unlinkSync').mockReset();

    it('should return message ', async () => {
      const deletion = await service.remove(post2, req);
      expect(deletion).toEqual({ message: 'Publication supprimée !' });
    });

    it('should should call service givent post id ', () => {
      expect(mockPostRepository.deletePost).toHaveBeenCalledTimes(1);
      expect(mockPostRepository.deletePost).toHaveBeenCalledWith(post2.id);
    });

    it('should should call unlink ', () => {
      expect(unlinkSpy).toHaveBeenCalledTimes(3);
    });

    it('should throw error ', async () => {
      const post4 = new Post();
      post4.id = '4';
      try {
        const deletion = await service.remove(post4, req);
        expect(deletion).toBeUndefined();
      } catch (error) {
        expect(error.status).toEqual(400);
      }
    });
  });

  describe('likesManagement', () => {
    const likePostDto = new LikePostDto();

    it('should call addlike repo method', async () => {
      likePostDto.like = 'like';
      await service.likesManagement(post1.id, likePostDto, user);
      expect(mockPostRepository.addLike).toHaveBeenCalledTimes(1);
      expect(mockPostRepository.addLike).toHaveBeenCalledWith(
        post1.id,
        user.id,
      );
    });

    it('should call removeLike repo method', async () => {
      likePostDto.like = 'unlike';
      await service.likesManagement(post1.id, likePostDto, user);
      expect(mockPostRepository.removeLike).toHaveBeenCalledTimes(1);
      expect(mockPostRepository.removeLike).toHaveBeenCalledWith(
        post1.id,
        user.id,
      );
    });

    it('should throw an error', async () => {
      try {
        likePostDto.like = 'like';
        user.id = '999';
        const like = await service.likesManagement(post1.id, likePostDto, user);
        expect(mockPostRepository.addLike).toHaveBeenCalledWith('');
        expect(like).toBeUndefined();
      } catch (error) {
        expect(error.status).toEqual(400);
      }
    });

    it('should throw an error', async () => {
      try {
        likePostDto.like = 'lizfzfke';
        const like = await service.likesManagement(post1.id, likePostDto, user);
        expect(like).toBeUndefined();
      } catch (error) {
        expect(error.message).toEqual('Valeur de like incorrecte !');
      }
    });
  });
});
