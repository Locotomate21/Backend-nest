  import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { ROLES_KEY } from './roles.decorator';
  import { Role } from '../common/roles.enum';

  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
      const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      // Si no hay roles definidos, dejamos pasar
      if (!requiredRoles || requiredRoles.length === 0) return true;

      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (!user) throw new UnauthorizedException('No autenticado');

      // 🔎 Debug logs (puedes quitarlos luego)
/*       console.log('🔑 Required roles:', requiredRoles);
      console.log('👤 User role:', user.role); */

      // ✅ Normalizar comparación
      const userRole = (user.role || '').toLowerCase();
      const hasRole = requiredRoles.some((role) => role.toLowerCase() === userRole);

      if (!hasRole) {
        throw new ForbiddenException('No tienes permisos para este recurso');
      }

      // Ejemplo extra: validación de Representative con floor
      if (userRole === Role.Representative.toLowerCase() && !user.floor) {
        throw new ForbiddenException('Representative has no assigned floor');
      }

      return true;
    }
  }
