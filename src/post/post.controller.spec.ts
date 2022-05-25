import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { reqUser } from 'src/utils/decorators/user.decorator';
describe('PostController', () => {
  let controller: PostController;

  const mockPostService = {
    create: jest.fn((createPostDto) => {
      return {
        ...createPostDto,
      };
    }),
  };
  const mockGuard = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [PostService],
    })
      .overrideGuard(RolesGuard)
      .useValue(mockGuard)
      .overrideProvider(PostService)
      .useValue(mockPostService)
      .compile();

    controller = module.get<PostController>(PostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('Should create a post', () => {
    const file = null;
    const createPostDto = {
      text: 'hello this is a post',
    };
  });
});
