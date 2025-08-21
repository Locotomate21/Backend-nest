import { SetMetadata } from '@nestjs/common';
import { Role } from '../common/roles.enum';

// Clave que usará el guard para leer los roles permitidos
export const ROLES_KEY = 'roles';

// Decorador que se puede usar en controladores/métodos
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);