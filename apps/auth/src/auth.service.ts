import {
  EmailService,
  UserEntity,
  UserJwt,
  UserRepositoryInterface,
} from '@app/shared';
import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { NewUserDTO } from './dtos/new-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDTO } from './dtos/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ActivationInput } from 'apps/api/src/InputTypes/user-Input';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  roles?: string[];
  password: string;
}
@Injectable()
export class AuthService {
  constructor(
    @Inject('UsersRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}
  getHello(): string {
    return 'Hello World! auth';
  }

  //create activate token
  async createActivateToken(user: UserData) {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = await this.jwtService.signAsync(
      {
        user,
        activationCode,
      },
      {
        expiresIn: '5m',
      },
    );

    return { token, activationCode };
  }

  async findByEmail(email: string): Promise<UserEntity> {
    return await this.userRepository.findByCondition({
      where: { email },
      select: ['email', 'id', 'firstName', 'lastName', 'password', 'roles'],
    });
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
  async register(newUser: NewUserDTO) {
    const { firstName, lastName, email, password, roles } = newUser;
    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      throw new RpcException({
        message: 'An account with that email already exists!',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    const hashedPassword = await this.hashPassword(password);
    newUser.password = hashedPassword;
    const createActivation = await this.createActivateToken(newUser);
    const activationCode = createActivation.activationCode;

    this.emailService.sendMail({
      email,
      subject: 'activate code',
      template: './activation-mail',
      name: firstName + lastName,
      activationCode,
    });

    // const savedUser = await this.userRepository.save({
    //   firstName,
    //   lastName,
    //   email,
    //   roles,
    //   password: hashedPassword,
    // });

    // delete savedUser.password;

    return { activation_token: createActivation.token };
  }
  async activateUser(activationDto: ActivationInput) {
    const { activationCode, activationToken } = activationDto;

    const newUser: { user: UserData; activationCode: string } =
      (await this.jwtService.verifyAsync(activationToken)) as {
        user: UserData;
        activationCode: string;
      };

    if (newUser.activationCode !== activationCode) {
      throw new RpcException({
        message: 'Invalid activation code',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const { firstName, lastName, email, password, roles } = newUser.user;

    const user = await this.userRepository.save({
      firstName,
      lastName,
      email,
      roles,
      password,
    });

    delete user.password;
    return { user };
  }

  async getUsers() {
    return await this.userRepository.findAll();
  }
  async getMe(userId: number) {
    return await this.userRepository.findByCondition({
      where: { id: userId },
      relations: ['products'],
    });
  }
  async doesPasswordMatch(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.findByEmail(email);

    const doesUserExist = !!user;

    if (!doesUserExist) {
      throw new RpcException({
        message: 'User NotFound ',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const doesPasswordMatch = await this.doesPasswordMatch(
      password,
      user.password,
    );

    if (!doesPasswordMatch) {
      throw new RpcException({
        message: 'Invalid credentials!',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    return user;
  }
  async login(loginUser: Readonly<LoginUserDTO>) {
    const { email, password } = loginUser;

    const user = await this.validateUser(email, password);

    if (!user) {
      throw new RpcException({
        message: 'Invalid credentials!',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    delete user.password;

    const jwt = await this.jwtService.signAsync({
      user,
    });

    return { user, token: jwt };
  }

  async logout(response: Response) {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
    return 'successfully logged out ';
  }
  async verifyJwt(jwt: string): Promise<{ user: UserEntity; exp: number }> {
    if (!jwt) {
      throw new RpcException({
        message: 'Invalid credentials!',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    try {
      const { user, exp } = await this.jwtService.verifyAsync(jwt);
      // console.log(user, exp);
      return { user, exp };
    } catch (error) {
      throw new RpcException({
        message: 'Invalid credentials!',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }
  }

  async getUserFromHeader(jwt: string): Promise<UserJwt> {
    if (!jwt) return;

    try {
      return this.jwtService.decode(jwt) as UserJwt;
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
  }

  // generate forgot password link
  async generateForgotPasswordLink(user: UserEntity) {
    const forgotPasswordToken = this.jwtService.sign(
      {
        user,
      },
      {
        secret: this.configService.get<string>('FORGOT_PASSWORD_SECRET'),
        expiresIn: '5m',
      },
    );
    return forgotPasswordToken;
  }
  // forgot password
  async forgotPassword(email: string) {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new RpcException({
        message: 'User not found with this email!',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    const forgotPasswordToken = await this.generateForgotPasswordLink(user);

    const resetPasswordUrl =
      this.configService.get<string>('CLIENT_SIDE_URI') +
      `/reset-password?verify=${forgotPasswordToken}`;

    await this.emailService.sendMail({
      email,
      subject: 'Reset your Password!',
      template: './forgot-password',
      name: user.firstName + user.lastName,
      activationCode: resetPasswordUrl,
    });

    return { message: `Your forgot password request succesful!` };
  }

  async resetPassword(resetPasswordDto: {
    password: string;
    activationToken: string;
  }) {
    const { password, activationToken } = resetPasswordDto;

    const decoded = await this.jwtService.decode(activationToken);

    if (!decoded || decoded?.exp * 1000 < Date.now()) {
      // ||decoded?.exp * 1000 < Date.now()
      throw new RpcException({
        message: 'Invalid token!',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    const user = await this.findByEmail(decoded.user.email);
    user.password = await this.hashPassword(password);
    await this.userRepository.save(user);

    // const hashedPassword = await this.hashPassword(password);

    // // const user = await this.userRepository.update(decoded.user.id, {
    // //   password: hashedPassword,
    // // });

    return { user };
  }
}
