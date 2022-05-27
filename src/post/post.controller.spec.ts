import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { createMock } from '@golevelup/ts-jest';
import { Request } from 'express';
import { User } from 'src/user/entities/user.entity';
import { UserRoleEnum } from 'src/utils/enums/roles.enum';
import { Post } from './entities/post.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import { LikePostDto } from './dto/like-post.dto';

describe('PostController', () => {
  let controller: PostController;

  const post1 = new Post();
  post1.id = '1';
  const post2 = new Post();
  post2.id = '2';
  const postsArray = [post1, post2];

  const mockPostService = {
    create: jest.fn((file, createPostDto) => {
      return Promise.resolve({
        message: 'Publication enregistrée',
        ...createPostDto,
      });
    }),
    findAll: jest.fn().mockResolvedValue(postsArray),
    findOne: jest.fn((id) => {
      const post = postsArray.find((u) => u.id === id);
      return Promise.resolve(post);
    }),
    update: jest.fn().mockResolvedValue(post1),
    remove: jest.fn().mockResolvedValue({ message: 'Publication supprimée !' }),
    likesManagement: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        PostService,
        {
          provide: PostService,
          useValue: mockPostService,
        },
      ],
    }).compile();
    controller = await module.resolve<PostController>(PostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const file = null;
  const createPostDto = new CreatePostDto();
  createPostDto.text = 'hello this is a post';

  const user = new User();
  user.id = '1234';
  user.username = 'myusername';
  user.roles = UserRoleEnum.ADMIN;

  const req = createMock<Request>({
    user: {
      id: '123',
      username: 'test',
      roles: 'user',
    },
  });

  describe('create', () => {
    it('should return msg and created post', async () => {
      const post = await controller.create(file, createPostDto, user, req);
      expect(post).toEqual({
        message: 'Publication enregistrée',
        ...createPostDto,
      });
    });

    it('should call create service ', async () => {
      expect(mockPostService.create).toHaveBeenCalledTimes(1);
      expect(mockPostService.create).toHaveBeenCalledWith(
        file,
        createPostDto,
        user,
        req,
      );
    });
  });

  describe('find all', () => {
    const queryParams = {
      offset: '0',
      limit: '2',
    };
    it('should return post array  ', async () => {
      const posts = await controller.findAll(queryParams);
      expect(posts).toEqual(postsArray);
    });
    it('should call service given the query params ', () => {
      expect(mockPostService.findAll).toHaveBeenCalledTimes(1);
      expect(mockPostService.findAll).toHaveBeenCalledWith(queryParams);
    });
  });

  describe('find one', () => {
    it('should return a post', async () => {
      const post = await controller.findOne('1');
      expect(post).toEqual(post1);
    });
    it('should call service given the post id ', () => {
      expect(mockPostService.findOne).toHaveBeenCalledTimes(1);
      expect(mockPostService.findOne).toHaveBeenCalledWith('1');
    });
  });

  ////////////////////
  describe('update', () => {
    const updatePostDto = new UpdatePostDto();
    updatePostDto.text = 'update text ';

    it('should return psot ', async () => {
      const post = await controller.update(post1, updatePostDto, file, req);
      expect(post).toEqual(post);
    });

    it('should service service ', () => {
      expect(mockPostService.update).toBeCalledTimes(1);
      expect(mockPostService.update).toBeCalledWith(
        post1,
        updatePostDto,
        file,
        req,
      );
    });
  });

  describe('delete', () => {
    it('should return message ', async () => {
      const deletion = await controller.remove(post1, req);
      expect(deletion).toEqual({ message: 'Publication supprimée !' });
    });

    it('should should call service givent Post entity and req ', () => {
      expect(mockPostService.remove).toHaveBeenCalledTimes(1);
      expect(mockPostService.remove).toHaveBeenCalledWith(post1, req);
    });
  });

  describe('likesManagement', () => {
    const likePostDto = new LikePostDto();
    likePostDto.like = 'like';
    const user = new User();
    it('should call service  ', async () => {
      await controller.likesManagement('123', likePostDto, user);
      expect(mockPostService.likesManagement).toBeCalledTimes(1);
      expect(mockPostService.likesManagement).toBeCalledWith(
        '123',
        likePostDto,
        user,
      );
    });
  });
});
