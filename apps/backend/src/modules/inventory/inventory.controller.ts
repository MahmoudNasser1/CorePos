import { Controller, Get, Post, Body, Param, Delete, Patch, Query } from '@nestjs/common'
import { InventoryService } from './inventory.service'
import { CreateProductDto, CreateCategoryDto, CreateUnitDto } from './dto/inventory.dto'
import { requireCompanyId } from '../../common/tenant/require-company-id'

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('products')
  async listProducts(
    @Query('q') q?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: string,
  ) {
    const companyId = requireCompanyId()
    return this.inventoryService.listProducts(companyId, {
      q,
      limit: limit ? Number(limit) : undefined,
      cursor,
      sort,
      order,
    })
  }

  @Post('products')
  async createProduct(@Body() body: CreateProductDto) {
    const companyId = requireCompanyId()
    return this.inventoryService.createProduct(companyId, body)
  }

  @Get('products/:id')
  async getProduct(@Param('id') id: string) {
    const companyId = requireCompanyId()
    return this.inventoryService.getProduct(companyId, id)
  }

  @Patch('products/:id')
  async updateProduct(@Param('id') id: string, @Body() body: any) {
    const companyId = requireCompanyId()
    return this.inventoryService.updateProduct(companyId, id, body)
  }

  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    const companyId = requireCompanyId()
    return this.inventoryService.deleteProduct(companyId, id)
  }

  @Get('categories')
  async listCategories() {
    const companyId = requireCompanyId()
    return this.inventoryService.listCategories(companyId)
  }

  @Post('categories')
  async createCategory(@Body() body: CreateCategoryDto) {
    const companyId = requireCompanyId()
    return this.inventoryService.createCategory(companyId, body.name, body.parentId)
  }

  @Patch('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    const companyId = requireCompanyId()
    return this.inventoryService.updateCategory(companyId, id, body)
  }

  @Get('low-stock')
  async getLowStock() {
    const companyId = requireCompanyId()
    return this.inventoryService.getLowStockAlerts(companyId)
  }

  @Get('search')
  async search(@Query('q') q?: string) {
    const companyId = requireCompanyId()
    return this.inventoryService.search(companyId, q ?? '')
  }

  @Get('units')
  async listUnits() {
    const companyId = requireCompanyId()
    return this.inventoryService.listUnits(companyId)
  }

  @Post('units')
  async createUnit(@Body() body: CreateUnitDto) {
    const companyId = requireCompanyId()
    return this.inventoryService.createUnit(companyId, body)
  }

  @Patch('units/:id')
  async updateUnit(@Param('id') id: string, @Body() body: any) {
    const companyId = requireCompanyId()
    return this.inventoryService.updateUnit(companyId, id, body)
  }

  @Delete('units/:id')
  async deleteUnit(@Param('id') id: string) {
    const companyId = requireCompanyId()
    return this.inventoryService.deleteUnit(companyId, id)
  }
}
