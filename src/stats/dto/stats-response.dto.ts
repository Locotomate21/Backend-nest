import { FloorStatsDto } from './stats-floor.dto';
import { RecentActivityDto } from './recent-activity.dto';   // 👈 Importar en vez de redefinir

export class StatsResponseDto {
  totalResidents!: number;       
  activeResidents!: number;      
  totalRooms!: number;           
  occupiedRooms!: number;        
  freeRooms!: number;            
  reportsCount!: number;         
  floors?: FloorStatsDto[];      
  
  // ✅ Datos de ocupación por piso
  occupancyByFloor?: {
    floor: number;
    totalRooms: number;
    occupiedRooms: number;
  }[];

  // ✅ Últimas actividades unificadas con el DTO correcto
  recentActivities?: RecentActivityDto[];
}
