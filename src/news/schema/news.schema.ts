import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NewsDocument = News & Document;

@Schema({ timestamps: true })
export class News {
  @Prop({ required: true })
  title?: string;

  @Prop({ required: true })
  content?: string;

  @Prop({ type: Date, default: Date.now })
  publishedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy?: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['general', 'floor'],
    default: 'general',
  })
  type?: string; // "general" o "floor"

  @Prop({ type: Number, required: false })
  floor?: number; // solo si es tipo "floor"
}

export const NewsSchema = SchemaFactory.createForClass(News);