import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from './session.service';

// describe('SessionService', () => {
//   let service: SessionService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [SessionService],
//     }).compile();

//     service = module.get<SessionService>(SessionService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
// });

describe('SessionService - Pure Functions', () => {
  let service: SessionService;

  beforeEach(() => {
    // Cast to any to avoid mocking all dependencies for now
    service = new SessionService(
      null as any,
      null as any,
      null as any,
      null as any,
      null as any,
      null as any,
      null as any,
      null as any,
      null as any,
      null as any,
      null as any,
    ) as any;
  });

  describe('checkAnswer', () => {
    it('should return true when answer is correct', () => {
      expect(service['checkAnswer'](2, 2)).toBe(true);
    });

    it('should return false when answer is wrong', () => {
      expect(service['checkAnswer'](2, 3)).toBe(false);
    });
  });

  describe('calculateTimeSpent', () => {
    it('should return 0 for empty answers', () => {
      expect(service['calculateTimeSpent']([])).toBe(0);
    });

    it('should calculate minutes between first and last answer', () => {
      const answers = [
        { ua_answeredAt: '2024-01-01T10:00:00Z' },
        { ua_answeredAt: '2024-01-01T10:30:00Z' },
      ];
      expect(service['calculateTimeSpent'](answers)).toBe(30);
    });
  });

  describe('calculateNextSyncTime', () => {
    it('should return 2 min interval for more than 5 answers', () => {
      expect(service['calculateNextSyncTime'](6)).toBe(120000);
    });

    it('should return 3 min interval for 1-5 answers', () => {
      expect(service['calculateNextSyncTime'](3)).toBe(180000);
    });

    it('should return 5 min interval for no answers', () => {
      expect(service['calculateNextSyncTime'](0)).toBe(300000);
    });
  });
});
