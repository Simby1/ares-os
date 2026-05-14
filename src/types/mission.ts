export interface MedicalReading {
  timestamp: number;
  crewId: string;
  heartRate: number; 
  spo2: number;      
  roomO2: number;   
  psi: number;
  status: 'stable' | 'stressed' | 'critical';
}

export interface MissionLog {
  id: string;
  time: string;
  message: string;
  status: 'nominal' | 'warning' | 'alert'; 
}
