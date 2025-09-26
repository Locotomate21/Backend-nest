export type ActivityType =
  | 'report'
  | 'newResident'
  | 'assembly'
  | 'disciplinary'
  | 'news';

export class RecentActivityDto {
  type!: ActivityType;        // tipo de actividad
  title!: string;             // título descriptivo
  resident?: string;          // nombre del residente (si aplica)
  roomNumber?: number;        // número de habitación (si aplica)
  floor?: number;             // piso (si aplica)
  date!: Date;                // fecha de la actividad
}
