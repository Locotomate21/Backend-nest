    import { Injectable, ForbiddenException } from '@nestjs/common';
    import { InjectModel } from '@nestjs/mongoose';
    import { Model, Document, Types } from 'mongoose';
    import { Room } from '../room/schema/room.schema';
    import { Resident } from '../resident/schema/resident.schema';
    import { User } from '../users/schema/user.schema';
    import { StatsResponseDto } from './dto/stats-response.dto';
    import { FloorStatsDto } from './dto/stats-floor.dto';
    import { Role } from 'src/common/roles.enum';
    import { RecentActivityDto } from '../stats/dto/recent-activity.dto';
    import { Assembly } from '../assemblies/schema/assembly.schema';
    import { DisciplinaryMeasure } from '../disciplinary/schema/disciplinary-measure.schema';
    import { Report } from '../reports/schema/report.schema';
    import { News } from '../news/schema/news.schema';

    // ✅ Tipos extendidos
    type RoomWithResident = Room & { currentResident?: Resident } & Document;
    type ResidentWithRoomUser = Resident & { room?: Room; user?: User } & Document;
    type ReportWithResidentRoom = Report & { resident?: ResidentWithRoomUser } & Document;

    @Injectable()
    export class StatsService {
    constructor(
        @InjectModel(Room.name) private roomModel: Model<Room>,
        @InjectModel(Resident.name) private residentModel: Model<Resident>,
        @InjectModel(Report.name) private reportModel: Model<Report>,
        @InjectModel(Assembly.name) private assemblyModel: Model<Assembly>,
        @InjectModel(DisciplinaryMeasure.name) private measureModel: Model<DisciplinaryMeasure>,
        @InjectModel(News.name) private newsModel: Model<News>,
    ) {}

    async getStats(user: any): Promise<StatsResponseDto> {
        let floorFilter: number | null = null;

        switch (user.role) {
        case Role.Admin:
            floorFilter = null;
            break;

        case Role.Representative:
        case Role.FloorAuditor:
            if (!user.floor) {
            throw new ForbiddenException('Este usuario no tiene piso asignado');
            }
            floorFilter = Number(user.floor);
            if (isNaN(floorFilter)) {
            throw new ForbiddenException(`El piso asignado (${user.floor}) no es válido`);
            }
            break;

        case Role.President:
        case Role.VicePresident:
        case Role.GeneralAuditor:
        case Role.Adjudicator:
        case Role.SecretaryGeneral:
            floorFilter = null;
            break;

        case Role.Resident:
            return this.getResidentStats(user.sub);

        default:
            throw new ForbiddenException('Unauthorized role');
        }

        return this.getGlobalStats(floorFilter);
    }

    // 📌 Ocupación por piso
    private async getOccupancyByFloor(
        rooms: RoomWithResident[],
    ): Promise<{ floor: number; totalRooms: number; occupiedRooms: number }[]> {
        const floors = [...new Set(rooms.map((r) => r.floor))];
        return floors.map((floor) => {
        const floorRooms = rooms.filter((r) => r.floor === floor);
        const occupiedRooms = floorRooms.filter((r) => r.currentResident).length;
        return {
            floor,
            totalRooms: floorRooms.length,
            occupiedRooms,
        };
        });
    }

    // 📌 Estadísticas de un residente individual - CORREGIDO
    private async getResidentStats(userId: string): Promise<StatsResponseDto> {
        try {
        // Convertir a ObjectId si es necesario
        const objectId = new Types.ObjectId(userId);
        
        const resident = (await this.residentModel
            .findOne({ user: objectId })
            .populate('room')
            .populate('user')
            .exec()) as ResidentWithRoomUser;

        if (!resident) {
            throw new ForbiddenException('Resident not found');
        }

        const reportsCount = await this.reportModel.countDocuments({ resident: resident._id });
        const roomOccupied = resident.room ? 1 : 0;

        return {
            totalResidents: 1,
            activeResidents: resident.user?.active ? 1 : 0,
            totalRooms: resident.room ? 1 : 0,
            occupiedRooms: roomOccupied,
            freeRooms: roomOccupied ? 0 : 1,
            reportsCount,
        };
        } catch (error) {
        console.error('Error in getResidentStats:', error);
        throw new ForbiddenException('Error retrieving resident statistics');
        }
    }

    // 📌 Estadísticas globales o filtradas por piso
    private async getGlobalStats(floorFilter: number | null): Promise<StatsResponseDto> {
        try {
        // ✅ Rooms
        const roomQuery = floorFilter !== null ? { floor: floorFilter } : {};
        const rooms = (await this.roomModel
            .find(roomQuery)
            .populate('currentResident')
            .exec()) as unknown as RoomWithResident[];

        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter((r) => r.currentResident).length;
        const freeRooms = totalRooms - occupiedRooms;
        const occupancyByFloor = await this.getOccupancyByFloor(rooms);

        // ✅ Residents
        const residents = (await this.residentModel
            .find({})
            .populate('room')
            .populate('user')
            .exec()) as unknown as ResidentWithRoomUser[];

        const filteredResidents =
            floorFilter !== null ? residents.filter((r) => r.room?.floor === floorFilter) : residents;

        const totalResidents = filteredResidents.length;
        const activeResidents = filteredResidents.filter((r) => r.user?.active).length;

        // ✅ Reports
        let reports: ReportWithResidentRoom[] = [];

        if (floorFilter !== null) {
            const floorRooms = await this.roomModel.find({ floor: floorFilter }).select('_id').exec();
            const roomIds = floorRooms.map((r) => r._id);
            
            reports = (await this.reportModel
            .find({})
            .populate({
                path: 'resident',
                populate: [
                { path: 'room', match: { _id: { $in: roomIds } } },
                { path: 'user' },
                ],
            })
            .populate('createdBy')
            .exec()) as unknown as ReportWithResidentRoom[];

            reports = reports.filter((r) => r.resident?.room);
        } else {
            reports = (await this.reportModel
            .find({})
            .populate({
                path: 'resident',
                populate: [{ path: 'room' }, { path: 'user' }],
            })
            .populate('createdBy')
            .exec()) as unknown as ReportWithResidentRoom[];
        }

        const reportsCount = reports.length;

        // 📌 Estadísticas por piso (solo admin)
        const floors: FloorStatsDto[] = [];
        if (!floorFilter) {
            const floorNumbers = [...new Set(rooms.map((r) => r.floor))];
            for (const floor of floorNumbers) {
            const floorRooms = rooms.filter((r) => r.floor === floor);
            const floorResidents = residents.filter((r) => r.room?.floor === floor);
            const floorReports = reports.filter((r) => r.resident?.room?.floor === floor);

            floors.push({
                floor,
                totalRooms: floorRooms.length,
                occupiedRooms: floorRooms.filter((r) => r.currentResident).length,
                freeRooms: floorRooms.filter((r) => !r.currentResident).length,
                totalResidents: floorResidents.length,
                activeResidents: floorResidents.filter((r) => r.user?.active).length,
                reportsCount: floorReports.length,
            });
            }
        }

        // 🔹 Actividades recientes
        const [assemblies, measures, news] = await Promise.all([
            this.assemblyModel.find(floorFilter ? { floor: floorFilter } : {}).sort({ date: -1 }).limit(10).exec(),
            this.measureModel
            .find()
            .populate({
                path: 'residentId',
                populate: [{ path: 'room', select: 'number floor' }, { path: 'user', select: 'fullName' }],
            })
            .sort({ createdAt: -1 })
            .limit(10)
            .exec(),
            this.newsModel.find().sort({ createdAt: -1 }).limit(10).exec(),
        ]);

        const activities: RecentActivityDto[] = [
            // Reports (reparaciones)
            ...reports
            .filter((r) => !floorFilter || (r.resident as any)?.room?.floor === floorFilter)
            .map((r) => ({
                type: 'report' as const,
                title: r.reason ?? (r as any).title ?? 'Reparación',
                resident: (r.resident as any)?.fullName ?? 'Desconocido',
                roomNumber: (r.resident as any)?.room?.number,
                floor: (r.resident as any)?.room?.floor,
                date: new Date(r.date ?? (r as any).createdAt ?? Date.now()),
            })),

            // Nuevos residentes
            ...filteredResidents.map((r) => ({
            type: 'newResident' as const,
            title: `Nuevo residente agregado: ${r.fullName ?? 'Desconocido'}`,
            resident: r.fullName ?? 'Desconocido',
            roomNumber: r.room ? (r.room as any).number : undefined,
            floor: r.room ? (r.room as any).floor : undefined,
            date: new Date(r.enrollmentDate ?? (r as any).createdAt ?? Date.now()),
            })),

            // Asambleas
            ...assemblies.map((a) => ({
            type: 'assembly' as const,
            title: a.title ?? 'Asamblea',
            date: new Date(a.date ?? (a as any).createdAt ?? Date.now()),
            })),

            // Medidas disciplinarias
            ...measures
            .filter((m) => {
                if (!floorFilter) return true;
                const mfloor = (m.residentId as any)?.room?.floor;
                return mfloor === floorFilter;
            })
            .map((m) => ({
                type: 'disciplinary' as const,
                title: m.title ?? (m as any).reason ?? 'Medida disciplinaria',
                resident: (m.residentId as any)?.fullName ?? 'Desconocido',
                roomNumber: (m.residentId as any)?.room?.number,
                floor: (m.residentId as any)?.room?.floor,
                date: new Date((m as any).createdAt ?? Date.now()),
            })),

            // Noticias
            ...news.map((n) => ({
            type: 'news' as const,
            title: n.title ?? 'Noticia',
            date: new Date((n as any).createdAt ?? (n as any).date ?? Date.now()),
            })),
        ];

        const recentActivities: RecentActivityDto[] = activities
            .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
            .slice(0, 10);

        return {
            totalResidents,
            activeResidents,
            totalRooms,
            occupiedRooms,
            freeRooms,
            reportsCount,
            floors: floors.length ? floors : undefined,
            occupancyByFloor,
            recentActivities,
        };
        } catch (error) {
        console.error('Error in getGlobalStats:', error);
        throw new ForbiddenException('Error retrieving global statistics');
        }
    }
    }