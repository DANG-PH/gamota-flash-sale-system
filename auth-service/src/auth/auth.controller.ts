import { Controller, InternalServerErrorException, ForbiddenException, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import type { GetProfileReponse, GetProfileRequest, LoginRequest,LoginResponse, RegisterResponse, RegisterRequest, VerifyOtpRequest, VerifyOtpResponse, ChangeEmailRequest, ChangeEmailResponse, ChangePasswordRequest, ChangePasswordResponse, ResetPasswordRequest, ResetPasswordResponse, RequestResetPasswordRequest, RequestResetPasswordResponse } from 'proto/auth.pb';
import { AUTH_SERVICE_NAME } from 'proto/auth.pb';
import { Metadata } from '@grpc/grpc-js';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'Register')
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return await this.authService.register(data);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'Login')
  async login(data: LoginRequest, metadata: Metadata): Promise<LoginResponse> {
    const platform = metadata.get('platform')[0] as string; // 'web' | 'app' | 'game'
    console.log('Platform từ client:', platform);

    return await this.authService.login(data, platform);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'Refresh')
  async refresh(data: { refreshToken: string }, metadata: Metadata) {
    const platform = metadata.get('platform')[0] as string;
    return await this.authService.refresh(data.refreshToken, platform);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'VerifyOTP')
  async verifyotp( data: VerifyOtpRequest, metadata: Metadata) {
    const platform = metadata.get('platform')[0] as string;
    return await this.authService.verifyOtp(data, platform);
  }
  // ===== USER METHODS =====
  @GrpcMethod(AUTH_SERVICE_NAME, 'ChangePassword')
  async changePassword(data: ChangePasswordRequest, metadata: Metadata): Promise<ChangePasswordResponse> {
    const platform = metadata.get('platform')[0] as string;
    return await this.authService.changePassword(data, platform);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'ResetPassword')
  async resetPassword(data: ResetPasswordRequest, metadata: Metadata): Promise<ResetPasswordResponse> {
    const platform = metadata.get('platform')[0] as string;
    return await this.authService.resetPassword(data, platform);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'ChangeEmail')
  async changeEmail(data: ChangeEmailRequest): Promise<ChangeEmailResponse> {
    return await this.authService.changeEmail(data);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'RequestResetPassword')
  async requestResetPassword(
    data: RequestResetPasswordRequest
  ): Promise<RequestResetPasswordResponse> {
    return this.authService.requestResetPassword(data);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'GetProfile')
  async getProfile(
    data: GetProfileRequest
  ): Promise<GetProfileReponse> {
    return this.authService.getProfile(data);
  }
}