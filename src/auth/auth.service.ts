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
    // 🔹 Normalizar role
    const safeRole: Role = (() => {
      switch (role?.toString().toLowerCase()) {
        case 'admin':
          return Role.Admin;
        case 'resident':
          return Role.Resident;
        case 'representative':
          return Role.Representative;
        default:
          return Role.Resident;
      }
    })();

    await this.userService.create({
      fullName,
      email: email.toLowerCase(), // siempre en minúsculas
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
    const normalizedRole: Role = (() => {
      switch (user.role?.toString().toLowerCase()) {
        case 'admin':
          return Role.Admin;
        case 'resident':
          return Role.Resident;
        case 'representative':
          return Role.Representative;
        default:
          return Role.Resident;
      }
    })();

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
}
