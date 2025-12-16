import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthServiceDto } from './create-auth-service.dto';

export class UpdateAuthServiceDto extends PartialType(CreateAuthServiceDto) {
  id: number;
}
