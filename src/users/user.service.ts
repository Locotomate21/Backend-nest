import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../common/roles.enum';
import { RoomService } from '../room/room.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly roomService: RoomService,
  ) {}

  /** 🔹 Crear usuario */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // 🔹 Normalizar email
    const normalizedEmail = createUserDto.email.toLowerCase();

    // 🔹 Validar duplicado por email
    const exists = await this.userModel.findOne({ email: normalizedEmail });
    if (exists) {
      throw new BadRequestException('El correo ya está registrado');
    }

    // 🔹 Normalizar role (asegurarnos de que coincida con el enum)
    let normalizedRole: Role;
    switch (createUserDto.role?.toString().toLowerCase()) {
      case 'admin':
        normalizedRole = Role.Admin;
        break;
      case 'resident':
        normalizedRole = Role.Resident;
        break;
      case 'representative':
        normalizedRole = Role.Representative;
        break;
      default:
        throw new BadRequestException('Rol inválido');
    }

    // 🔹 Validaciones extra para representantes
    if (normalizedRole === Role.Representative) {
      if (!createUserDto.floor) {
        throw new BadRequestException('Un representante debe tener un piso asignado');
      }

      // 🔹 usamos el método PÚBLICO del RoomService
      await this.roomService.validateFloorAvailability(createUserDto.floor);
    }

    const newUser = new this.userModel({
      ...createUserDto,
      email: normalizedEmail,
      role: normalizedRole,
    });

    return newUser.save();
  }

  /** 🔹 Listar todos los usuarios */
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  /** 🔹 Buscar un usuario por ID */
  async findOne(id: string): Promise<UserDocument> {
    try {
      const user = await this.userModel
        .findById(id)
        .populate({
          path: 'resident',
          populate: {
            path: 'room',
            select: 'number floor occupied',
          },
        })
        .lean()
        .exec();

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      return user;
    } catch (error: any) {
/*       console.error('❌ Error en findOne:', error.message, error.stack); */
      throw new InternalServerErrorException('Error desconocido al obtener usuario');
    }
  }

  /** 🔹 Actualizar usuario */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (updateUserDto.role === Role.Representative) {
      if (!updateUserDto.floor) {
        throw new BadRequestException('Un representante debe tener un piso asignado');
      }

      // 🔹 usamos el método PÚBLICO del RoomService
      await this.roomService.validateFloorAvailability(updateUserDto.floor);

      // ⚠ Se permite más de un representante por piso
    }

    Object.assign(user, updateUserDto);
    return user.save();
  }

  /** 🔹 Eliminar usuario */
  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Usuario no encontrado');
  }

  // =====================================================
  // 🚀 Métodos que usa AuthService
  // =====================================================

  /** Buscar usuario por email */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  /** Validar usuario al hacer login */
  async validateUser(loginDto: { email: string; password: string }): Promise<UserDocument> {
    // 🔹 Normalizar email
    const normalizedEmail = loginDto.email.toLowerCase();

    const user = await this.userModel.findOne({ email: normalizedEmail }).exec();
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const isPasswordValid = await user.comparePassword(loginDto.password);
    if (!isPasswordValid) throw new UnauthorizedException('Contraseña incorrecta');

    return user;
  }
}
