import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common'
import { ContactsService } from './contacts.service'
import { CreateCustomerDto, CreateSupplierDto } from './dto/contacts.dto'
import { requireCompanyId } from '../../common/tenant/require-company-id'

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get('customers')
  async listCustomers(@Query('q') q?: string, @Query('limit') limit?: string) {
    const companyId = requireCompanyId()
    return this.contactsService.listCustomers(companyId, { q, limit: limit ? Number(limit) : undefined })
  }

  @Post('customers')
  async createCustomer(@Body() body: CreateCustomerDto) {
    const companyId = requireCompanyId()
    return this.contactsService.createCustomer(companyId, body)
  }

  @Get('customers/:id')
  async getCustomer(@Param('id') id: string) {
    const companyId = requireCompanyId()
    return this.contactsService.getCustomer(companyId, id)
  }

  @Patch('customers/:id')
  async updateCustomer(@Param('id') id: string, @Body() body: any) {
    const companyId = requireCompanyId()
    return this.contactsService.updateCustomer(companyId, id, body)
  }

  @Get('suppliers')
  async listSuppliers(@Query('q') q?: string, @Query('limit') limit?: string) {
    const companyId = requireCompanyId()
    return this.contactsService.listSuppliers(companyId, { q, limit: limit ? Number(limit) : undefined })
  }

  @Post('suppliers')
  async createSupplier(@Body() body: CreateSupplierDto) {
    const companyId = requireCompanyId()
    return this.contactsService.createSupplier(companyId, body)
  }

  @Get('suppliers/:id')
  async getSupplier(@Param('id') id: string) {
    const companyId = requireCompanyId()
    return this.contactsService.getSupplier(companyId, id)
  }

  @Patch('suppliers/:id')
  async updateSupplier(@Param('id') id: string, @Body() body: any) {
    const companyId = requireCompanyId()
    return this.contactsService.updateSupplier(companyId, id, body)
  }
}
