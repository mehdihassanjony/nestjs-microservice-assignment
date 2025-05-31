import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { RmqAuthGuard } from './guards/rmq-auth.guard';

@Controller('products')
@UseGuards(RmqAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Req() req, @Body() createProductDto: CreateProductDto) {
    console.log(createProductDto);
    return this.productService.create(req.user.userId, createProductDto);
  }

  @Get()
  async findAll(@Req() req) {
    return this.productService.findAll(req.user.userId);
  }

  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string) {
    return this.productService.findOne(req.user.userId, id);
  }

  @Put(':id')
  async update(@Req() req, @Param('id') id: string, @Body() updateData: any) {
    return this.productService.update(req.user.userId, id, updateData);
  }

  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    return this.productService.remove(req.user.userId, id);
  }
}
