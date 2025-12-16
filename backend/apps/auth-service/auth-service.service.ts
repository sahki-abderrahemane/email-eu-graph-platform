import { Injectable } from '@nestjs/common';
import { CreateAuthServiceDto } from './dto/create-auth-service.dto';
import { UpdateAuthServiceDto } from './dto/update-auth-service.dto';

@Injectable()
export class AuthServiceService {
  create(createAuthServiceDto: CreateAuthServiceDto) {
    return 'This action adds a new authService';
  }

  findAll() {
    return `This action returns all authService`;
  }

  findOne(id: number) {
    return `This action returns a #${id} authService`;
  }

  update(id: number, updateAuthServiceDto: UpdateAuthServiceDto) {
    return `This action updates a #${id} authService`;
  }

  remove(id: number) {
    return `This action removes a #${id} authService`;
  }
}
