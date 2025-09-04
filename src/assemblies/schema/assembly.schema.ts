    import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
    import { Document } from 'mongoose';
    import { Role } from '../../common/roles.enum';

    export type AssemblyDocument = Assembly & Document;

    @Schema({ timestamps: true })
    export class Assembly {
    @Prop({ required: true })
    title?: string;

    @Prop({ required: true })
    type?: 'general' | 'floor'; // general o piso

    @Prop({ required: true })
    date?: string;

    @Prop({ required: true })
    time?: string;

    @Prop({ required: true })
    location?: string;

    @Prop({ 
        type: { present: { type: Number }, total: { type: Number } },
        required: false
    })
    attendance?: { present: number; total: number };

    @Prop({ required: true, default: 'Programada' })
    status?: 'Programada' | 'Completada';

    @Prop({ type: String })
    createdBy?: string;

    @Prop({ type: Number, required: false })
    floor?: number; // solo si es asamblea de piso
    }

export const AssemblySchema = SchemaFactory.createForClass(Assembly);
