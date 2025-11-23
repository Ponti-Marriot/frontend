import { Empleado } from "./Empleado";

export interface EmpleadoDTO {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  empleado: Empleado;
}