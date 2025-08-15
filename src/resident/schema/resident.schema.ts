import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Room } from '../../room/schema/room.schema';


export type ResidentDocument = Resident & Document;

@Schema()
export class Resident {
  @Prop({ required: true })
  fullName!: string;

  @Prop({ required: true, unique: true })
  idNumber!: string;

  @Prop({ type: Types.ObjectId, ref: Room.name, default: null })
  room!: Types.ObjectId | null;
}

export const ResidentSchema = SchemaFactory.createForClass(Resident);