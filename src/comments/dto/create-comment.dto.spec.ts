import { CreateCommentDto } from './create-comment.dto';
describe('Comment Entity', () => {
  it('sould be defined', () => {
    const dto = new CreateCommentDto();
    expect(dto).toBeDefined();
  });
});
