import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOne('email', email);

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  login(user: any) {
    const payload = {
      email: user.email,
      sub: { id: user.id, roleId: user.role.id },
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findOne('email', email);
    if (!user) throw new NotFoundException(`No user found for email: ${email}`);

    // await this.emailService.sendResetPasswordLink(email);

    const payload = { email };

    const token = this.jwtService.sign(payload, { expiresIn: '15m' });

    user.resetToken = token;
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const url = `${frontendUrl}/reset-password?token=${token}`;

    await this.emailQueue.add(
      'reset-password',
      {
        to: user.email,
        subject: '🔐 Reset Your Password',
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f9fafb;
              color: #2e3f6f;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            }
            h1 {
              font-size: 22px;
              margin-bottom: 20px;
              text-align: center;
              color: #2e3f6f;
            }
            p {
              font-size: 16px;
              line-height: 1.5;
              color: #444;
            }
            .button {
              display: inline-block;
              padding: 12px 20px;
              margin: 20px auto;
              background-color: #2e3f6f;
              color: #ffffff !important;
              text-decoration: none;
              font-weight: bold;
              border-radius: 6px;
            }
            .warning {
              margin-top: 20px;
              font-size: 14px;
              color: #b33a3a;
              background: #fff3f3;
              padding: 10px;
              border-radius: 6px;
              text-align: center;
            }
            .footer {
              margin-top: 30px;
              font-size: 12px;
              color: #777;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Password Reset Request</h1>
            <p>Hi ${user.first_name || ''},</p>
            <p>
              We received a request to reset your account password. If this was you, click the button below to set a new password:
            </p>
            <p style="text-align: center;">
              <a href="${url}" class="button">Reset Password</a>
            </p>
            <div class="warning">
              <p>If you did not request this, please ignore this email. Your account is still secure.</p>
            </div>
            <div class="footer">
             <p>You’re receiving this email because you use the PAU Training Application.</p>
            </div>
          </div>
        </body>
      </html>
    `,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 10,
        removeOnFail: 5,
      },
    );
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const email = await this.decodeConfirmationToken(token);

    const user = await this.userService.findOne('email', email);
    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    const isSame = await bcrypt.compare(password, user.password);
    if (isSame) {
      throw new BadRequestException(
        'New password cannot be the same as your old password',
      );
    }

    user.password = password;
    delete user.resetToken; // remove the token after the password is updated
    await this.userService.save(user);
  }

  private async decodeConfirmationToken(token: string) {
    try {
      const payload = await this.jwtService.verify(token);

      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
      throw new BadRequestException();
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Email confirmation token expired');
      }
      throw new BadRequestException('Bad confirmation token');
    }
  }
}
