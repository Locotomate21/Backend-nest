import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Resident } from '../../resident/schema/resident.schema';

@Schema()
export class Room {
  _id!: Types.ObjectId; 

  @Prop({ required: true })
  number!: number;

  @Prop({ required: true })
  floor!: number;

  @Prop({ default: false })
  occupied!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Resident', default: null })
  currentResident!: Types.ObjectId | Resident | null;

  __v?: number; // 🔹 Declarado como opcional
}

export type RoomDocument = Room & Document;

export const RoomSchema = SchemaFactory.createForClass(Room);
