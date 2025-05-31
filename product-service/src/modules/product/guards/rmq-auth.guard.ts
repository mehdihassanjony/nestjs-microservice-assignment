import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ProductService } from '../product.service';

@Injectable()
export class RmqAuthGuard implements CanActivate {
  constructor(private readonly productService: ProductService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const validation = await this.productService.validateToken(token);
    if (!validation.valid) {
      throw new UnauthorizedException('Invalid token');
    }

    request.user = { userId: validation.userId };
    return true;
  }
}
