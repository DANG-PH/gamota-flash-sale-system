import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  RegisterRequest,
  LoginRequest,
  RefreshRequest,
  VerifyOtpRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ChangeEmailRequest,
  AUTH_PACKAGE_NAME,
  AUTH_SERVICE_NAME,
  AuthServiceClient,
  RequestResetPasswordRequest,
  GetProfileRequest,
} from 'proto/auth.pb';
import { grpcCall } from 'src/HttpparseException/gRPC_to_Http';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private authGrpcService: AuthServiceClient;

  constructor(
    @Inject(AUTH_PACKAGE_NAME) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authGrpcService = this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  async handleRegister(req: RegisterRequest) {
    return grpcCall(this.authGrpcService.register(req));
  }

  async handleLogin(req: LoginRequest, metadata: Metadata) {
    const result = await grpcCall(this.authGrpcService.login(req, metadata), true);
    return result;
  }

  async handleVerifyOtp(req: VerifyOtpRequest, metadata: Metadata) {
    return grpcCall(this.authGrpcService.verifyOtp(req, metadata), true);
  }

  async handleRefresh(req: RefreshRequest, metadata: Metadata) {
    return grpcCall(this.authGrpcService.refresh(req, metadata));
  }

  async handleChangePassword(req: ChangePasswordRequest, metadata: Metadata) {
    return grpcCall(this.authGrpcService.changePassword(req, metadata));
  }

  async handleResetPassword(req: ResetPasswordRequest, metadata: Metadata) {
    return grpcCall(this.authGrpcService.resetPassword(req, metadata));
  }

  async handleChangeEmail(req: ChangeEmailRequest) {
    return grpcCall(this.authGrpcService.changeEmail(req));
  }

  async handleRequestResetPassword(req: RequestResetPasswordRequest) {
    return grpcCall(this.authGrpcService.requestResetPassword(req));
  }

  async handleProfile(req: GetProfileRequest) {
    return grpcCall(this.authGrpcService.getProfile(req));
  }
}
