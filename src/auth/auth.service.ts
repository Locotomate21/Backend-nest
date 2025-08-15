import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../common/roles.enum';

interface JwtPayload {
  sub: string;
  role: string;
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

    const userExists = await this.userService.findByEmail(email);
    if (userExists) {
      throw new ConflictException('El usuario ya existe');
    }

    await this.registerUser(fullName, email, password, role);
    return { message: 'Usuario registrado con éxito' };
  }

  // 📌 Registro interno de usuario
  async registerUser(
    fullName: string,
    email: string,
    password: string,
    role?: Role,
  ): Promise<void> {
    const safeRole: Role = Object.values(Role).includes(role as Role)
      ? (role as Role)
      : Role.Resident;

    await this.userService.createUser({
      fullName,
      email,
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
  }> {
    const { email, password } = loginDto; // ← corregido

    // ✅ Validación de usuario
    const user = await this.userService.validateUser({ email, password });

    // ✅ Payload JWT
    const payload: JwtPayload = {
      sub: user._id.toString(),
      role: user.role,
    };

    const token: string = this.jwtService.sign(payload);

    return {
      token,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
    };
  }
}
