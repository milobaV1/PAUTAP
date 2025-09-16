import { Test, TestingModule } from '@nestjs/testing';
import { TriviaController } from './trivia.controller';
import { TriviaService } from './trivia.service';

describe('TriviaController', () => {
  let controller: TriviaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TriviaController],
      providers: [TriviaService],
    }).compile();

    controller = module.get<TriviaController>(TriviaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
