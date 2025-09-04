    import { Injectable, ForbiddenException } from '@nestjs/common'; 
    import { InjectModel } from '@nestjs/mongoose';
    import { Model, Document } from 'mongoose';
    import { Room } from '../room/schema/room.schema';
    import { Resident } from '../resident/schema/resident.schema';
    import { Report } from '../reports/schema/report.schema';
    import { User } from '../users/schema/user.schema';
    import { StatsResponseDto } from './dto/stats-response.dto';
    import { FloorStatsDto } from './dto/stats-floor.dto';
    import { Role } from 'src/common/roles.enum';
    import { RecentActivityDto } from '../stats/dto/recent-activity.dto';

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
    ) {}

    async getStats(user: any): Promise<StatsResponseDto> {
        let floorFilter: number | null = null;

        switch (user.role) {
        case Role.Admin:
            floorFilter = null;
            break;

        case Role.Representative:
        case Role.FloorAuditor:
            floorFilter = user.floor ?? null;
            if (floorFilter === null) {
            throw new ForbiddenException('No floor assigned');
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

    // 📌 Ocupación por piso para el dashboard del representante
    private async getOccupancyByFloor(rooms: RoomWithResident[]): Promise<{ floor: number, totalRooms: number, occupiedRooms: number }[]> {
        const floors = [...new Set(rooms.map(r => r.floor))];
        return floors.map(floor => {
        const floorRooms = rooms.filter(r => r.floor === floor);
        const occupiedRooms = floorRooms.filter(r => r.currentResident).length;
        return {
            floor,
            totalRooms: floorRooms.length,
            occupiedRooms,
        };
        });
    }

    // 📌 Estadísticas de un residente individual
    private async getResidentStats(residentId: string): Promise<StatsResponseDto> {
        const resident = await this.residentModel
        .findById(residentId)
        .populate('room')
        .populate('user')
        .exec() as ResidentWithRoomUser;

        if (!resident) throw new ForbiddenException('Resident not found');

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
    }

    
    // 📌 Estadísticas globales o filtradas por piso
    private async getGlobalStats(floorFilter: number | null): Promise<StatsResponseDto> {
        // ✅ Rooms (filtradas si el usuario es Representative)
        const roomQuery = floorFilter !== null ? { floor: floorFilter } : {};
        const rooms = await this.roomModel
            .find(roomQuery)
            .populate('currentResident')
            .exec() as unknown as RoomWithResident[];

        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter(r => r.currentResident).length;
        const freeRooms = totalRooms - occupiedRooms;
        const occupancyByFloor = await this.getOccupancyByFloor(rooms);

        // ✅ Residents (filtrados por piso si aplica)
        const residents = await this.residentModel
            .find({})
            .populate('room')
            .populate('user')
            .exec() as unknown as ResidentWithRoomUser[];

        const filteredResidents = floorFilter !== null
            ? residents.filter(r => r.room?.floor === floorFilter)
            : residents;

        const totalResidents = filteredResidents.length;
        const activeResidents = filteredResidents.filter(r => r.user?.active).length;

    // ✅ Reports (filtrados directamente si aplica)
    let reports: ReportWithResidentRoom[] = [];

    if (floorFilter !== null) {
        // 1. Obtengo los IDs de rooms en ese piso
        const floorRooms = await this.roomModel.find({ floor: floorFilter }).select('_id').exec();
        const roomIds = floorRooms.map(r => r._id);

        // 2. Busco reports solo de residentes que estén en esos rooms
        reports = await this.reportModel
            .find({})
            .populate({
                path: 'resident',
                populate: [
                    { path: 'room', match: { _id: { $in: roomIds } } },
                    { path: 'user' },
                ],
            })
            .populate('createdBy')
            .exec() as unknown as ReportWithResidentRoom[];

        // 3. Elimino los que quedaron sin room (porque no estaban en ese piso)
        reports = reports.filter(r => r.resident?.room);

    } else {
        // Admin: todos los reports
        reports = await this.reportModel
            .find({})
            .populate({
                path: 'resident',
                populate: [{ path: 'room' }, { path: 'user' }],
            })
            .populate('createdBy')
            .exec() as unknown as ReportWithResidentRoom[];
    }

    const reportsCount = reports.length;

        // 📌 Estadísticas por piso (solo Admin, porque Representative ya está filtrado arriba)
        const floors: FloorStatsDto[] = [];
        if (!floorFilter) {
            const floorNumbers = [...new Set(rooms.map(r => r.floor))];
            for (const floor of floorNumbers) {
                const floorRooms = rooms.filter(r => r.floor === floor);
                const floorResidents = residents.filter(r => r.room?.floor === floor);
                const floorReports = reports.filter(r => r.resident?.room?.floor === floor);

                floors.push({
                    floor,
                    totalRooms: floorRooms.length,
                    occupiedRooms: floorRooms.filter(r => r.currentResident).length,
                    freeRooms: floorRooms.filter(r => !r.currentResident).length,
                    totalResidents: floorResidents.length,
                    activeResidents: floorResidents.filter(r => r.user?.active).length,
                    reportsCount: floorReports.length,
                });
            }
        }

        // 🔹 Actividades recientes combinando reportes y nuevos residentes
        const recentActivities: RecentActivityDto[] = [
        ...reports.map(r => ({
            type: 'report' as const, // literal exacto para TS
            title: r.reason,
            resident: (r.resident as ResidentWithRoomUser)?.fullName ?? 'Desconocido',
            roomNumber: (r.resident as ResidentWithRoomUser)?.room
            ? ((r.resident as ResidentWithRoomUser)?.room as RoomWithResident).number
            : undefined,
            floor: (r.resident as ResidentWithRoomUser)?.room
            ? ((r.resident as ResidentWithRoomUser)?.room as RoomWithResident).floor
            : undefined,
            date: r.date,
        })),
        ...filteredResidents.map(r => ({
            type: 'newResident' as const, // literal exacto
            title: `Nuevo residente agregado: ${r.fullName}`,
            resident: r.fullName,
            roomNumber: r.room ? (r.room as RoomWithResident).number : undefined,
            floor: r.room ? (r.room as RoomWithResident).floor : undefined,
            date: r.enrollmentDate,
        })),
        ]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5);

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
    }
}