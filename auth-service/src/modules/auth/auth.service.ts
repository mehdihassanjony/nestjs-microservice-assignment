import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dtos/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import * as amqp from 'amqplib';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject('RABBITMQ_CLIENT') private rabbitClient: ClientProxy,
  ) {
    // this.setupTokenValidationListener(); // Initialize RabbitMQ listener
  }
  private channel: amqp.Channel;

  async onModuleInit() {
    const connection = await amqp.connect(process.env.RABBITMQ_URI);
    this.channel = await connection.createChannel();
    await this.channel.assertQueue('auth_queue', { durable: false });

    this.channel.consume('auth_queue', async (msg) => {
      if (msg !== null) {
        try {
          const { pattern, data } = JSON.parse(msg.content.toString());
          console.log('🔑 Received message:', {
            pattern,
            token: data.token.substring(0, 15) + '...',
          });

          if (pattern === 'validate_token') {
            const result = await this.validateToken(data.token); // Now correctly accessing token

            this.channel.sendToQueue(
              msg.properties.replyTo,
              Buffer.from(JSON.stringify(result)),
              { correlationId: msg.properties.correlationId },
            );
          }
        } catch (err) {
          console.error('❌ Message processing failed:', err);
        } finally {
          this.channel.ack(msg);
        }
      }
    });
  }

  async register(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    await user.save();

    // Publish user.created event
    this.rabbitClient.emit('user.created', {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    return user;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    return user;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN'),
      }),
    };
  }

  async validateToken(token: string) {
    if (!token) {
      throw new Error('No token provided');
    }
    return this.jwtService.verify(token); // Now gets the proper token string
  }

  // async validateToken(token: string) {
  //   console.log(token);
  //   try {
  //     const payload = this.jwtService.verify(token);
  //     const user = await this.userModel.findById(payload.sub);

  //     if (!user) {
  //       return { valid: false };
  //     }

  //     // Check user.role (singular) instead of user.roles
  //     const canCreateProduct = user.role === 'seller' || user.role === 'admin';

  //     return {
  //       valid: true,
  //       userId: payload.sub,
  //       canCreateProduct,
  //     };
  //   } catch (error) {
  //     console.log(error);
  //     return { valid: false };
  //   }
  // }

  // private setupTokenValidationListener() {
  //   this.rabbitClient
  //     .send('validate_token', {})
  //     .subscribe(async (data: { token: string }) => {
  //       console.log(
  //         '📩 Received token validation request:',
  //         data.token.substring(0, 15) + '...',
  //       ); // Log partial token
  //       const result = await this.validateToken(data.token);
  //       console.log('📤 Sending validation result:', result); // Log response
  //       return result;
  //     });
  // }

  // @MessagePattern('validate_token')
  // async handleTokenValidation(data: { token: string }) {
  //   console.log('🔑 Received token:', data.token.substring(0, 10) + '...'); // Log first 10 chars
  //   const result = await this.validateToken(data.token);
  //   console.log('📤 Sending validation result:', result);
  //   return result;
  // }

  // @MessagePattern('validate_token')
  // async handleTokenValidation(data: { token: string }) {
  //   console.log('🔑 Received token:', data.token.substring(0, 15) + '...');
  //   return this.validateToken(data.token);
  // }
}
