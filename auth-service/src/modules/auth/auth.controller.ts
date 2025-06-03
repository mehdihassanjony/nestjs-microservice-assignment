import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { MessagePattern } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiTags('register')
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    type: CreateUserDto,
  })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @ApiTags('Login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login a user' })
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @ApiTags('Validate Token')
  @MessagePattern('validate_token')
  async validateToken(data: { token: string }) {
    return this.authService.validateToken(data.token);
  }
}
