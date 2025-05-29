import { Family } from "./seed.model";
export interface Genus {
  id: number;
  name_of_genus: string;
  Family: Family;
}