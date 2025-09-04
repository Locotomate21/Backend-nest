    import { Module } from '@nestjs/common';
    import { MongooseModule } from '@nestjs/mongoose';
    import { AssembliesService } from './assemblies.service';
    import { AssembliesController } from './controller/assemblies.controller';
    import { Assembly, AssemblySchema } from './schema/assembly.schema';

    @Module({
    imports: [MongooseModule.forFeature([{ name: Assembly.name, schema: AssemblySchema }])],
    providers: [AssembliesService],
    controllers: [AssembliesController],
    })
    export class AssemblyModule {}
