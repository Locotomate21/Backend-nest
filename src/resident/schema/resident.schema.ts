import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schema/user.schema';
import { Room } from '../../room/schema/room.schema';

export type ResidentDocument = Resident & Document;

@Schema({ timestamps: true })
export class Resident {
  _id?: Types.ObjectId;

  @Prop({ required: true })
  fullName!: string;

  @Prop({ required: true, unique: true })
  idNumber!: number;

  @Prop({ required: true, unique: true })
  studentCode!: number;

  @Prop({ required: true, unique: true })
  email!: string;
  
  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true })
  period!: string;

  @Prop({ required: true })
  admissionYear!: number;

  @Prop({ required: true })
  academicProgram!: string;

  @Prop({ default: 'resident' })
  role!: string;

  @Prop({ required: true })
  benefitOrActivity!: string;

  // 🔹 Guardamos el ObjectId de la habitación vinculada
  @Prop({ type: Types.ObjectId, ref: 'Room', default: null })
  room?: Types.ObjectId | Room | null;

  @Prop({ type: Date, default: Date.now })
  enrollmentDate!: Date;

  // 🔹 Usuario propietario de este Resident (1:1 con User)
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user!: Types.ObjectId | User;
}

export const ResidentSchema = SchemaFactory.createForClass(Resident);
