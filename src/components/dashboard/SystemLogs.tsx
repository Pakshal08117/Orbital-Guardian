import { useEffect, useState } from "react";
import { realTimeService } from "@/services/realTimeService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type LogItem = {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  message: string;
  source: string;
  details?: string;
};

const levelColor: Record<LogItem["level"], string> = {
  info: "text-blue-500",
  success: "text-green-500",
  warning: "text-amber-500",
  error: "text-red-500",
};

export default function SystemLogs() {
  const [logs, setLogs] = useState<LogItem[]>([]);

  useEffect(() => {
    // Seed with existing logs
    setLogs(realTimeService.getLogs() as LogItem[]);

    // Subscribe to live log updates
    const unsub = realTimeService.subscribe("logs", (data) => {
      setLogs(Array.isArray(data) ? (data as LogItem[]) : []);
    });

    // Ensure the service emits at least once on mount
    realTimeService.triggerUpdate("logs");

    return () => unsub();
  }, []);

  const download = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `system-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">System Logs</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => realTimeService.triggerUpdate("logs")}>Refresh</Button>
          <Button variant="outline" size="sm" onClick={download}>Download</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-64 overflow-auto text-sm">
          {logs.length === 0 ? (
            <p className="text-muted-foreground">No logs yet.</p>
          ) : (
            <ul className="space-y-2">
              {logs.map((log) => (
                <li key={log.id} className="grid grid-cols-[auto_1fr] gap-x-3">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`${levelColor[log.level]} text-xs uppercase font-medium`}>{log.level}</span>
                      <span className="text-foreground">{log.message}</span>
                      <span className="text-xs text-muted-foreground">({log.source})</span>
                    </div>
                    {log.details && (
                      <div className="text-xs text-muted-foreground mt-1">{log.details}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


