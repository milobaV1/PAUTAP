import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Controller, Inject, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { Public } from './core/metadata/public.metadata';
import { User } from './modules_2/users/entities/user.entity';

@Controller('health')
export class HealthController {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Public()
  @Get()
  async check() {
    const health = { status: 'ok', database: 'unknown', cache: 'unknown' };

    try {
      await this.userRepo.query('SELECT 1');
      health.database = 'connected';
    } catch (error) {
      health.database = 'disconnected';
      health.status = 'error';
    }

    try {
      await this.cacheManager.set('health_check', 'ok', 1000);
      await this.cacheManager.get('health_check');
      health.cache = 'connected';
    } catch (error) {
      health.cache = 'disconnected';
      health.status = 'error';
    }

    return health;
  }
}
