import { User } from './user.entity';

describe('User Entity', () => {
  const user = new User();
  it('sould be defined', () => {
    expect(user).toBeDefined();
  });
});
