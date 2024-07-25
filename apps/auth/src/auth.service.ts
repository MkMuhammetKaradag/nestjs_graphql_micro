import { UserRepositoryInterface } from '@app/shared';
import { Inject, Injectable } from '@nestjs/common';
import { NewUserDTO } from './dtos/new-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('UsersRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
  ) {}
  getHello(): string {
    return 'Hello World! auth';
  }

  async register(newUser: NewUserDTO) {
    const user = await this.userRepository.save(newUser);
    return user;
  }
  async getUsers() {
    const users = [
      { id: 1, name: 'John', email: 'john@john.com' },
      { id: 2, name: 'John1', email: 'john1@john.com' },
      { id: 3, name: 'John2', email: 'john2@john.com' },
    ];

    return users;
  }
}
