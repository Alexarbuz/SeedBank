export interface Family {
  id: number;
  name_of_family: string;
}

export interface Genus {
  id: number;
  name_of_genus: string;
  Family: Family;
}

export interface Specie {
  id: number;
  name_of_specie: string;
  Genus: Genus;
}

export interface RedBook {
  id: number;
  category: string;
}

export interface PlaceOfCollection {
  id: number;
  place_of_collection: string;
}

export interface Seed {
  seed_id: string;
  seed_name: string;
  completed_seeds: number;
  seed_germination: number;
  seed_moisture: number;
  gpsaltitude: number;
  gpslongitude: number;
  gpslatitude: number;
  weight_of1000seeds: number;
  date_of_collection: string;
  number_of_seeds: number;
  comment: string;
  image: string | null;
  xrayimage: string | null;
  account_id: number;
  Specie: Specie;
  RedBookRF: RedBook;
  RedBookSO: RedBook;
  PlaceOfCollection: PlaceOfCollection;
}
