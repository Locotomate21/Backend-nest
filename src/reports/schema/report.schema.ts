import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Resident } from '../../resident/schema/resident.schema';

@Schema({ timestamps: true })
export class Report {
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Resident.name, required: true })
  resident!: Types.ObjectId | Resident;

  @Prop({ type: Date, default: Date.now })
  date!: Date;

  @Prop({ required: true })
  reason!: string;

  @Prop()
  actionTaken?: string;
}

export type ReportDocument = Report & Document<Types.ObjectId>;

export const ReportSchema = SchemaFactory.createForClass(Report);