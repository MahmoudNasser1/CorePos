import { Body, Controller, Post, Get, Param, Query, Headers, NotImplementedException } from '@nestjs/common'
import { FinanceService } from './finance.service'
import { CreatePosSaleDto, CreateSaleInvoiceDto, PaymentReceiptDto } from './dto/finance.dto'
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
  saleReturn(@Body() body: CreateSaleDto) {
    void body
    throw new NotImplementedException({
      code: 'NOT_IMPLEMENTED',
      message: 'مرتجعات المبيعات غير متاحة حالياً عبر الباك الجديد.',
    })
  }

  @Post('purchase-returns')
  purchaseReturn(@Body() body: CreateSaleDto) {
    void body
    throw new NotImplementedException({
      code: 'NOT_IMPLEMENTED',
      message: 'مرتجعات المشتريات غير متاحة حالياً عبر الباك الجديد.',
    })
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
  async purchaseInvoice() {
    throw new NotImplementedException({
      code: 'NOT_IMPLEMENTED',
      message: 'فاتورة المشتريات غير مدعومة حالياً عبر الباك الجديد.',
    })
  }

  @Get('purchase-invoices')
  async listPurchaseInvoices() {
    throw new NotImplementedException({
      code: 'NOT_IMPLEMENTED',
      message: 'قائمة فواتير المشتريات غير مدعومة حالياً عبر الباك الجديد.',
    })
  }

  @Get('purchase-invoices/:id')
  async getPurchaseInvoice(@Param('id') id: string) {
    void id
    throw new NotImplementedException({
      code: 'NOT_IMPLEMENTED',
      message: 'عرض فاتورة المشتريات غير مدعوم حالياً عبر الباك الجديد.',
    })
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
}

