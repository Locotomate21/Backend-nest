import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../common/roles.enum';

interface JwtPayload {
  sub: string;
  role: string;
  email: string;
  fullName: string;
  floor?: number | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // 📝 Registro principal
  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, fullName, password, role } = registerDto;

    // 🔹 Normalizar email a minúsculas
    const normalizedEmail = email.toLowerCase();

    const userExists = await this.userService.findByEmail(normalizedEmail);
    if (userExists) {
      throw new ConflictException('El usuario ya existe');
    }

    await this.registerUser(fullName, normalizedEmail, password, role);
    return { message: 'Usuario registrado con éxito' };
  }

  // 📌 Registro interno de usuario
  async registerUser(
    fullName: string,
    email: string,
    password: string,
    role?: Role,
  ): Promise<void> {
    // 🔹 Normalizar role (mapeamos todos los posibles)
    const safeRole: Role = this.normalizeRole(role);

    await this.userService.create({
      fullName,
      email: email.toLowerCase(),
      password,
      role: safeRole,
      active: true,
    });
  }

  // 🔑 Login
  async login(loginDto: LoginDto): Promise<{
    token: string;
    role: string;
    email: string;
    fullName: string;
    floor: number | null;
  }> {
    const { email, password } = loginDto;

    // 🔹 Normalizar email para la búsqueda
    const user = await this.userService.validateUser({
      email: email.toLowerCase(),
      password,
    });

    // 🔹 Normalizar role
    const normalizedRole: Role = this.normalizeRole(user.role);

    // ✅ Payload JWT (incluye floor)
    const payload: JwtPayload = {
      sub: user._id.toString(),
      role: normalizedRole,
      email: user.email,
      fullName: user.fullName,
      floor: user.floor ?? null,
    };

    const token: string = this.jwtService.sign(payload);

    return {
      token,
      role: normalizedRole,
      email: user.email,
      fullName: user.fullName,
      floor: user.floor ?? null,
    };
  }

  // 🔹 Método centralizado para normalizar roles
  private normalizeRole(role?: string | Role): Role {
    switch (role?.toString().toLowerCase()) {
      case 'admin':
        return Role.Admin;
      case 'resident':
        return Role.Resident;
      case 'representative':
        return Role.Representative;
      case 'floor_auditor':
        return Role.FloorAuditor;
      case 'president':
        return Role.President;
      case 'vice_president':
        return Role.VicePresident;
      case 'general_auditor':
        return Role.GeneralAuditor;
      case 'adjudicator':
        return Role.Adjudicator;
      case 'secretary_general':
        return Role.SecretaryGeneral;
      default:
        return Role.Resident;
    }
  }
}
