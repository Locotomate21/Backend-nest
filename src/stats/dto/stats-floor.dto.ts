export class FloorStatsDto {
  floor!: number;                // número de piso
  totalRooms!: number;           // habitaciones totales en el piso
  occupiedRooms!: number;        // ocupadas en el piso
  freeRooms!: number;            // libres en el piso
  totalResidents!: number;       // residentes totales en el piso
  activeResidents!: number;      // residentes activos (user.active = true) en el piso
  reportsCount!: number;         // reportes asociados a residentes de este piso
}
