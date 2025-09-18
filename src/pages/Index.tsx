import StatsCards from "@/components/dashboard/StatsCards";
import SolarSystem from "@/components/dashboard/SolarSystem";
import EarthOrbit from "@/components/dashboard/EarthOrbit";
import ConjunctionTable from "@/components/dashboard/ConjunctionTable";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/components/auth/AuthProvider";
import { useState, useEffect } from "react";
import { realTimeService } from "@/services/realTimeService";

const Index = () => {
  const { user } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [is24h, setIs24h] = useState(() => {
    const saved = localStorage.getItem('og_time_format');
    return saved ? saved === '24' : true;
  });
  
  // Get settings from realTimeService
  useEffect(() => {
    try {
      console.log("Fetching settings from realTimeService");
      const settings = realTimeService.getSettings();
      console.log("Settings retrieved:", settings);
      if (settings && settings.selectedCountry) {
        setSelectedCountry(settings.selectedCountry);
      }
      // Default to user's local country inferred from browser timezone
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        const guess = (() => {
          const map: Record<string, string> = {
            'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US', 'America/Los_Angeles': 'US',
            'Europe/London': 'GB', 'Europe/Berlin': 'DE', 'Europe/Paris': 'FR', 'Europe/Madrid': 'ES', 'Europe/Rome': 'IT',
            'Asia/Tokyo': 'JP', 'Asia/Shanghai': 'CN', 'Asia/Kolkata': 'IN', 'Asia/Singapore': 'SG', 'Asia/Seoul': 'KR',
            'Australia/Sydney': 'AU', 'America/Toronto': 'CA', 'America/Sao_Paulo': 'BR', 'Europe/Moscow': 'RU',
          };
          // direct match
          if (map[tz]) return map[tz];
          // heuristic by continent
          if (tz.startsWith('America/')) return 'US';
          if (tz.startsWith('Europe/')) return 'GB';
          if (tz.startsWith('Asia/')) return 'IN';
          if (tz.startsWith('Australia/')) return 'AU';
          return 'US';
        })();
        setSelectedCountry(guess);
      } catch (e) {
        console.warn('Failed to infer country from timezone', e);
      }
      
      // Start the realtime service if not already running
      if (!realTimeService.isRunning) {
        console.log("Starting realTimeService");
        realTimeService.start();
      }
      
      // Update time every second
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      
      return () => {
        clearInterval(timer);
        // Don't stop the service here as other components might be using it
      };
    } catch (error) {
      console.error("Error in dashboard initialization:", error);
    }
  }, []);
  
  // Get user's display name
  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.user_metadata?.display_name || 
           user.user_metadata?.full_name || 
           user.email?.split('@')[0] || 
           'User';
  };
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };
  
  // Get country name from country code
  const getCountryName = () => {
    const countries = {
      'US': 'United States',
      'GB': 'United Kingdom',
      'JP': 'Japan',
      'DE': 'Germany',
      'FR': 'France',
      'CN': 'China',
      'IN': 'India',
      'RU': 'Russia',
      'BR': 'Brazil',
      'AU': 'Australia',
      // Add more countries as needed
    };
    return countries[selectedCountry] || 'Global';
  };

  // Get IANA timezone for selected country
  const getCountryTimeZone = () => {
    const tzMap: Record<string, string> = {
      US: 'America/New_York',
      GB: 'Europe/London',
      JP: 'Asia/Tokyo',
      DE: 'Europe/Berlin',
      FR: 'Europe/Paris',
      CN: 'Asia/Shanghai',
      IN: 'Asia/Kolkata',
      RU: 'Europe/Moscow',
      BR: 'America/Sao_Paulo',
      AU: 'Australia/Sydney',
    };
    return tzMap[selectedCountry] || Intl.DateTimeFormat().resolvedOptions().timeZone;
  };

  return (
    <div className="min-h-screen relative bg-background overflow-hidden">
      <div className="bg-aurora" />
      <Helmet>
        <title>Orbital Guardian – Space Debris Monitoring Dashboard</title>
        <meta name="description" content="Real-time space debris monitoring, collision alerts, and conjunction insights on a 3D globe." />
        <link rel="canonical" href="/" />
      </Helmet>

      {/* Main content */}
      <main className="container py-2 relative z-10">
        <div className="text-center mb-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Orbital Guardian
          </h1>
          {/* Big real-time clock with country */}
          <div className="mt-1">
            <div className="text-4xl font-semibold tracking-tight">
              {currentTime.toLocaleTimeString([], { hour12: !is24h, timeZone: getCountryTimeZone() })}
            </div>
            <p className="text-sm text-muted-foreground">
              {getCountryName()} • {currentTime.toLocaleDateString([], { timeZone: getCountryTimeZone() })}
            </p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <button
                className={`px-3 py-1 rounded-md border text-sm ${is24h ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
                onClick={() => { setIs24h(true); localStorage.setItem('og_time_format', '24'); }}
              >
                24h
              </button>
              <button
                className={`px-3 py-1 rounded-md border text-sm ${!is24h ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
                onClick={() => { setIs24h(false); localStorage.setItem('og_time_format', '12'); }}
              >
                12h
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6">
          <div className="rounded-none border-0 relative">
            <EarthOrbit />
          </div>
          {/* Extended content below the 3D model */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ConjunctionTable />
            </div>
            <aside className="lg:col-span-1">
              <AlertsPanel />
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
