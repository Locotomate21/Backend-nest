    import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
    import { Document } from 'mongoose';

    export type AssemblyDocument = Assembly & Document;

    @Schema({ timestamps: true })
    export class Assembly {
    @Prop({ required: true })
    title!: string;

    @Prop({ required: true, enum: ['general', 'floor'] })
    type!: 'general' | 'floor'; // general o piso

    @Prop({ required: true })
    date!: string;

    @Prop({ required: true })
    time!: string;

    @Prop({ required: true })
    location!: string;

    @Prop({
        type: { present: { type: Number }, total: { type: Number } },
        required: false,
    })
    attendance?: { present: number; total: number };

    @Prop({
        required: true,
        default: 'Programada',
        enum: ['Programada', 'Completada', 'Aplazada', 'Cancelada'],
    })
    status!: 'Programada' | 'Completada' | 'Aplazada' | 'Cancelada';

    // 📌 Nuevos campos para cambios de estado
    @Prop({ type: String, required: false })
    description?: string; // detalles adicionales de la asamblea

    @Prop({ type: String, required: false })
    postponementReason?: string; // motivo del aplazamiento

    @Prop({ type: String, required: false })
    newDate?: string; // nueva fecha si se aplaza

    @Prop({ type: String, required: false })
    newTime?: string; // nueva hora si se aplaza

    @Prop({ type: String })
    createdBy!: string;

    @Prop({ type: Number, required: false })
    floor?: number; // solo si es asamblea de piso
    }

    export const AssemblySchema = SchemaFactory.createForClass(Assembly);
