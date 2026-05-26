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
  condition: 'new' | 'used';
  conditionNote?: string; // z.B. "leichte Gebrauchsspuren, Kette neu"
  weight: number; // kg
  frameMaterial: 'Carbon' | 'Aluminium' | 'Stahl' | 'Titan';
  groupset: string;
  brakes: 'Hydraulisch' | 'Mechanisch';
  tireWidth: number; // mm max
  sizes: string[];
  wheelSize: '700c' | '650b' | '700c / 650b';
  shopLinks: ShopLink[];
  highlights: string[];
  stack: number; // mm
  reach: number; // mm (size M/54)
  brandColor: string; // hex for card header
}

export interface UserProfile {
  height: number;
  experience: 'beginner' | 'intermediate' | 'advanced';
  terrain: 'road' | 'mixed' | 'offroad';
  priority: 'speed' | 'comfort' | 'adventure' | 'budget';
}

export interface ScoredBike extends Bike {
  matchScore: number; // 0–100
  matchReasons: string[];
}
