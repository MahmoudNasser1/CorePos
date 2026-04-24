import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

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
