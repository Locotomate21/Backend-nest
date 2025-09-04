import { FloorStatsDto } from './stats-floor.dto';

export class RecentActivityDto {
  type!: 'report' | 'newResident';
  title!: string;
  resident?: string;
  roomNumber?: number;
  floor?: number;
  date!: Date;
}

export class StatsResponseDto {
  totalResidents!: number;       
  activeResidents!: number;      
  totalRooms!: number;           
  occupiedRooms!: number;        
  freeRooms!: number;            
  reportsCount!: number;         
  floors?: FloorStatsDto[];      
  
  // ✅ Nueva propiedad para el dashboard del representante
  occupancyByFloor?: {
    floor: number;
    totalRooms: number;
    occupiedRooms: number;
  }[];

  // 🔹 Agregamos recentActivities
  recentActivities?: RecentActivityDto[];
}
