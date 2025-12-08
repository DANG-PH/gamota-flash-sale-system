import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  HttpException, HttpStatus
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from 'src/security/decorators/role.decorator';
import { Role } from '../../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]); // get all để đọc metadata có Role key tồn tại trong handler hoặc class
    if (!requiredRoles) {
      return true;
    }
    const user = context.switchToHttp().getRequest().user;
    if (!user) {
      throw new HttpException({
        status: HttpStatus.UNAUTHORIZED,
        error: 'Bạn chưa đăng nhập',
      }, HttpStatus.UNAUTHORIZED);
    }
    const hasRole = requiredRoles.some((role) => user.role === role);
    if (!hasRole) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: `Bạn không có quyền. Yêu cầu: ${requiredRoles.join(', ')}`,
      }, HttpStatus.FORBIDDEN);
    }

    return true;
  }
}