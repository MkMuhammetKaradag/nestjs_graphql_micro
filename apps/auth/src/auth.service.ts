import { UserEntity, UserJwt, UserRepositoryInterface } from '@app/shared';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { NewUserDTO } from './dtos/new-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDTO } from './dtos/login-user.dto';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    @Inject('UsersRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
    private readonly jwtService: JwtService,
  ) {}
  getHello(): string {
    return 'Hello World! auth';
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
  async register(newUser: NewUserDTO): Promise<UserEntity> {
    const { firstName, lastName, email, password, roles } = newUser;
    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('An account with that email already exists!');
    }

    const hashedPassword = await this.hashPassword(password);

    const savedUser = await this.userRepository.save({
      firstName,
      lastName,
      email,
      roles,
      password: hashedPassword,
    });

    delete savedUser.password;
    return savedUser;
  }
  async getUsers() {
    return await this.userRepository.findAll();
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

    if (!doesUserExist) return null; //  throw new NotFoundException('User not found!');

    const doesPasswordMatch = await this.doesPasswordMatch(
      password,
      user.password,
    );

    if (!doesPasswordMatch) return null; //throw new UnauthorizedException('Invalid credentials!');

    return user;
  }
  async login(loginUser: Readonly<LoginUserDTO>) {
    const { email, password } = loginUser;

    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials!');
    }

    delete user.password;

    const jwt = await this.jwtService.signAsync({
      user,
    });

    return { user, token: jwt };
  }

  async verifyJwt(jwt: string): Promise<{ user: UserEntity; exp: number }> {
    if (!jwt) {
      throw new UnauthorizedException();
    }

    try {
      const { user, exp } = await this.jwtService.verifyAsync(jwt);
      // console.log(user, exp);
      return { user, exp };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async getUserFromHeader(jwt: string): Promise<UserJwt> {
    if (!jwt) return;

    try {
      return this.jwtService.decode(jwt) as UserJwt;
    } catch (error) {
      throw new BadRequestException();
    }
  }
}
