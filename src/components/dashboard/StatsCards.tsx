import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Satellite, AlertTriangle, Route, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { realTimeService } from "@/services/realTimeService";
import type { SystemStats } from "@/types/orbital";

const StatCard = ({
  title,
  value,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accent: "primary" | "accent" | "destructive";
}) => (
  <Card className="relative overflow-hidden transition-transform hover:scale-[1.02]">
    <CardContent className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-3xl font-heading tracking-wide">{value}</p>
        </div>
        {(() => {
          const cls =
            accent === "primary"
              ? "rounded-md p-2 bg-primary/20 text-primary"
              : accent === "accent"
              ? "rounded-md p-2 bg-accent/20 text-accent"
              : "rounded-md p-2 bg-destructive/20 text-destructive";
          return (
            <div className={cls}>
              <Icon className="h-5 w-5" />
            </div>
          );
        })()}
      </div>
      <div className="mt-3">
        <Badge variant="secondary" className="bg-secondary/60">
          Live
        </Badge>
      </div>
    </CardContent>
  </Card>
);

export default function StatsCards() {
  const [stats, setStats] = useState<SystemStats>({
    totalObjects: 0,
    activeAlerts: 0,
    upcomingConjunctions: 0,
    highRiskObjects: 0,
    systemHealth: 'healthy',
    dataLatency: 0,
    lastUpdate: new Date().toISOString()
  });

  useEffect(() => {
    // Subscribe to real-time statistics
    const unsubscribe = realTimeService.subscribe('stats', (newStats: SystemStats) => {
      setStats(newStats);
    });

    // Initial data fetch
    realTimeService.triggerUpdate('stats');

    return unsubscribe;
  }, []);

  const getHealthBadgeVariant = (health: string) => {
    switch (health) {
      case 'healthy': return 'secondary';
      case 'warning': return 'default';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-enter">
      <StatCard 
        title="Total Tracked Objects" 
        value={stats.totalObjects.toLocaleString()} 
        icon={Satellite} 
        accent="primary" 
      />
      <StatCard 
        title="Active Alerts" 
        value={stats.activeAlerts} 
        icon={AlertTriangle} 
        accent={stats.activeAlerts > 0 ? "destructive" : "primary"}
      />
      <StatCard 
        title="Upcoming Conjunctions" 
        value={stats.upcomingConjunctions} 
        icon={Route} 
        accent="accent" 
      />
      <Card className="relative overflow-hidden transition-transform hover:scale-[1.02]">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">System Health</p>
              <p className="mt-1 text-2xl font-heading tracking-wide capitalize">
                {stats.systemHealth}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Latency: {stats.dataLatency}ms
              </p>
            </div>
            <div className="rounded-md p-2 bg-green-500/20 text-green-500">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Badge variant={getHealthBadgeVariant(stats.systemHealth)}>
              {stats.systemHealth === 'healthy' ? 'Live' : stats.systemHealth}
            </Badge>
            {stats.highRiskObjects > 0 && (
              <Badge variant="destructive" className="text-xs">
                {stats.highRiskObjects} High Risk
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
