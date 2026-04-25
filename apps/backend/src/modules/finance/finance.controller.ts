import { Body, Controller, Post, Get, Patch, Param, Query, Headers, NotImplementedException } from '@nestjs/common'
import { FinanceService } from './finance.service'
import {
  CreatePosSaleDto,
  CreateSaleInvoiceDto,
  PaymentReceiptDto,
  CreatePurchaseInvoiceDto,
  CreateQuotationDto,
  ConvertToInvoiceDto,
  CancelInvoiceDto,
  CreateExpenseCategoryDto,
  CreateExpenseDto,
  CreateSaleReturnDto,
  CreatePurchaseOrderDto,
  ConvertPoDto,
  CreatePurchaseReturnDto,
} from './dto/finance.dto'
import { requireCompanyId } from '../../common/tenant/require-company-id'

type InvoiceLine = {
  productId: string
  quantity: number
  unitPrice: number
}

type CreateSaleDto = {
  invoiceNumber?: string
  customerId?: string
  lines: InvoiceLine[]
}

// DTOs are defined in ./dto/finance.dto.ts to work with ValidationPipe whitelist.

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('defaults')
  async getDefaultsNew(@Query('branchId') branchId?: string) {
    const companyId = requireCompanyId()
    return this.financeService.getCompanyDefaults(companyId, branchId)
  }

  @Get('defaults/:companyId')
  async getDefaults(@Param('companyId') _companyId: string, @Query('branchId') branchId?: string) {
    const companyId = requireCompanyId()
    return this.financeService.getCompanyDefaults(companyId, branchId)
  }

  @Post('sales')
  createSale(@Body() body: CreateSaleDto) {
    void body
    throw new NotImplementedException({
      code: 'NOT_IMPLEMENTED',
      message: 'هذا المسار غير مدعوم. استخدم /v1/finance/pos-sale أو /v1/finance/sale-invoice.',
    })
  }

  @Post('purchases')
  createPurchase(@Body() body: CreateSaleDto) {
    void body
    throw new NotImplementedException({
      code: 'NOT_IMPLEMENTED',
      message: 'هذا المسار غير مدعوم حالياً.',
    })
  }

  @Post('sale-returns')
  async saleReturn(@Headers('idempotency-key') idempotencyKey: string | undefined, @Body() body: CreateSaleReturnDto) {
    const companyId = requireCompanyId()
    return this.financeService.createSaleReturn({ ...body, companyId, idempotencyKey })
  }

  @Post('purchase-returns')
  async purchaseReturn(@Headers('idempotency-key') idempotencyKey: string | undefined, @Body() body: CreatePurchaseReturnDto) {
    const companyId = requireCompanyId()
    return this.financeService.createPurchaseReturn({ ...body, companyId, idempotencyKey })
  }

  @Post('purchase-order')
  async purchaseOrder(@Headers('idempotency-key') idempotencyKey: string | undefined, @Body() body: CreatePurchaseOrderDto) {
    const companyId = requireCompanyId()
    return this.financeService.createPurchaseOrder({ ...body, companyId, idempotencyKey })
  }

  @Post('convert-po')
  async convertPo(@Body() body: ConvertPoDto) {
    const companyId = requireCompanyId()
    return this.financeService.convertPurchaseOrderToInvoice(companyId, body.poId, body.treasuryId ?? null)
  }

  @Post('payments')
  payment() {
    throw new NotImplementedException({
      code: 'NOT_IMPLEMENTED',
      message: 'هذا المسار غير مدعوم. استخدم /v1/finance/payment-receipt.',
    })
  }

  @Post('sale-invoice')
  async createSaleInvoice(@Headers('idempotency-key') idempotencyKey: string | undefined, @Body() body: CreateSaleInvoiceDto) {
    const companyId = requireCompanyId()
    return this.financeService.createSaleInvoice({ ...body, companyId, idempotencyKey })
  }

  @Get('sale-invoices')
  async listSaleInvoices(@Query('q') q?: string, @Query('limit') limit?: string, @Query('cursor') cursor?: string) {
    const companyId = requireCompanyId()
    return this.financeService.listSaleInvoices(companyId, { q, limit: limit ? Number(limit) : undefined, cursor })
  }

  @Get('sale-invoices/:id')
  async getSaleInvoice(@Param('id') id: string) {
    const companyId = requireCompanyId()
    return this.financeService.getSaleInvoice(companyId, id)
  }

  @Post('payment-receipt')
  async addPaymentReceipt(@Headers('idempotency-key') idempotencyKey: string | undefined, @Body() body: PaymentReceiptDto) {
    const companyId = requireCompanyId()
    return this.financeService.addPaymentReceipt({ ...body, companyId, idempotencyKey })
  }

  @Post('pos-sale')
  async posSale(@Headers('idempotency-key') idempotencyKey: string | undefined, @Body() body: CreatePosSaleDto) {
    const companyId = requireCompanyId()
    return this.financeService.createPosSale({
      companyId,
      branchId: body.branchId,
      warehouseId: body.warehouseId,
      treasuryId: body.treasuryId,
      customerId: body.customerId,
      discountAmount: body.discountAmount,
      taxAmount: body.taxAmount,
      totalAmount: body.totalAmount,
      paymentMethod: body.paymentMethod,
      lines: body.lines,
      idempotencyKey,
    })
  }

  @Post('purchase-invoice')
  async purchaseInvoice(@Headers('idempotency-key') idempotencyKey: string | undefined, @Body() body: CreatePurchaseInvoiceDto) {
    const companyId = requireCompanyId()
    return this.financeService.createPurchaseInvoice({ ...body, companyId, idempotencyKey })
  }

  @Get('purchase-invoices')
  async listPurchaseInvoices(@Query('q') q?: string, @Query('limit') limit?: string, @Query('cursor') cursor?: string) {
    const companyId = requireCompanyId()
    return this.financeService.listPurchaseInvoices(companyId, { q, limit: limit ? Number(limit) : undefined, cursor })
  }

  @Get('purchase-invoices/:id')
  async getPurchaseInvoice(@Param('id') id: string) {
    const companyId = requireCompanyId()
    return this.financeService.getPurchaseInvoice(companyId, id)
  }

  @Post('quotation')
  async createQuotation(@Headers('idempotency-key') idempotencyKey: string | undefined, @Body() body: CreateQuotationDto) {
    const companyId = requireCompanyId()
    return this.financeService.createQuotation({ ...body, companyId, idempotencyKey })
  }

  @Post('convert-quotation')
  async convertQuotation(@Body() body: ConvertToInvoiceDto) {
    const companyId = requireCompanyId()
    return this.financeService.convertQuotationToSaleInvoice(companyId, body.quotationId)
  }

  @Post('cancel-invoice')
  async cancelInvoice(@Body() body: CancelInvoiceDto) {
    const companyId = requireCompanyId()
    return this.financeService.cancelInvoice(companyId, body.invoiceId)
  }

  @Get('expense-categories')
  async listExpenseCategories() {
    const companyId = requireCompanyId()
    return this.financeService.listExpenseCategories(companyId)
  }

  @Post('expense-categories')
  async createExpenseCategory(@Body() body: CreateExpenseCategoryDto) {
    const companyId = requireCompanyId()
    return this.financeService.createExpenseCategory(companyId, body.name)
  }

  @Get('expenses')
  async listExpenses(@Query('limit') limit?: string) {
    const companyId = requireCompanyId()
    return this.financeService.listExpenses(companyId, { limit: limit ? Number(limit) : undefined })
  }

  @Post('expenses')
  async createExpense(@Headers('idempotency-key') idempotencyKey: string | undefined, @Body() body: CreateExpenseDto) {
    const companyId = requireCompanyId()
    return this.financeService.createExpense({ ...body, companyId, idempotencyKey })
  }

  @Get('treasury')
  async treasury() {
    const companyId = requireCompanyId()
    return this.financeService.getTreasury(companyId)
  }

  @Get('treasury/transactions')
  async treasuryTransactions(@Query('limit') limit?: string) {
    const companyId = requireCompanyId()
    return this.financeService.getTreasuryTransactions(companyId, { limit: limit ? Number(limit) : undefined })
  }

  @Post('treasury')
  async createTreasury(@Body() body: Record<string, unknown>) {
    const companyId = requireCompanyId()
    return this.financeService.createTreasury(companyId, {
      name: String(body.name ?? ''),
      type: (body.type as string) || undefined,
      branchId: (body.branchId as string) || (body.branch_id as string) || null,
      isDefault: Boolean(body.isDefault ?? body.is_default),
      isActive: body.isActive !== false && body.is_active !== false,
    })
  }

  @Patch('treasury/:id')
  async updateTreasury(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    const companyId = requireCompanyId()
    const patch: {
      name?: string
      type?: string
      isDefault?: boolean
      isActive?: boolean
    } = {}
    if (body.name !== undefined) patch.name = String(body.name)
    if (body.type !== undefined) patch.type = String(body.type)
    if (body.isDefault !== undefined || body.is_default !== undefined) {
      patch.isDefault = Boolean(body.isDefault ?? body.is_default)
    }
    if (body.isActive !== undefined || body.is_active !== undefined) {
      patch.isActive = Boolean(body.isActive ?? body.is_active)
    }
    return this.financeService.updateTreasury(companyId, id, patch)
  }
}

