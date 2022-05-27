import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Post } from '../post/entities/post.entity';
import { User } from '../user/entities/user.entity';
import { Comment } from './entities/comment.entity';
describe('CommentController', () => {
  let controller: CommentController;

  const mockCommentService = {
    create: jest.fn((createCommentDto, user) => {
      const comment = {
        id: randomUUID(),
        text: createCommentDto.text,
        createdAt: null,
        user: {
          username: user.username,
          id: user.id,
          ...new User(),
          getUserId() {
            return '';
          },
        },
        post: {
          id: createCommentDto.postId,
          user: { ...new User() },
          ...new Post(),
          getUserId() {
            return '';
          },
        },
        lastComment: 0,
        deletedAt: null,
        updatedAt: null,
        userId: user.id,
        getUserId() {
          return '';
        },
      };
      return comment;
    }),
    findAllByPost: jest.fn(() => {
      return '';
    }),
    update: jest.fn((comment, updateCommentDto) => {
      return { ...updateCommentDto };
    }),
    remove: jest.fn().mockResolvedValue({ message: 'Publication supprimée !' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        {
          provide: CommentService,
          useValue: mockCommentService,
        },
      ],
    }).compile();
    controller = await module.resolve<CommentController>(CommentController);
  });

  const createCommentDto = {
    text: 'this is a comment',
    postId: 'azerty',
  };
  const user = {
    username: 'dupont',
    id: 'qwerty',
  };

  it('controller should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Create post route', () => {
    it('should call one create method from comment service ', async () => {
      await controller.create(createCommentDto, user);
      expect(mockCommentService.create).toHaveBeenCalled();
    });
    it('should call service with createCommentDto and user ', async () => {
      expect(mockCommentService.create).toBeCalledWith(createCommentDto, user);
    });
    it('should return', async () => {
      const comment = await controller.create(createCommentDto, user);
      expect(comment).toBeDefined();
    });
  });

  describe(' route get findAllByPost', () => {
    const queryParams = {
      offset: '1',
      limit: '1',
    };
    const postId = 'AZERTY';
    it('should call service method once with postId and an object containing offset and limit ', async () => {
      await controller.findAllByPost(postId, queryParams);
      expect(mockCommentService.findAllByPost).toHaveBeenCalledTimes(1);
      expect(mockCommentService.findAllByPost).toHaveBeenCalledWith(
        { limit: '1', offset: '1' },
        'AZERTY',
      );
    });
  });

  describe(' patch update ', () => {
    const comment = mockCommentService.create(createCommentDto, user);
    const updateCommentDto = { text: 'update text' };

    it('should call service update methode one, passing comment Entity and dto ', async () => {
      await controller.update(comment, updateCommentDto);
      expect(mockCommentService.update).toHaveBeenCalledTimes(1);
      expect(mockCommentService.update).toHaveBeenCalledWith(
        comment,
        updateCommentDto,
      );
    });

    it('should return dto  ', async () => {
      expect(await controller.update(comment, updateCommentDto)).toEqual(
        updateCommentDto,
      );
    });
  });

  describe(' remove ', () => {
    const comment = new Comment();
    it('should return msg  ', async () => {
      const remove = await controller.remove(comment);
      expect(remove).toEqual({ message: 'Publication supprimée !' });
    });

    it('should return msg ', () => {
      expect(mockCommentService.remove).toHaveBeenCalledTimes(1);
      expect(mockCommentService.remove).toHaveBeenCalledWith(comment);
    });
  });
});
