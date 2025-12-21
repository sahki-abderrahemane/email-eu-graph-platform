import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { AuthServiceService } from './auth-service.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller()
export class AuthServiceController {
  private readonly logger = new Logger(AuthServiceController.name);

  constructor(private readonly authServiceService: AuthServiceService) { }

  @MessagePattern('auth.register')
  async register(@Payload() registerDto: RegisterDto) {
    try {
      this.logger.log(`Registration attempt for email: ${registerDto.email}`);
      const result = await this.authServiceService.register(registerDto);
      this.logger.log(`Registration successful for email: ${registerDto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Registration failed: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 500,
        message: error.message || 'Registration failed',
      });
    }
  }

  @MessagePattern('auth.login')
  async login(@Payload() loginDto: LoginDto) {
    try {
      this.logger.log(`Login attempt for email: ${loginDto.email}`);
      const result = await this.authServiceService.login(loginDto);
      this.logger.log(`Login successful for email: ${loginDto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 401,
        message: error.message || 'Login failed',
      });
    }
  }

  @MessagePattern('auth.verify')
  async verifyToken(@Payload() { token }: { token: string }) {
    try {
      return await this.authServiceService.verifyToken(token);
    } catch (error) {
      this.logger.error(`Token verification failed: ${error.message}`);
      return { valid: false };
    }
  }

  @MessagePattern('user.findOne')
  async findUser(@Payload() { id }: { id: string }) {
    try {
      const user = await this.authServiceService.findUserById(id);
      if (!user) {
        throw new RpcException({ statusCode: 404, message: 'User not found' });
      }
      return user;
    } catch (error) {
      throw new RpcException({
        statusCode: error.status || 500,
        message: error.message,
      });
    }
  }

  @MessagePattern('user.findAll')
  async findAllUsers() {
    try {
      return await this.authServiceService.findAllUsers();
    } catch (error) {
      throw new RpcException({
        statusCode: 500,
        message: 'Failed to fetch users',
      });
    }
  }

  @MessagePattern('user.update')
  async updateUser(@Payload() data: { id: string;[key: string]: any }) {
    try {
      const { id, ...updateData } = data;
      const user = await this.authServiceService.updateUser(id, updateData);
      if (!user) {
        throw new RpcException({ statusCode: 404, message: 'User not found' });
      }
      return user;
    } catch (error) {
      throw new RpcException({
        statusCode: error.status || 500,
        message: error.message,
      });
    }
  }

  @MessagePattern('user.delete')
  async deleteUser(@Payload() { id }: { id: string }) {
    try {
      const result = await this.authServiceService.deleteUser(id);
      if (!result) {
        throw new RpcException({ statusCode: 404, message: 'User not found' });
      }
      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      throw new RpcException({
        statusCode: error.status || 500,
        message: error.message,
      });
    }
  }

  @MessagePattern('user.profile')
  async getUserProfile(@Payload() { id }: { id: string }) {
    try {
      const user = await this.authServiceService.getUserProfile(id);
      if (!user) {
        throw new RpcException({ statusCode: 404, message: 'User not found' });
      }
      return user;
    } catch (error) {
      throw new RpcException({
        statusCode: error.status || 500,
        message: error.message,
      });
    }
  }
}
