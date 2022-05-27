import { Comment } from './comment.entity';

describe('Comment Entity', () => {
  const comment = new Comment();
  it('sould be defined', () => {
    expect(comment).toBeDefined();
  });
  it('sould contain text', () => {
    comment.text = 'test comment';
    expect(comment).toEqual({ text: 'test comment' });
  });
});
