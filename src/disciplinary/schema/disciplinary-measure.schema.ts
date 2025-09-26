    import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
    import { Document, Types } from 'mongoose';
    import { Resident } from '../../resident/schema/resident.schema';
    import { User } from '../../users/schema/user.schema';

    export type DisciplinaryMeasureDocument = DisciplinaryMeasure & Document;

    @Schema({ timestamps: true })
    export class DisciplinaryMeasure {
    @Prop({ required: true })
    title!: string;

    @Prop({ required: true })
    description!: string;

    @Prop({
        required: true,
        enum: ['Activa', 'Resuelta'],
        default: 'Activa',
    })
    status!: string;

    @Prop({ type: Types.ObjectId, ref: 'Resident', required: true })
    residentId!: Types.ObjectId | Resident;

    // 👉 quién la creó (cualquier rol con permiso: representante, fiscal, presidente, etc.)
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy!: Types.ObjectId | User;

    // 👉 quién la resolvió (solo ciertos roles: presidente, fiscal general)
    @Prop({ type: Types.ObjectId, ref: 'User', required: false })
    resolvedBy?: Types.ObjectId | User;
    }

    export const DisciplinaryMeasureSchema =
    SchemaFactory.createForClass(DisciplinaryMeasure);
