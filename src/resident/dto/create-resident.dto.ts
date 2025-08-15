import { IsString } from 'class-validator';

export class CreateResidentDto {
  @IsString()
  fullName!: string;

  @IsString()
  idNumber!: string;

  @IsString()
  roomNumber!: string;
}
