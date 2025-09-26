    import { Module } from '@nestjs/common';
    import { MongooseModule } from '@nestjs/mongoose';
    import { DisciplinaryMeasuresService } from './disciplinary-measures.service';
    import { DisciplinaryMeasuresController } from './controller/disciplinary-measures.controller';
    import { DisciplinaryMeasure, DisciplinaryMeasureSchema } from './schema/disciplinary-measure.schema';
    import { Resident, ResidentSchema } from '../resident/schema/resident.schema';

    @Module({
    imports: [
        MongooseModule.forFeature([
        { name: DisciplinaryMeasure.name, schema: DisciplinaryMeasureSchema },
        { name: Resident.name, schema: ResidentSchema }, // 👈 Agregar Resident
        ]),
    ],
    controllers: [DisciplinaryMeasuresController],
    providers: [DisciplinaryMeasuresService],
    exports: [DisciplinaryMeasuresService],
    })
    export class DisciplinaryMeasuresModule {}

