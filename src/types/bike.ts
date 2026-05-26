export interface ShopLink {
  name: string;
  url: string;
  price?: number;
}

export interface Bike {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  weight: number; // kg
  frameMaterial: 'Carbon' | 'Aluminium' | 'Stahl' | 'Titan';
  groupset: string;
  brakes: 'Hydraulisch' | 'Mechanisch';
  tireWidth: number; // mm max
  sizes: string[];
  wheelSize: '700c' | '650b' | '700c / 650b';
  image: string;
  shopLinks: ShopLink[];
  highlights: string[];
  stack: number; // mm
  reach: number; // mm (size M/54)
}
