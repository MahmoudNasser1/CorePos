import { Controller, Get, Post, Body, Param, Delete, Patch, Query, UseGuards } from '@nestjs/common'
import { InventoryService } from './inventory.service'
import { CreateProductDto, CreateCategoryDto, CreateUnitDto, BulkImportDto } from './dto/inventory.dto'
import { requireCompanyId } from '../../common/tenant/require-company-id'
import { PermissionGuard } from '../../common/rbac/permission.guard'
import { RequirePermission } from '../../common/rbac/require-permission.decorator'

@Controller('inventory')
@UseGuards(PermissionGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('products')
  @RequirePermission('inventory.read')
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
  @RequirePermission('inventory.write')
  async createProduct(@Body() body: CreateProductDto) {
    const companyId = requireCompanyId()
    return this.inventoryService.createProduct(companyId, body)
  }

  @Post('products/bulk-import')
  @RequirePermission('inventory.write')
  async bulkImportProducts(@Body() body: BulkImportDto) {
    const companyId = requireCompanyId()
    return this.inventoryService.bulkImportProducts(companyId, body)
  }

  @Get('products/:id')
  @RequirePermission('inventory.read')
  async getProduct(@Param('id') id: string) {
    const companyId = requireCompanyId()
    return this.inventoryService.getProduct(companyId, id)
  }

  @Patch('products/:id')
  @RequirePermission('inventory.write')
  async updateProduct(@Param('id') id: string, @Body() body: any) {
    const companyId = requireCompanyId()
    return this.inventoryService.updateProduct(companyId, id, body)
  }

  @Delete('products/:id')
  @RequirePermission('inventory.write')
  async deleteProduct(@Param('id') id: string) {
    const companyId = requireCompanyId()
    return this.inventoryService.deleteProduct(companyId, id)
  }

  @Get('products/:id/insights')
  async getProductInsights(@Param('id') id: string) {
    const companyId = requireCompanyId()
    return this.inventoryService.getProductInsights(companyId, id)
  }

  @Get('barcodes/unique')
  async isBarcodeUnique(@Query('barcode') barcode?: string, @Query('excludeId') excludeId?: string) {
    const companyId = requireCompanyId()
    const ok = await this.inventoryService.isBarcodeUnique(companyId, barcode ?? '', excludeId)
    return { success: true, data: { unique: ok } }
  }

  @Get('categories')
  @RequirePermission('inventory.read')
  async listCategories() {
    const companyId = requireCompanyId()
    return this.inventoryService.listCategories(companyId)
  }

  @Post('categories')
  @RequirePermission('inventory.write')
  async createCategory(@Body() body: CreateCategoryDto) {
    const companyId = requireCompanyId()
    return this.inventoryService.createCategory(companyId, body.name, body.parentId)
  }

  @Patch('categories/:id')
  @RequirePermission('inventory.write')
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    const companyId = requireCompanyId()
    return this.inventoryService.updateCategory(companyId, id, body)
  }

  @Delete('categories/:id')
  @RequirePermission('inventory.write')
  async deleteCategory(@Param('id') id: string) {
    const companyId = requireCompanyId()
    return this.inventoryService.deleteCategory(companyId, id)
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
  @RequirePermission('inventory.read')
  async listUnits() {
    const companyId = requireCompanyId()
    return this.inventoryService.listUnits(companyId)
  }

  @Post('units')
  @RequirePermission('inventory.write')
  async createUnit(@Body() body: CreateUnitDto) {
    const companyId = requireCompanyId()
    return this.inventoryService.createUnit(companyId, body)
  }

  @Patch('units/:id')
  @RequirePermission('inventory.write')
  async updateUnit(@Param('id') id: string, @Body() body: any) {
    const companyId = requireCompanyId()
    return this.inventoryService.updateUnit(companyId, id, body)
  }

  @Delete('units/:id')
  @RequirePermission('inventory.write')
  async deleteUnit(@Param('id') id: string) {
    const companyId = requireCompanyId()
    return this.inventoryService.deleteUnit(companyId, id)
  }
}
