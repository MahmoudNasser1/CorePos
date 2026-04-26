import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateCustomerDto {
  @ApiProperty({ example: 'عميل نقدي' })
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiProperty({ example: '01000000000', required: false })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiProperty({ example: 'القاهرة', required: false })
  @IsOptional()
  @IsString()
  address?: string

  @ApiProperty({ example: 'user@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiProperty({ example: '123456789', required: false })
  @IsOptional()
  @IsString()
  taxNumber?: string

  @ApiProperty({ example: '0', required: false, description: 'Numeric string for DB compatibility' })
  @IsOptional()
  @IsString()
  creditLimit?: string
}

export class CreateSupplierDto {
  @ApiProperty({ example: 'مورد عام' })
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiProperty({ example: '01000000000', required: false })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiProperty({ example: 'القاهرة', required: false })
  @IsOptional()
  @IsString()
  address?: string

  @ApiProperty({ example: 'supplier@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiProperty({ example: '123456789', required: false })
  @IsOptional()
  @IsString()
  taxNumber?: string
}
