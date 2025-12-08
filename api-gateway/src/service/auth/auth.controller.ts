import { Controller, Post, Body, UseGuards, Patch, Req, Inject, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody,ApiBearerAuth } from '@nestjs/swagger';
import { LoginRequest, RegisterRequest, RefreshRequest, VerifyOtpRequestDto,ChangePasswordRequestDto,
  ChangePasswordResponseDto,
  ResetPasswordRequestDto,
  ResetPasswordResponseDto,
  ChangeEmailRequestDto,
  ChangeEmailResponseDto,
    RequestResetPasswordRequestDto, RequestResetPasswordResponseDto, } from 'dto/auth.dto';
import { JwtAuthGuard } from 'src/security/JWT/jwt-auth.guard';
import { AuthService } from './auth.service';
import { Roles } from 'src/security/decorators/role.decorator';
import { Role } from 'src/enums/role.enum';
import { RolesGuard } from 'src/security/guard/role.guard';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Request } from 'express';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Metadata } from '@grpc/grpc-js';

@Controller('auth')
@ApiTags('Api Auth') 
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản user ' })
  @ApiBody({ type:  RegisterRequest })
  async register(@Body() body: RegisterRequest, @Req() req: any) {
    const ip = req.headers['x-forwarded-for'] || req.ip;
    const key = `register_rate_limit_${ip}`;
    const limit = 10;  // 10 lần
    const ttl = 60;   // trong 60 giây

    let count = (await this.cacheManager.get<number>(key)) || 0;
    count++;

    if (count > limit) {
      throw new HttpException(
        'Bạn đang gửi yêu cầu nạp tiền, vui lòng thử lại sau 1 phút.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.cacheManager.set(key, count, ttl * 1000);

    const authResult = await this.authService.handleRegister(body);

    return {
      auth: authResult,
      user: authResult,
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập tài khoản user' })
  @ApiBody({ type:  LoginRequest })
  async login(@Body() body: LoginRequest, @Req() req: any) {
    const ip = req.headers['x-forwarded-for'] || req.ip
    const key = `login_rate_limit_${ip}`;
    const limit = 6;  // 6 lần
    const ttl = 60;   // trong 60 giây

    let count = (await this.cacheManager.get<number>(key)) || 0;
    count++;

    if (count > limit) {
      throw new HttpException(
        'Bạn đăng nhập quá nhiều lần, vui lòng thử lại sau 1 phút.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.cacheManager.set(key, count, ttl * 1000);

    const ua = req.headers?.['user-agent'];;

    const metadata = new Metadata();

    if (ua && /mobile|android|iphone/i.test(ua)) metadata.set('platform', 'app');
    else if (ua && /mozilla|chrome|safari|edge|node/i.test(ua)) metadata.set('platform', 'web');
    else metadata.set('platform', 'game'); // fallback

    return this.authService.handleLogin(body, metadata);
  }
  
  @Post('verify-otp')
  @ApiOperation({ summary: 'Bước 2: Xác thực OTP và nhận access + refresh token' })
  @ApiBody({ type: VerifyOtpRequestDto })
  async verifyOtp(@Body() body: VerifyOtpRequestDto, @Req() req: any) {
    const ua = req.headers?.['user-agent'];;

    const metadata = new Metadata();

    if (ua && /mobile|android|iphone/i.test(ua)) metadata.set('platform', 'app');
    else if (ua && /mozilla|chrome|safari|edge|node/i.test(ua)) metadata.set('platform', 'web');
    else metadata.set('platform', 'game'); // fallback

    const result = await this.authService.handleVerifyOtp(body, metadata);

    if (result.access_token) {
        const username = Buffer.from(body.sessionId, 'base64').toString('ascii');
        let onlineUsers = await this.cacheManager.get<string[]>('online_users') || [];
        let timeConLai = await this.cacheManager.ttl('online_users'); // trả về time hết hạn
        if (timeConLai) timeConLai = timeConLai-Date.now();
        else timeConLai = 60 * 1000;
        if (!onlineUsers.includes(username)) onlineUsers.push(username);
        await this.cacheManager.set('online_users', onlineUsers, timeConLai);
    }
    return result;
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Làm mới Access Token bằng Refresh Token' })
  @ApiBody({ type: RefreshRequest })
  async refresh(@Body() body: RefreshRequest, @Req() req: any) {
    const ua = req.headers?.['user-agent'];;

    const metadata = new Metadata();

    if (ua && /mobile|android|iphone/i.test(ua)) metadata.set('platform', 'app');
    else if (ua && /mozilla|chrome|safari|edge|node/i.test(ua)) metadata.set('platform', 'web');
    else metadata.set('platform', 'game'); // fallback

    return this.authService.handleRefresh(body, metadata);
  }

  @Patch('change-password')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Thay đổi mật khẩu' })
  @ApiBody({ type: ChangePasswordRequestDto })
  async changePassword(@Body() body: ChangePasswordRequestDto, @Req() req: any): Promise<ChangePasswordResponseDto> {
    const username = req.user.username;
    const request = {
      ...body,
      sessionId: Buffer.from(username).toString('base64')
    }
    const ua = req.headers?.['user-agent'];;

    const metadata = new Metadata();

    if (ua && /mobile|android|iphone/i.test(ua)) metadata.set('platform', 'app');
    else if (ua && /mozilla|chrome|safari|edge|node/i.test(ua)) metadata.set('platform', 'web');
    else metadata.set('platform', 'game'); // fallback
    return this.authService.handleChangePassword(request, metadata);
  }

  @Patch('change-email')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Thay đổi email' })
  @ApiBody({ type: ChangeEmailRequestDto })
  async changeEmail(@Body() body: ChangeEmailRequestDto, @Req() req: any): Promise<ChangeEmailResponseDto> {
    const username = req.user.username;
    const request = {
      ...body,
      sessionId: Buffer.from(username).toString('base64')
    }
    return this.authService.handleChangeEmail(request);
  }

  @Post('request-reset-password')
  @ApiOperation({ summary: 'Yêu cầu gửi OTP để reset mật khẩu' })
  @ApiBody({ type: RequestResetPasswordRequestDto })
  async requestResetPassword(
    @Body() body: RequestResetPasswordRequestDto
  ): Promise<RequestResetPasswordResponseDto> {
    return this.authService.handleRequestResetPassword(body);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset mật khẩu khi quên' })
  @ApiBody({ type: ResetPasswordRequestDto })
  async resetPassword(@Body() body: ResetPasswordRequestDto, @Req() req: any): Promise<ResetPasswordResponseDto> {
    const ua = req.headers?.['user-agent'];;

    const metadata = new Metadata();

    if (ua && /mobile|android|iphone/i.test(ua)) metadata.set('platform', 'app');
    else if (ua && /mozilla|chrome|safari|edge|node/i.test(ua)) metadata.set('platform', 'web');
    else metadata.set('platform', 'game'); // fallback
    return this.authService.handleResetPassword(body, metadata);
  }

  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'User xem profile của chính mình' })
  async profile(@Req() req: any) {
    const userId = req.user.userId;
    return this.authService.handleProfile({id: userId});
  }
}