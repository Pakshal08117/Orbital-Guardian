import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bell, Shield, Database, Code, Settings2, AlertTriangle, Mail, Smartphone, Globe, Clock, Wifi, WifiOff, Activity, Zap, Users, RefreshCw, MapPin } from "lucide-react";
import { toast } from "sonner";
import { realTimeService } from "@/services/realTimeService";
import type { RealTimeConnection } from "@/types/orbital";

// List of countries with their time zones
const countries = [
  { name: "United States", code: "US", timezone: "America/New_York" },
  { name: "United Kingdom", code: "GB", timezone: "Europe/London" },
  { name: "Japan", code: "JP", timezone: "Asia/Tokyo" },
  { name: "Germany", code: "DE", timezone: "Europe/Berlin" },
  { name: "France", code: "FR", timezone: "Europe/Paris" },
  { name: "China", code: "CN", timezone: "Asia/Shanghai" },
  { name: "India", code: "IN", timezone: "Asia/Kolkata" },
  { name: "Russia", code: "RU", timezone: "Europe/Moscow" },
  { name: "Brazil", code: "BR", timezone: "America/Sao_Paulo" },
  { name: "Australia", code: "AU", timezone: "Australia/Sydney" },
  { name: "Canada", code: "CA", timezone: "America/Toronto" },
  { name: "South Korea", code: "KR", timezone: "Asia/Seoul" },
  { name: "Italy", code: "IT", timezone: "Europe/Rome" },
  { name: "Spain", code: "ES", timezone: "Europe/Madrid" },
  { name: "Mexico", code: "MX", timezone: "America/Mexico_City" },
  { name: "Indonesia", code: "ID", timezone: "Asia/Jakarta" },
  { name: "Turkey", code: "TR", timezone: "Europe/Istanbul" },
  { name: "Netherlands", code: "NL", timezone: "Europe/Amsterdam" },
  { name: "Saudi Arabia", code: "SA", timezone: "Asia/Riyadh" },
  { name: "Switzerland", code: "CH", timezone: "Europe/Zurich" },
  { name: "Sweden", code: "SE", timezone: "Europe/Stockholm" },
  { name: "Poland", code: "PL", timezone: "Europe/Warsaw" },
  { name: "Belgium", code: "BE", timezone: "Europe/Brussels" },
  { name: "Thailand", code: "TH", timezone: "Asia/Bangkok" },
  { name: "Israel", code: "IL", timezone: "Asia/Jerusalem" },
  { name: "Argentina", code: "AR", timezone: "America/Argentina/Buenos_Aires" },
  { name: "Norway", code: "NO", timezone: "Europe/Oslo" },
  { name: "South Africa", code: "ZA", timezone: "Africa/Johannesburg" },
  { name: "Singapore", code: "SG", timezone: "Asia/Singapore" },
  { name: "New Zealand", code: "NZ", timezone: "Pacific/Auckland" },
  // Add more countries as needed
];

// Sort countries alphabetically
countries.sort((a, b) => a.name.localeCompare(b.name));

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [highRiskAlerts, setHighRiskAlerts] = useState(true);
  const [mediumRiskAlerts, setMediumRiskAlerts] = useState(false);
  const [lowRiskAlerts, setLowRiskAlerts] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState('0.7');
  const [trackingInterval, setTrackingInterval] = useState('30');
  const [dataRetention, setDataRetention] = useState('90');
  const [autoManeuver, setAutoManeuver] = useState(false);
  const [collaborativeMode, setCollaborativeMode] = useState(true);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [updateFrequency, setUpdateFrequency] = useState('10');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [enableLaserCleaning, setEnableLaserCleaning] = useState(false);
  
  // Real-time monitoring state
  const [connectionStatus, setConnectionStatus] = useState<RealTimeConnection>(
    realTimeService.getConnectionStatus()
  );
  const [systemStatus, setSystemStatus] = useState(realTimeService.getSystemStatus());
  const [currentSettings, setCurrentSettings] = useState(realTimeService.getSettings());

  useEffect(() => {
    // Subscribe to real-time status updates
    const statusInterval = setInterval(() => {
      setConnectionStatus(realTimeService.getConnectionStatus());
      setSystemStatus(realTimeService.getSystemStatus());
    }, 5000);

    // Load current settings
    const settings = realTimeService.getSettings();
    setAlertThreshold(settings.alertThreshold.toString());
    setTrackingInterval(settings.trackingInterval.toString());
    setRealTimeUpdates(settings.realTimeUpdates);
    setUpdateFrequency(settings.updateFrequency.toString());

    return () => clearInterval(statusInterval);
  }, []);

  const handleSaveSettings = () => {
    // Update real-time service settings
    realTimeService.updateSettings({
      alertThreshold: parseFloat(alertThreshold),
      trackingInterval: parseInt(trackingInterval),
      realTimeUpdates,
      updateFrequency: parseInt(updateFrequency),
      selectedCountry,
      enableLaserCleaning
    });
    
    // Get country name for toast message
    const countryName = countries.find(c => c.code === selectedCountry)?.name || 'Unknown';
    
    toast.success('Settings saved and applied!', {
      description: `Time zone set to ${countryName} ${enableLaserCleaning ? 'with energy cleaning enabled' : ''}`
    });
  };

  const handleReconnect = () => {
    realTimeService.reconnect();
    toast.info('Reconnecting to real-time monitoring service...');
  };

  const handleForceUpdate = () => {
    realTimeService.triggerUpdate('alerts');
    realTimeService.triggerUpdate('stats');
    realTimeService.triggerUpdate('objects');
    toast.success('Force update triggered for all data streams');
  };

  const handleGenerateApiKey = () => {
    const newKey = `og_${Math.random().toString(36).substr(2, 32)}`;
    setApiKey(newKey);
    toast.success('New API key generated!');
  };

  const handleTestAlert = () => {
    toast.warning('Test alert sent successfully!', {
      description: 'You should receive a test notification if configured correctly.'
    });
  };

  return (
    <main className="container py-8">
      <Helmet>
        <title>Settings – Orbital Guardian</title>
        <meta name="description" content="Configure Orbital Guardian preferences and notifications." />
        <link rel="canonical" href="/settings" />
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-3xl font-heading mb-4">Settings</h1>
        <p className="text-muted-foreground">
          Configure your Orbital Guardian system preferences, alerts, and integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country & Time Zone Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Country & Time Zone Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country-selection" className="text-sm font-medium">Country</Label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Selected time zone: {countries.find(c => c.code === selectedCountry)?.timezone.replace('_', ' ')}
                </p>
              </div>
              
              <div className="flex flex-col justify-end">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="laser-cleaning">Energy Debris Cleaning</Label>
                    <p className="text-sm text-muted-foreground">Enable energy-based debris removal for selected country</p>
                  </div>
                  <Switch 
                    id="laser-cleaning"
                    checked={enableLaserCleaning}
                    onCheckedChange={setEnableLaserCleaning}
                  />
                </div>
                {enableLaserCleaning && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded mt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Energy Cleaning Enabled for {countries.find(c => c.code === selectedCountry)?.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Orbital debris in this region will be prioritized for energy-based removal operations.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Real-Time Monitoring Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Real-Time Monitoring Status
              <div className="flex items-center gap-2 ml-auto">
                {connectionStatus.status === 'connected' ? (
                  <Badge variant="secondary" className="text-green-600">
                    <Wifi className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <WifiOff className="h-3 w-3 mr-1" />
                    {connectionStatus.status}
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Subscribers</span>
                </div>
                <p className="text-lg font-semibold">{systemStatus.subscriberCount}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  <span>Active Channels</span>
                </div>
                <p className="text-lg font-semibold">{systemStatus.activeChannels.length}</p>
                <p className="text-xs text-muted-foreground">{systemStatus.activeChannels.join(', ')}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Last Heartbeat</span>
                </div>
                <p className="text-sm font-semibold">{new Date(connectionStatus.lastHeartbeat).toLocaleTimeString()}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  <span>Messages</span>
                </div>
                <p className="text-lg font-semibold">{connectionStatus.messagesReceived}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleReconnect} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-1" />
                Reconnect
              </Button>
              <Button onClick={handleForceUpdate} variant="outline" size="sm">
                <Zap className="h-4 w-4 mr-1" />
                Force Update
              </Button>
            </div>

            {connectionStatus.status !== 'connected' && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Connection Issue Detected</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Real-time monitoring is currently {connectionStatus.status}. Some features may not work as expected.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Real-Time Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Real-Time Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="real-time-updates">Real-Time Updates</Label>
                  <p className="text-sm text-muted-foreground">Enable live data streaming</p>
                </div>
                <Switch 
                  id="real-time-updates"
                  checked={realTimeUpdates}
                  onCheckedChange={setRealTimeUpdates}
                />
              </div>
              
              <div>
                <Label htmlFor="update-frequency" className="text-sm font-medium">Update Frequency (seconds)</Label>
                <Select value={updateFrequency} onValueChange={setUpdateFrequency}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 (Ultra-fast)</SelectItem>
                    <SelectItem value="10">10 (Fast)</SelectItem>
                    <SelectItem value="15">15 (Standard)</SelectItem>
                    <SelectItem value="30">30 (Conservative)</SelectItem>
                    <SelectItem value="60">60 (Battery saver)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Live Settings</span>
                </div>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div>Alert Threshold: {currentSettings.alertThreshold}</div>
                  <div>Tracking Interval: {currentSettings.trackingInterval}s</div>
                  <div>Real-Time: {currentSettings.realTimeUpdates ? 'Enabled' : 'Disabled'}</div>
                  <div>Update Frequency: {currentSettings.updateFrequency}s</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert & Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alert & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Notification Channels</Label>
                <div className="mt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <Label htmlFor="email-notifications">Email notifications</Label>
                    </div>
                    <Switch 
                      id="email-notifications" 
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <Label htmlFor="push-notifications">Push notifications</Label>
                    </div>
                    <Switch 
                      id="push-notifications"
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm font-medium">Risk Level Alerts</Label>
                <div className="mt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="w-12 justify-center">High</Badge>
                      <Label htmlFor="high-risk">High-risk alerts (≥0.7)</Label>
                    </div>
                    <Switch 
                      id="high-risk" 
                      checked={highRiskAlerts}
                      onCheckedChange={setHighRiskAlerts}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="w-12 justify-center">Med</Badge>
                      <Label htmlFor="medium-risk">Medium-risk alerts (0.3-0.7)</Label>
                    </div>
                    <Switch 
                      id="medium-risk"
                      checked={mediumRiskAlerts}
                      onCheckedChange={setMediumRiskAlerts}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="w-12 justify-center">Low</Badge>
                      <Label htmlFor="low-risk">Low-risk alerts (&lt;0.3)</Label>
                    </div>
                    <Switch 
                      id="low-risk"
                      checked={lowRiskAlerts}
                      onCheckedChange={setLowRiskAlerts}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleTestAlert} variant="outline" size="sm">
                  Test Alert
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              System Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="alert-threshold" className="text-sm font-medium">Alert Threshold</Label>
                <Select value={alertThreshold} onValueChange={setAlertThreshold}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.9">0.9 (Critical only)</SelectItem>
                    <SelectItem value="0.8">0.8 (Very high)</SelectItem>
                    <SelectItem value="0.7">0.7 (High)</SelectItem>
                    <SelectItem value="0.5">0.5 (Medium)</SelectItem>
                    <SelectItem value="0.3">0.3 (Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="tracking-interval" className="text-sm font-medium">Tracking Interval (seconds)</Label>
                <Select value={trackingInterval} onValueChange={setTrackingInterval}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 (Real-time)</SelectItem>
                    <SelectItem value="30">30 (Standard)</SelectItem>
                    <SelectItem value="60">60 (Battery saver)</SelectItem>
                    <SelectItem value="300">300 (Low priority)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="data-retention" className="text-sm font-medium">Data Retention (days)</Label>
                <Select value={dataRetention} onValueChange={setDataRetention}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety & Automation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Safety & Automation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-maneuver">Automated Maneuver Suggestions</Label>
                  <p className="text-sm text-muted-foreground">Enable AI-powered avoidance recommendations</p>
                </div>
                <Switch 
                  id="auto-maneuver"
                  checked={autoManeuver}
                  onCheckedChange={setAutoManeuver}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="collaborative-mode">Collaborative Data Sharing</Label>
                  <p className="text-sm text-muted-foreground">Share anonymized data with global network</p>
                </div>
                <Switch 
                  id="collaborative-mode"
                  checked={collaborativeMode}
                  onCheckedChange={setCollaborativeMode}
                />
              </div>
              
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">Safety Notice</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Automated features are advisory only. Always verify with mission control before executing maneuvers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              API Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="api-key" className="text-sm font-medium">API Key</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="api-key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Generate or enter your API key"
                  type="password"
                />
                <Button onClick={handleGenerateApiKey} variant="outline">
                  Generate
                </Button>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Webhook URL (optional)</Label>
              <Input
                className="mt-1"
                placeholder="https://your-domain.com/orbital-guardian-webhook"
              />
            </div>
            
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Database className="h-4 w-4 text-blue-500" />
                <span className="font-medium">API Documentation</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Access real-time debris data, collision predictions, and alerts programmatically.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <Button onClick={handleSaveSettings} size="lg">
          Save All Settings
        </Button>
      </div>
    </main>
  );
}
