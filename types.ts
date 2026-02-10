
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface SecurityState {
  isLocked: boolean;
  pin: string | null;
  baseLocation: Location | null;
  currentLocation: Location | null;
  fenceRadius: number; // in meters
  alertTriggered: boolean;
}

export interface SecurityInsight {
  status: 'safe' | 'warning' | 'danger';
  message: string;
  advice: string;
}
