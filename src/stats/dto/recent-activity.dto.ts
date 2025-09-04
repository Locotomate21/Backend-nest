export type ActivityType = 'report' | 'newResident';

export class RecentActivityDto {
  type!: ActivityType;        // 'report' | 'newResident'
  title!: string;             // Título descriptivo
  resident!: string;          // Nombre del residente
  roomNumber?: number;        // Número de habitación (opcional)
  floor?: number;             // Piso (opcional)
  date!: Date;                // Fecha de la actividad
}
