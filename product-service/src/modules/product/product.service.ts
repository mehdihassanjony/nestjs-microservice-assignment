import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dtos/create-product.dto';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, lastValueFrom, timeout } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
// import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private configService: ConfigService,
    @Inject('RABBITMQ_CLIENT') private rabbitClient: ClientProxy,
  ) {}

  async onModuleInit() {
    // Temporary debug log
    console.log('Config values:', {
      uri: this.configService.get('RABBITMQ_URI'),
      queue: this.configService.get('RABBITMQ_QUEUE'),
    });

    try {
      await this.rabbitClient.connect();
      console.log('✅ Connected to RabbitMQ!');
    } catch (err) {
      console.error('❌ Connection failed:', err);
      throw err;
    }
  }

  async create(userId: string, createProductDto: CreateProductDto) {
    const product = new this.productModel({
      ...createProductDto,
      userId,
    });
    return product.save();
  }

  async findAll(userId: string) {
    return this.productModel.find({ userId }).exec();
  }

  async findOne(userId: string, id: string) {
    return this.productModel.findOne({ _id: id, userId }).exec();
  }

  async update(userId: string, id: string, updateData: any) {
    return this.productModel
      .findOneAndUpdate({ _id: id, userId }, updateData, { new: true })
      .exec();
  }

  async remove(userId: string, id: string) {
    return this.productModel.findOneAndDelete({ _id: id, userId }).exec();
  }

  async validateToken(token: string) {
    const correlationId = uuidv4();

    console.log('📨 Sending token with correlationId:', correlationId);

    const response = await lastValueFrom(
      this.rabbitClient
        .send<{ valid: boolean; userId?: string }>('validate_token', {
          token,
          correlationId,
        })
        .pipe(
          timeout(5000),
          catchError((err) => {
            console.error('🚨 RabbitMQ error:', err);
            throw new InternalServerErrorException('Token validation failed');
          }),
        ),
    );

    return response;
  }

  // async validateToken(token: string) {
  //   const response = await this.rabbitClient
  //     .send('auth_queue', { token }) // Send to the correct queue
  //     .toPromise();
  //   return response;
  // }
}
