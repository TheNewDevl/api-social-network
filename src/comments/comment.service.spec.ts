import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { CommentRepository } from 'src/repositories/comment.repository';
import { CommentService } from './comment.service';

describe('CommentService', () => {
  let service: CommentService;

  const postIdList = ['azerty', 'quzerty'];
  const userIdList = ['123', '456'];

  const mockCommmentRepo = {
    create: jest.fn((text) => {
      return { ...text };
    }),
    saveComment: jest.fn((object) => {
      return {
        id: randomUUID(),
        ...object,
        createdAt: Date.now().toLocaleString(),
      };
    }),
    setUserRelation: jest.fn((data, userId) => {
      const user = userIdList.includes(userId);
      if (!user) {
        throw new Error('id fourni ne correspond à aucun user');
      }
    }),
    setPostRelation: jest.fn((data, postId) => {
      const post = postIdList.includes(postId);
      if (!post) {
        throw new Error('id fourni ne correspond à aucun post');
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(CommentRepository),
          useValue: mockCommmentRepo,
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  describe('Create', () => {
    const createCommentDto = {
      text: 'this is a comment',
      postId: 'azerty',
    };
    const user = {
      username: 'dupont',
      id: '123',
    };

    it('should call create method passing text property', async () => {
      await service.create(createCommentDto, user);
      expect(mockCommmentRepo.create).toHaveBeenCalledWith({
        text: 'this is a comment',
      });
    });

    it('should call setUserRelation', async () => {
      expect(mockCommmentRepo.setUserRelation).toHaveBeenCalledWith(
        { text: 'this is a comment' },
        '123',
      );
    });

    it('should call setPostRelation', async () => {
      expect(mockCommmentRepo.setUserRelation).toHaveBeenCalledWith(
        { text: 'this is a comment' },
        '123',
      );
    });

    it('should throw error if given post id is not valid', async () => {
      try {
        await service.create(
          {
            text: 'this is a comment',
            postId: 'efef',
          },
          user,
        );
      } catch (error) {
        expect(error.message).toEqual('id fourni ne correspond à aucun post');
      }
    });

    it('should throw error if given post id is not valid', async () => {
      try {
        await service.create(createCommentDto, {
          username: 'dupont',
          id: 'àààà',
        });
      } catch (error) {
        expect(error.message).toEqual('id fourni ne correspond à aucun user');
      }
    });

    it('should return a complete comment incliding user and post informations', async () => {
      const comment = await service.create(createCommentDto, user);
      expect(comment).toEqual({
        id: expect.any(String),
        text: createCommentDto.text,
        createdAt: expect.any(String),
        user: {
          username: user.username,
          id: user.id,
        },
        post: {
          id: createCommentDto.postId,
        },
      });
    });
  });
});
