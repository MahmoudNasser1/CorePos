import { Body, Controller, Get, Post, Res, Req, UnauthorizedException, HttpCode, Inject } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'

class LoginDto {
  @ApiProperty({ example: 'admin@pos-sahl.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password!: string

  @ApiProperty({ example: 'محمود', required: false })
  @IsOptional()
  @IsString()
  fullName?: string
}

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() body: any, @Res({ passthrough: true }) response: Response) {
    const tokens = await this.authService.register(
      body.email,
      body.password,
      body.fullName || 'New User',
      body.company,
      typeof body.companyAddress === 'string' ? body.companyAddress : undefined,
      typeof body.companyPhone === 'string' ? body.companyPhone : undefined,
    )
    
    response.cookie('access_token', tokens.accessToken, { httpOnly: true, sameSite: 'lax' })
    response.cookie('refresh_token', tokens.refreshToken, { httpOnly: true, sameSite: 'lax' })
    if (tokens.user.companyId) {
      response.cookie('company_id', tokens.user.companyId, { httpOnly: false, sameSite: 'lax' })
    }
    
    return { success: true, data: { user: tokens.user } }
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) response: Response) {
    const tokens = await this.authService.login(body.email, body.password)
    response.cookie('access_token', tokens.accessToken, { httpOnly: true, sameSite: 'lax' })
    response.cookie('refresh_token', tokens.refreshToken, { httpOnly: true, sameSite: 'lax' })
    if (tokens.user.companyId) {
      response.cookie('company_id', tokens.user.companyId, { httpOnly: false, sameSite: 'lax' })
    }
    return { success: true, data: { user: tokens.user } }
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = req.cookies?.['refresh_token']
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token')

    const tokens = await this.authService.refresh(refreshToken)
    response.cookie('access_token', tokens.accessToken, { httpOnly: true, sameSite: 'lax' })
    response.cookie('refresh_token', tokens.refreshToken, { httpOnly: true, sameSite: 'lax' })
    if (tokens.user.companyId) {
      response.cookie('company_id', tokens.user.companyId, { httpOnly: false, sameSite: 'lax' })
    }
    return { success: true, data: { user: tokens.user } }
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token')
    response.clearCookie('refresh_token')
    response.clearCookie('company_id')
    return { success: true, data: { ok: true } }
  }

  @Post('reset')
  reset() {
    return { success: true, data: { message: 'reset link sent' } }
  }

  @Get('session')
  async session(@Req() req: Request) {
    const token = req.cookies?.['access_token'] || req.cookies?.['jwt']
    if (!token) {
      throw new UnauthorizedException()
    }

    const session = await this.authService.getSession(token)
    return { success: true, data: session }
  }
}
