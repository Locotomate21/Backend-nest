import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceDto } from '../dto/create-service.dto';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
