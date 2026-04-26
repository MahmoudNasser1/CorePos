import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateProductDto {
  @ApiProperty({ example: 'ماوس لاسلكي' })
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiProperty({ example: 'Wireless Mouse', required: false })
  @IsOptional()
  @IsString()
  nameEn?: string

  @ApiProperty({ example: 'uuid-category', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string

  @ApiProperty({ example: 'uuid-unit', required: false })
  @IsOptional()
  @IsString()
  unitId?: string

  @ApiProperty({ example: '1234567890', required: false })
  @IsOptional()
  @IsString()
  barcode?: string

  @ApiProperty({ example: 'SKU-001', required: false })
  @IsOptional()
  @IsString()
  sku?: string

  @ApiProperty({ example: '150', required: false, description: 'Numeric string for DB compatibility' })
  @IsOptional()
  @IsString()
  price1?: string

  @ApiProperty({ example: '100', required: false, description: 'Numeric string for DB compatibility' })
  @IsOptional()
  @IsString()
  costPrice?: string

  @ApiProperty({ example: 'uuid-warehouse', required: false })
  @IsOptional()
  @IsString()
  warehouseId?: string

  @ApiProperty({ example: '10', required: false, description: 'Numeric string for DB compatibility' })
  @IsOptional()
  @IsString()
  initialQty?: string

  @ApiProperty({ example: '140', required: false, description: 'Wholesale / tier 2 price' })
  @IsOptional()
  @IsString()
  price2?: string

  @ApiProperty({ example: '130', required: false, description: 'Tier 3 price' })
  @IsOptional()
  @IsString()
  price3?: string

  @ApiProperty({ example: '5', required: false, description: 'Min stock threshold' })
  @IsOptional()
  @IsString()
  minQty?: string

  @ApiProperty({
    example: 'https://cdn.example.com/products/mouse.jpg',
    required: false,
    description: 'Public HTTPS URL for product image (no file upload in this version).',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  imageUrl?: string
}

export class CreateCategoryDto {
  @ApiProperty({ example: 'إلكترونيات' })
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiProperty({ example: 'uuid-parent', required: false })
  @IsOptional()
  @IsString()
  parentId?: string
}

export class CreateUnitDto {
  @ApiProperty({ example: 'قطعة' })
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiProperty({ example: 'Piece', required: false })
  @IsOptional()
  @IsString()
  nameEn?: string
}
