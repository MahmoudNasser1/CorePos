import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator'

export class InvoiceLineDto {
  @ApiProperty({ example: 'uuid-product' })
  @IsString()
  @IsNotEmpty()
  productId!: string

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(0.000001)
  quantity!: number

  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(0)
  unitPrice!: number
}

export class CreatePosSaleDto {
  @ApiProperty({ example: 'uuid-company' })
  @IsOptional()
  @IsString()
  companyId?: string

  @ApiProperty({ example: 'uuid-branch' })
  @IsString()
  @IsNotEmpty()
  branchId!: string

  @ApiProperty({ example: 'uuid-warehouse' })
  @IsString()
  @IsNotEmpty()
  warehouseId!: string

  @ApiProperty({ example: 'uuid-treasury', nullable: true, required: false })
  @IsOptional()
  @IsString()
  treasuryId?: string | null

  @ApiProperty({ example: 'uuid-customer', nullable: true, required: false })
  @IsOptional()
  @IsString()
  customerId?: string | null

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  discountAmount!: number

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  taxAmount!: number

  @ApiProperty({ example: 300 })
  @IsNumber()
  @Min(0)
  totalAmount!: number

  @ApiProperty({ enum: ['cash', 'card', 'deferred'] })
  @IsString()
  @IsIn(['cash', 'card', 'deferred'])
  paymentMethod!: 'cash' | 'card' | 'deferred'

  @ApiProperty({ type: [InvoiceLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineDto)
  lines!: InvoiceLineDto[]
}

export class CreateSaleInvoiceItemDto {
  @ApiProperty({ example: 'uuid-product' })
  @IsString()
  @IsNotEmpty()
  productId!: string

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0.000001)
  qty!: number

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  unitPrice!: number

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  totalLine!: number
}

export class CreateSaleInvoiceDto {
  @ApiProperty({ example: 'uuid-branch' })
  @IsString()
  @IsNotEmpty()
  branchId!: string

  @ApiProperty({ example: 'uuid-warehouse' })
  @IsString()
  @IsNotEmpty()
  warehouseId!: string

  @ApiProperty({ example: 'uuid-customer', required: false, nullable: true })
  @IsOptional()
  @IsString()
  customerId?: string | null

  @ApiProperty({ example: 'uuid-cashier' })
  @IsString()
  @IsNotEmpty()
  cashierId!: string

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  subtotal!: number

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  discountAmount!: number

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  taxAmount!: number

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  total!: number

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  paid!: number

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  remaining!: number

  @ApiProperty({ type: [CreateSaleInvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleInvoiceItemDto)
  items!: CreateSaleInvoiceItemDto[]
}

export class CreatePurchaseInvoiceItemDto {
  @ApiProperty({ example: 'uuid-product' })
  @IsString()
  @IsNotEmpty()
  productId!: string

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0.000001)
  qty!: number

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  unitPrice!: number

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  totalLine!: number
}

export class CreatePurchaseInvoiceDto {
  @ApiProperty({ example: 'uuid-branch' })
  @IsString()
  @IsNotEmpty()
  branchId!: string

  @ApiProperty({ example: 'uuid-warehouse' })
  @IsString()
  @IsNotEmpty()
  warehouseId!: string

  @ApiProperty({ example: 'uuid-supplier', required: false, nullable: true })
  @IsOptional()
  @IsString()
  supplierId?: string | null

  @ApiProperty({ example: 'uuid-cashier' })
  @IsString()
  @IsNotEmpty()
  cashierId!: string

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  subtotal!: number

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  discountAmount!: number

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  taxAmount!: number

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  total!: number

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  paid!: number

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  remaining!: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  treasuryId?: string | null

  @ApiProperty({ type: [CreatePurchaseInvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseInvoiceItemDto)
  items!: CreatePurchaseInvoiceItemDto[]
}

export class CreateQuotationDto {
  @ApiProperty({ example: 'uuid-branch' })
  @IsString()
  @IsNotEmpty()
  branchId!: string

  @ApiProperty({ example: 'uuid-warehouse' })
  @IsString()
  @IsNotEmpty()
  warehouseId!: string

  @ApiProperty({ example: 'uuid-customer', required: false, nullable: true })
  @IsOptional()
  @IsString()
  customerId?: string | null

  @ApiProperty({ example: 'uuid-cashier' })
  @IsString()
  @IsNotEmpty()
  cashierId!: string

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  subtotal!: number

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  discountAmount!: number

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  taxAmount!: number

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  total!: number

  @ApiProperty({ type: [CreateSaleInvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleInvoiceItemDto)
  items!: CreateSaleInvoiceItemDto[]
}

export class ConvertToInvoiceDto {
  @ApiProperty({ example: 'uuid-quotation' })
  @IsString()
  @IsNotEmpty()
  quotationId!: string
}

export class CancelInvoiceDto {
  @ApiProperty({ example: 'uuid-invoice' })
  @IsString()
  @IsNotEmpty()
  invoiceId!: string
}

export class CreateExpenseCategoryDto {
  @ApiProperty({ example: 'إيجار' })
  @IsString()
  @IsNotEmpty()
  name!: string
}

export class CreateExpenseDto {
  @ApiProperty({ example: 'uuid-treasury' })
  @IsString()
  @IsNotEmpty()
  treasuryId!: string

  @ApiProperty({ example: 'uuid-branch', required: false })
  @IsOptional()
  @IsString()
  branchId?: string

  @ApiProperty({ example: 'uuid-category', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0.01)
  amount!: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string

  @ApiProperty({ example: 'uuid-user' })
  @IsString()
  @IsNotEmpty()
  createdBy!: string
}

export class CreateSaleReturnDto {
  @ApiProperty({ example: 'uuid-branch' })
  @IsString()
  @IsNotEmpty()
  branchId!: string

  @ApiProperty({ example: 'uuid-warehouse' })
  @IsString()
  @IsNotEmpty()
  warehouseId!: string

  @ApiProperty({ example: 'uuid-customer', required: false, nullable: true })
  @IsOptional()
  @IsString()
  customerId?: string | null

  @ApiProperty({ example: 'uuid-cashier' })
  @IsString()
  @IsNotEmpty()
  cashierId!: string

  @ApiProperty({ example: 'uuid-treasury', required: false, nullable: true })
  @IsOptional()
  @IsString()
  treasuryId?: string | null

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  total!: number

  @ApiProperty({ type: [CreateSaleInvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleInvoiceItemDto)
  items!: CreateSaleInvoiceItemDto[]
}

export class CreatePurchaseOrderDto {
  @ApiProperty({ example: 'uuid-branch' })
  @IsString()
  @IsNotEmpty()
  branchId!: string

  @ApiProperty({ example: 'uuid-warehouse' })
  @IsString()
  @IsNotEmpty()
  warehouseId!: string

  @ApiProperty({ example: 'uuid-supplier', required: false, nullable: true })
  @IsOptional()
  @IsString()
  supplierId?: string | null

  @ApiProperty({ example: 'uuid-cashier' })
  @IsString()
  @IsNotEmpty()
  cashierId!: string

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  total!: number

  @ApiProperty({ type: [CreatePurchaseInvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseInvoiceItemDto)
  items!: CreatePurchaseInvoiceItemDto[]
}

export class ConvertPoDto {
  @ApiProperty({ example: 'uuid-po' })
  @IsString()
  @IsNotEmpty()
  poId!: string

  @ApiProperty({ example: 'uuid-treasury', required: false, nullable: true })
  @IsOptional()
  @IsString()
  treasuryId?: string | null
}

export class CreatePurchaseReturnDto {
  @ApiProperty({ example: 'uuid-branch' })
  @IsString()
  @IsNotEmpty()
  branchId!: string

  @ApiProperty({ example: 'uuid-warehouse' })
  @IsString()
  @IsNotEmpty()
  warehouseId!: string

  @ApiProperty({ example: 'uuid-supplier', required: false, nullable: true })
  @IsOptional()
  @IsString()
  supplierId?: string | null

  @ApiProperty({ example: 'uuid-cashier' })
  @IsString()
  @IsNotEmpty()
  cashierId!: string

  @ApiProperty({ example: 'uuid-treasury', required: false, nullable: true })
  @IsOptional()
  @IsString()
  treasuryId?: string | null

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  total!: number

  @ApiProperty({ type: [CreatePurchaseInvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseInvoiceItemDto)
  items!: CreatePurchaseInvoiceItemDto[]
}

export class PaymentReceiptDto {
  @ApiProperty({ example: 'uuid-treasury', required: false, description: 'Optional; if omitted backend will try to resolve default treasury.' })
  @IsOptional()
  @IsString()
  treasuryId?: string

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0.01)
  amount!: number

  @ApiProperty({ enum: ['cash', 'card', 'bank'] })
  @IsString()
  @IsIn(['cash', 'card', 'bank'])
  method!: 'cash' | 'card' | 'bank'

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string

  @ApiProperty({ required: false, description: 'Optional link to a sale invoice to update paid/remaining and customer balance.' })
  @IsOptional()
  @IsString()
  invoiceId?: string

  @ApiProperty({ required: false, description: 'Optional customer id (required if invoiceId is not provided).' })
  @IsOptional()
  @IsString()
  customerId?: string

  @ApiProperty({ example: 'uuid-user' })
  @IsString()
  @IsNotEmpty()
  createdBy!: string
}

