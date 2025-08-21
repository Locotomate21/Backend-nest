import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Resident } from '../../resident/schema/resident.schema';

@Schema({ timestamps: true })
export class Room {
  @Prop({ required: true })
  number!: number;

  @Prop({ required: true })
  floor!: number;

  @Prop({ default: false })
  occupied!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Resident', default: null })
  currentResident!: Types.ObjectId | Resident | null;

  __v?: number;
}

export type RoomDocument = Room & Document;

export const RoomSchema = SchemaFactory.createForClass(Room);

// 🔹 Opcional: Hook para actualizar occupied automáticamente
RoomSchema.pre<RoomDocument>('save', function (next) {
  this.occupied = !!this.currentResident;
  next();
});
