import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Resident } from '../../resident/schema/resident.schema';
import { User } from '../../users/schema/user.schema'; 

@Schema({ timestamps: true })
export class Report {
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Resident', required: true })
  resident!: Types.ObjectId | Resident;

  @Prop({ type: Date, default: Date.now })
  date!: Date;

  @Prop({ required: true })
  reason!: string;

  @Prop()
  actionTaken?: string;

  // 👇 este es el campo que faltaba
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: User | Types.ObjectId;
}

export type ReportDocument = Report & Document<Types.ObjectId>;

export const ReportSchema = SchemaFactory.createForClass(Report);
