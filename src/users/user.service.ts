import { Injectable, BadRequestException, NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../common/roles.enum';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // 🟢 Crear usuario
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existing) throw new BadRequestException('El correo ya está registrado');

    const user = new this.userModel(createUserDto);
    return await user.save();
  }

  // 📋 Obtener todos los usuarios
  async getAllUser(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  // 🔍 Obtener usuario por ID
  async getUserById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  // ✏️ Actualizar usuario
  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  // ❌ Eliminar usuario
  async deleteUser(id: string): Promise<{ message: string }> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Usuario no encontrado');
    return { message: 'Usuario eliminado con éxito' };
  }

  // 🔑 Registro
  async register(registerDto: RegisterDto): Promise<User> {
    const createUserDto: CreateUserDto = {
      ...registerDto,
      role: registerDto.role ?? Role.Resident,
      active: true,
    };
    return this.createUser(createUserDto);
  }

// 🔐 Validar usuario (login)
async validateUser(loginDto: LoginDto): Promise<UserDocument> {
  const user = await this.userModel.findOne({ email: loginDto.email }).exec(); // importante exec()

  if (!user) {
    throw new NotFoundException('Usuario no encontrado');
  }

  // Aquí el cast asegura que Mongoose reconozca el método comparePassword
  const isMatch = await (user as UserDocument).comparePassword(loginDto.password);

  if (!isMatch) {
    throw new BadRequestException('Contraseña incorrecta');
  }

  return user;
}

  // 📧 Buscar usuario por email (para AuthService)
  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).exec();
  }
}
