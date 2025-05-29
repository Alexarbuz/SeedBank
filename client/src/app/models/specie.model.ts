import {Genus} from '../models/genus.model'
export interface Specie {
  id: number;
  name_of_specie: string;
  Genus: Genus;
}