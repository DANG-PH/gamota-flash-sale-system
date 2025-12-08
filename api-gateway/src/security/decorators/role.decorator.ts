import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { Role } from 'src/enums/role.enum';
import { RolesGuard } from 'src/security/guard/role.guard';

export const ROLES_KEY = "role";
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
