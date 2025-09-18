// Type definitions for Orbital Guardian

export interface SpaceObject {
  id: string;
  name: string;
  type: 'satellite' | 'debris';
  country: string;
  launchDate: string;
  altitude: number;
  inclination: number;
  period: number;
  status: 'active' | 'inactive' | 'decayed';
  riskLevel: 'high' | 'medium' | 'low';
  lastUpdate: string;
  position?: [number, number, number]; // [longitude, latitude, altitude]
  velocity?: [number, number, number]; // [x, y, z] km/s
}

export interface AlertItem {
  id: string;
  pair: string;
  time: string;
  risk: number;
  missDistance: number;
  altitude: number;
  relativeVelocity: number;
  status: 'active' | 'acknowledged' | 'resolved';
  priority: 'critical' | 'high' | 'medium' | 'low';
  maneuverSuggested?: boolean;
  estimatedImpactTime?: string;
  confidenceLevel?: number;
}

export interface Conjunction {
  id: string;
  objectA: string;
  objectB: string;
  time: string;
  missKm: number;
  risk: number;
  probability?: number;
  recommendedAction?: 'monitor' | 'maneuver' | 'contact';
}

export interface SystemSettings {
  // Alert Settings
  emailNotifications: boolean;
  pushNotifications: boolean;
  highRiskAlerts: boolean;
  mediumRiskAlerts: boolean;
  lowRiskAlerts: boolean;
  alertThreshold: number;
  
  // System Configuration
  trackingInterval: number; // seconds
  dataRetention: number; // days
  
  // Safety & Automation
  autoManeuver: boolean;
  collaborativeMode: boolean;
  
  // API Configuration
  apiKey: string;
  webhookUrl: string;
  
  // Real-time settings
  realTimeUpdates: boolean;
  updateFrequency: number; // seconds
}

export interface SystemStats {
  totalObjects: number;
  activeAlerts: number;
  upcomingConjunctions: number;
  highRiskObjects: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  dataLatency: number; // milliseconds
  lastUpdate: string;
  processingRate?: number; // objects/second
  memoryUsage?: number; // percentage
  cpuUsage?: number; // percentage
}

export interface ManeuverSuggestion {
  id: string;
  alertId: string;
  type: 'prograde' | 'retrograde' | 'radial' | 'normal';
  deltaV: number; // m/s
  executionTime: string;
  fuelCost: number; // kg
  successProbability: number;
  risks: string[];
  benefits: string[];
}

export interface NotificationSettings {
  channels: {
    email: boolean;
    push: boolean;
    webhook: boolean;
  };
  riskLevels: {
    critical: boolean;
    high: boolean;
    medium: boolean;
    low: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily';
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
  };
}

export interface ApiConfiguration {
  key: string;
  webhookUrl?: string;
  rateLimits: {
    requests: number;
    window: number; // seconds
  };
  endpoints: {
    objects: boolean;
    alerts: boolean;
    conjunctions: boolean;
    statistics: boolean;
  };
}

export interface RealTimeConnection {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastHeartbeat: string;
  dataLatency: number; // ms
  subscribedChannels: string[];
  messagesReceived: number;
  connectionTime: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  source: string;
  details?: string;
}
