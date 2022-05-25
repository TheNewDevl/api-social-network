import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

describe('CommentController', () => {
  let controller: CommentController;

  const mockCommentService = {
    create: jest.fn((createCommentDto, user) => {
      const comment = {
        id: randomUUID(),
        text: createCommentDto.text,
        createdAt: Date.now(),
        user: {
          username: user.username,
          id: user.id,
        },
        post: {
          id: createCommentDto.postId,
        },
      };
      return comment;
    }),
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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Create post route', () => {
    const createCommentDto = {
      text: 'this is a comment',
      postId: 'azerty',
    };
    const user = {
      username: 'dupont',
      id: 'qwerty',
    };

    it('should be defined', async () => {
      expect(await controller.create(createCommentDto, user)).toBeDefined();
    });
  });
});
