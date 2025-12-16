import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserServiceService } from './user-service.service';
import { CreateUserServiceDto } from './dto/create-user-service.dto';
import { UpdateUserServiceDto } from './dto/update-user-service.dto';

@Controller()
export class UserServiceController {
  constructor(private readonly userServiceService: UserServiceService) {}

  @MessagePattern('createUserService')
  create(@Payload() createUserServiceDto: CreateUserServiceDto) {
    return this.userServiceService.create(createUserServiceDto);
  }

  @MessagePattern('findAllUserService')
  findAll() {
    return this.userServiceService.findAll();
  }

  @MessagePattern('findOneUserService')
  findOne(@Payload() id: number) {
    return this.userServiceService.findOne(id);
  }

  @MessagePattern('updateUserService')
  update(@Payload() updateUserServiceDto: UpdateUserServiceDto) {
    return this.userServiceService.update(updateUserServiceDto.id, updateUserServiceDto);
  }

  @MessagePattern('removeUserService')
  remove(@Payload() id: number) {
    return this.userServiceService.remove(id);
  }
}
