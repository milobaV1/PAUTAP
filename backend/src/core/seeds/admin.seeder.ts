import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Department } from 'src/modules_2/users/entities/department.entity';
import { Role } from 'src/modules_2/users/entities/role.entity';
import { User } from 'src/modules_2/users/entities/user.entity';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminSeeder implements OnApplicationBootstrap {
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const userRepo = this.dataSource.getRepository(User);
    const roleRepo = this.dataSource.getRepository(Role);
    const departmentRepo = this.dataSource.getRepository(Department);

    const adminEmail = this.configService.get<string>(
      'SEED_ADMIN_EMAIL',
      'admin@example.com',
    );
    const adminPassword = this.configService.get<string>(
      'SEED_ADMIN_PASSWORD',
      'Admin123!',
    );

    const userCount = await userRepo.count();
    if (userCount > 0) return;

    console.log('🌱 No users found. Seeding initial data...');

    let superDepartment = await departmentRepo.findOne({
      where: { name: 'System Administration' },
    });

    if (!superDepartment) {
      superDepartment = departmentRepo.create({
        name: 'System Administration',
      });
      await departmentRepo.save(superDepartment);
      console.log('System Administration department created');
    }

    let adminRole = await roleRepo.findOne({ where: { name: 'System Admin' } });
    if (!adminRole) {
      adminRole = roleRepo.create({
        name: 'System Admin',
        department: superDepartment,
      });
      await roleRepo.save(adminRole);
      console.log('Created System Admin role.');
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminUser = userRepo.create({
      first_name: 'Super',
      last_name: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      role: adminRole,
      is_onboarding: false,
    });

    await userRepo.save(adminUser);

    console.log('✅ Admin user created:');
    console.log('   Email: admin@example.com');
    console.log('   Password: Admin123!');
  }
}
