import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { CommentRepository } from 'src/repositories/comment.repository';
import { Repository } from 'typeorm';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';

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

    findPaginatedCommentByPost: jest
      .fn()
      .mockResolvedValue(['comment1', 'comment2']),

    updateById: jest.fn().mockReturnValue(''),
    deleteComment: jest.fn(),
  };
  //////////
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

  describe('Find all by post ', () => {
    const queryParams = {
      offset: '0',
      limit: '2',
    };
    const postId = '1234';
    it('sould be defined', () => {
      expect(service.findAllByPost).toBeDefined();
    });

    it('should call commentRepository.findPaginatedCommentByPost', async () => {
      await service.findAllByPost(queryParams, postId);
      expect(mockCommmentRepo.findPaginatedCommentByPost).toHaveBeenCalledWith(
        0,
        2,
        '1234',
      );
    });
    it('sould return comments array', async () => {
      const comments = await service.findAllByPost(queryParams, postId);
      expect(comments).toEqual(['comment1', 'comment2']);
    });
  });

  describe('update', () => {
    const comment = new Comment();
    const updateCommentDto = { text: 'update text' };

    it('should return updated text ', async () => {
      const updated = await service.update(comment, updateCommentDto);
      expect(updated).toEqual(updateCommentDto);
    });
    it('should call updateById   ', async () => {
      expect(mockCommmentRepo.updateById).toHaveBeenCalledTimes(1);
      expect(mockCommmentRepo.updateById).toHaveBeenCalledWith(
        comment.id,
        updateCommentDto,
      );
    });
  });

  describe('remove', () => {
    const comment = new Comment();

    it('should return success message  ', async () => {
      const detele = await service.remove(comment);
      expect(detele).toEqual({ message: 'Publication supprimée !' });
    });

    it('should call deleteComment with comment id    ', async () => {
      expect(mockCommmentRepo.deleteComment).toHaveBeenCalledTimes(1);
      expect(mockCommmentRepo.deleteComment).toHaveBeenCalledWith(comment.id);
    });
  });
});
