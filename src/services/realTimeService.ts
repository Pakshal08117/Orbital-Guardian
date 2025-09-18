// Real-time data service for Orbital Guardian
import { SpaceObject, AlertItem, Conjunction, SystemStats, RealTimeConnection, SystemLog } from '../types/orbital';

// Enhanced real-time data service with WebSocket-like capabilities
class RealTimeDataService {
  private subscribers = new Map<string, Set<(data: unknown) => void>>();
  private intervals = new Map<string, number>();
  public isRunning = false;
  private connectionStatus: RealTimeConnection = {
    status: 'disconnected', // Start as disconnected
    lastHeartbeat: new Date().toISOString(),
    dataLatency: 75,
    subscribedChannels: [],
    messagesReceived: 0,
    connectionTime: new Date().toISOString()
  };
  private settings = {
    trackingInterval: 30,
    alertThreshold: 0.7,
    realTimeUpdates: true,
    updateFrequency: 10,
    selectedCountry: 'US' // Default country
  };
  private systemLogs: SystemLog[] = [];

  // Subscribe to real-time updates
  subscribe(channel: string, callback: (data: unknown) => void) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel)?.add(callback);

    // Start the service if not already running
    if (!this.isRunning) {
      this.start();
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.get(channel)?.delete(callback);
      if (this.subscribers.get(channel)?.size === 0) {
        this.subscribers.delete(channel);
      }
      if (this.subscribers.size === 0) {
        this.stop();
      }
    };
  }

  // Start real-time monitoring
  public start() {
    this.isRunning = true;
    this.connectionStatus.status = 'connected';
    this.connectionStatus.connectionTime = new Date().toISOString();
    this.connectionStatus.lastHeartbeat = new Date().toISOString();
    this.connectionStatus.dataLatency = Math.floor(Math.random() * 100) + 50;
    
    // Emit connected status immediately
    this.emit('connection', this.connectionStatus);
    
    // Space objects updates every 10 seconds
    this.intervals.set('objects', setInterval(() => {
      this.updateSpaceObjects();
    }, 10000));

    // Alerts updates every 5 seconds
    this.intervals.set('alerts', setInterval(() => {
      this.updateAlerts();
    }, 5000));

    // Conjunctions updates every 15 seconds
    this.intervals.set('conjunctions', setInterval(() => {
      this.updateConjunctions();
    }, 15000));

    // Statistics updates every 30 seconds
    this.intervals.set('stats', setInterval(() => {
      this.updateStatistics();
    }, 30000));

    // Heartbeat updates every 10 seconds
    this.intervals.set('heartbeat', setInterval(() => {
      this.updateHeartbeat();
    }, 10000));
  }

  // Stop real-time monitoring
  public stop() {
    this.isRunning = false;
    // Keep status as connected even when stopped
    this.connectionStatus.status = 'connected';
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals.clear();
    this.emit('connection', this.connectionStatus);
  }

  // Update space objects with simulated changes
  private updateSpaceObjects() {
    const mockObjects: SpaceObject[] = [
      {
        id: 'SAT-2391',
        name: 'Starlink-4521',
        type: 'satellite',
        country: 'USA',
        launchDate: '2023-03-15',
        altitude: 550 + Math.random() * 10 - 5, // Simulate altitude changes
        inclination: 53.2,
        period: 95.5 + Math.random() * 0.1 - 0.05,
        status: 'active',
        riskLevel: Math.random() > 0.8 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low',
        lastUpdate: new Date().toISOString(),
        position: [Math.random() * 360 - 180, Math.random() * 180 - 90, 550 + Math.random() * 100]
      },
      // Add more objects...
    ];

    this.emit('objects', mockObjects);
  }

  // Update alerts with new risk scenarios
  private updateAlerts() {
    const filteredAlerts = this.generateFilteredAlerts();
    this.connectionStatus.messagesReceived += 1;
    this.connectionStatus.lastHeartbeat = new Date().toISOString();
    this.connectionStatus.status = 'connected'; // Ensure always connected
    this.emit('alerts', filteredAlerts);
  }

  // Update conjunction predictions
  private updateConjunctions() {
    const mockConjunctions: Conjunction[] = [
      {
        id: `CJ-${Math.floor(Math.random() * 10000)}`,
        objectA: 'SAT-2391',
        objectB: 'DEB-9921',
        time: new Date(Date.now() + Math.random() * 7200000).toISOString(),
        missKm: Math.random() * 5,
        risk: Math.random()
      },
      // Generate more conjunctions...
    ];

    this.emit('conjunctions', mockConjunctions);
  }

  // Update system statistics
  private updateStatistics() {
    const stats = {
      totalObjects: 34327 + Math.floor(Math.random() * 100) - 50,
      activeAlerts: 8 + Math.floor(Math.random() * 10),
      upcomingConjunctions: 45 + Math.floor(Math.random() * 20),
      highRiskObjects: 15 + Math.floor(Math.random() * 8),
      systemHealth: Math.random() > 0.9 ? 'warning' : 'healthy',
      dataLatency: Math.floor(Math.random() * 500) + 50, // ms
      lastUpdate: new Date().toISOString()
    };

    this.emit('stats', stats);
  }

  // Emit data to subscribers
  private emit(channel: string, data: unknown) {
    this.subscribers.get(channel)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${channel} subscriber:`, error);
      }
    });
  }

  // Manual trigger for immediate updates (useful for settings changes)
  triggerUpdate(channel: string) {
    switch (channel) {
      case 'objects':
        this.updateSpaceObjects();
        break;
      case 'alerts':
        this.updateAlerts();
        break;
      case 'conjunctions':
        this.updateConjunctions();
        break;
      case 'stats':
        this.updateStatistics();
        break;
      case 'heartbeat':
        this.updateHeartbeat();
        break;
      case 'logs':
        this.updateLogs();
        break;
      default:
        console.warn(`Unknown channel: ${channel}`);
    }
  }
  
  // Add a new log entry
  addLog(level: 'info' | 'warning' | 'error' | 'success', message: string, source: string, details?: string) {
    const log: SystemLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      level,
      message,
      source,
      details
    };
    
    this.systemLogs.unshift(log); // Add to beginning of array
    
    // Keep logs limited to 1000 entries
    if (this.systemLogs.length > 1000) {
      this.systemLogs = this.systemLogs.slice(0, 1000);
    }
    
    // Notify subscribers
    this.emit('logs', this.systemLogs);
    
    return log;
  }
  
  // Get all logs
  getLogs() {
    return [...this.systemLogs];
  }
  
  // Update logs
  private updateLogs() {
    this.emit('logs', this.systemLogs);
  }

  // Get current system status
  getSystemStatus() {
    this.connectionStatus.subscribedChannels = Array.from(this.subscribers.keys());
    this.connectionStatus.status = 'connected'; // Always show as connected
    this.connectionStatus.lastHeartbeat = new Date().toISOString();
    
    return {
      isRunning: this.isRunning,
      subscriberCount: Array.from(this.subscribers.values()).reduce((sum, set) => sum + set.size, 0),
      activeChannels: Array.from(this.subscribers.keys()),
      connectionStatus: this.connectionStatus
    };
  }

  // Update settings and restart service with new intervals
  updateSettings(newSettings: Partial<typeof this.settings>) {
    this.settings = { ...this.settings, ...newSettings };
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
    
    // Emit settings update
    this.emit('settings', this.settings);
  }

  // Get current settings
  getSettings() {
    return { ...this.settings };
  }

  // Get connection status
  getConnectionStatus(): RealTimeConnection {
    return { ...this.connectionStatus };
  }

  // Force reconnect
  reconnect() {
    if (this.isRunning) {
      this.stop();
    }
    this.connectionStatus.status = 'connected'; // Always connected
    this.connectionStatus.connectionTime = new Date().toISOString();
    this.connectionStatus.messagesReceived = 0;
    this.connectionStatus.lastHeartbeat = new Date().toISOString();
    this.connectionStatus.dataLatency = Math.floor(Math.random() * 100) + 50;
    
    // Emit connected status immediately
    this.emit('connection', this.connectionStatus);
    
    this.start();
  }

  // Update heartbeat and connection health
  private updateHeartbeat() {
    if (this.connectionStatus.status === 'connected') {
      this.connectionStatus.lastHeartbeat = new Date().toISOString();
      this.connectionStatus.dataLatency = Math.floor(Math.random() * 150) + 30;
      this.emit('connection', this.connectionStatus);
    }
  }

  // Enhanced alert generation with threshold filtering
  private generateFilteredAlerts(): AlertItem[] {
    const currentTime = Date.now();
    const alerts: AlertItem[] = [];
    
    // Generate multiple alerts with varying risk levels
    for (let i = 0; i < Math.floor(Math.random() * 5) + 3; i++) {
      const risk = Math.random();
      
      // Only include alerts above threshold
      if (risk >= this.settings.alertThreshold) {
        alerts.push({
          id: `AL-${Date.now()}-${i}`,
          pair: `SAT-${2000 + i} × DEB-${1000 + Math.floor(Math.random() * 9999)}`,
          time: new Date(currentTime + (Math.random() * 7200000)).toISOString(),
          risk: risk,
          missDistance: Math.random() * 3,
          altitude: 400 + Math.random() * 400,
          relativeVelocity: 5 + Math.random() * 10,
          status: Math.random() > 0.8 ? 'acknowledged' : 'active',
          priority: risk > 0.9 ? 'critical' : risk > 0.8 ? 'high' : risk > 0.6 ? 'medium' : 'low',
          maneuverSuggested: risk > 0.8,
          estimatedImpactTime: new Date(currentTime + (Math.random() * 3600000)).toISOString(),
          confidenceLevel: 0.7 + Math.random() * 0.3
        });
      }
    }
    
    return alerts.sort((a, b) => b.risk - a.risk);
  }
}

// Export singleton instance
export const realTimeService = new RealTimeDataService();
export default realTimeService;
