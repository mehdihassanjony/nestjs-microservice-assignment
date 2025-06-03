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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('products')
@UseGuards(RmqAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiTags('New Product')
  @Post()
  @ApiOperation({ summary: 'Post a new product user' })
  @ApiResponse({
    status: 201,
    type: CreateProductDto,
  })
  async create(@Req() req, @Body() createProductDto: CreateProductDto) {
    console.log(createProductDto);
    return this.productService.create(req.user.userId, createProductDto);
  }

  @ApiTags('All product')
  @Get()
  @ApiOperation({ summary: 'View all products by user' })
  async findAll(@Req() req) {
    return this.productService.findAll(req.user.userId);
  }

  @ApiTags('Single')
  @Get(':id')
  @ApiOperation({ summary: 'Single product' })
  async findOne(@Req() req, @Param('id') id: string) {
    return this.productService.findOne(req.user.userId, id);
  }

  @ApiTags('New Product')
  @Put(':id')
  async update(@Req() req, @Param('id') id: string, @Body() updateData: any) {
    return this.productService.update(req.user.userId, id, updateData);
  }

  @ApiTags('New Product')
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    return this.productService.remove(req.user.userId, id);
  }
}
