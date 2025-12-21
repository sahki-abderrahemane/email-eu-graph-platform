import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthServiceService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto): Promise<{ user: any; accessToken: string }> {
    const { name, email, password, role } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = new this.userModel({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || 'user',
      });

      const savedUser = await user.save();

      // Generate JWT token
      const payload = {
        sub: savedUser._id.toString(),
        email: savedUser.email,
        role: savedUser.role,
        name: savedUser.name
      };
      const accessToken = this.jwtService.sign(payload);

      return {
        user: {
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          role: savedUser.role,
        },
        accessToken,
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('User with this email already exists');
      }
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async login(loginDto: LoginDto): Promise<{ user: any; accessToken: string }> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    };
  }

  async verifyToken(token: string): Promise<{ valid: boolean; user?: any }> {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.userModel.findById(decoded.sub).select('-password');

      if (!user || !user.isActive) {
        return { valid: false };
      }

      return {
        valid: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      return { valid: false };
    }
  }

  async findUserById(id: string): Promise<User | null> {
    return this.userModel.findById(id).select('-password');
  }

  async findAllUsers(): Promise<User[]> {
    return this.userModel.find().select('-password');
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User | null> {
    // Don't allow updating password through this method
    delete updateData.password;

    return this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-password');
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id);
    return !!result;
  }

  async getUserProfile(id: string): Promise<User | null> {
    return this.userModel.findById(id).select('-password');
  }
}
