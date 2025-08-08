import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOne('email', email);
    if (user && (await bcrypt.compare(user.password, pass))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  login(user: any) {
    const payload = { email: user.email, sub: { id: user.id } };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
