import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthServiceService } from './auth-service.service';
import { CreateAuthServiceDto } from './dto/create-auth-service.dto';
import { UpdateAuthServiceDto } from './dto/update-auth-service.dto';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) {}

  @MessagePattern('createAuthService')
  create(@Payload() createAuthServiceDto: CreateAuthServiceDto) {
    return this.authServiceService.create(createAuthServiceDto);
  }

  @MessagePattern('findAllAuthService')
  findAll() {
    return this.authServiceService.findAll();
  }

  @MessagePattern('findOneAuthService')
  findOne(@Payload() id: number) {
    return this.authServiceService.findOne(id);
  }

  @MessagePattern('updateAuthService')
  update(@Payload() updateAuthServiceDto: UpdateAuthServiceDto) {
    return this.authServiceService.update(updateAuthServiceDto.id, updateAuthServiceDto);
  }

  @MessagePattern('removeAuthService')
  remove(@Payload() id: number) {
    return this.authServiceService.remove(id);
  }
}
