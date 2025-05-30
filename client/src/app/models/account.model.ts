import { Role } from "./role.model";
export interface Account {
  id: number;
  first_name: string;
  last_name: string;
  patronymic: string;
  Role: Role;
  login: string;
  password: string;
}