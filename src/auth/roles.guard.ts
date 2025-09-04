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

    // Validamos que el rol exista en los permitidos
    const hasRole = requiredRoles.includes(user.role as Role);
    if (!hasRole) return false;

    // Opcional: podrías validar algo más aquí si quisieras, por ejemplo floor
    if (user.role === Role.Representative && !user.floor) throw new ForbiddenException('Representative has no assigned floor');

    return true;
  }
}
