import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Conjunction {
  id: string;
  objectA: string;
  objectB: string;
  time: string; // ISO
  missKm: number;
  risk: number; // 0..1
}

const sample: Conjunction[] = [
  { id: "CJ-10293", objectA: "SAT-2391", objectB: "DEB-9921", time: new Date(Date.now() + 3600e3).toISOString(), missKm: 0.42, risk: 0.86 },
  { id: "CJ-10294", objectA: "SAT-4521", objectB: "DEB-5563", time: new Date(Date.now() + 7200e3).toISOString(), missKm: 1.9, risk: 0.62 },
  { id: "CJ-10295", objectA: "SAT-7821", objectB: "DEB-2193", time: new Date(Date.now() + 10800e3).toISOString(), missKm: 4.1, risk: 0.22 },
  { id: "CJ-10301", objectA: "SAT-6677", objectB: "DEB-8891", time: new Date(Date.now() + 5400e3).toISOString(), missKm: 0.95, risk: 0.74 },
  { id: "CJ-10302", objectA: "SAT-1042", objectB: "DEB-1002", time: new Date(Date.now() + 14400e3).toISOString(), missKm: 0.18, risk: 0.92 },
];

function riskClass(r: number) {
  if (r >= 0.8) return "text-destructive font-medium";
  if (r >= 0.5) return "text-primary";
  return "text-accent";
}

export default function ConjunctionTable() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const data = useMemo(() => {
    let rows = [...sample].sort((a, b) => +new Date(a.time) - +new Date(b.time));
    rows = rows.filter((r) => r.id.toLowerCase().includes(query.toLowerCase()) || r.objectA.toLowerCase().includes(query.toLowerCase()) || r.objectB.toLowerCase().includes(query.toLowerCase()));
    if (filter === "high") rows = rows.filter((r) => r.risk >= 0.7);
    if (filter === "medium") rows = rows.filter((r) => r.risk >= 0.3 && r.risk < 0.7);
    if (filter === "low") rows = rows.filter((r) => r.risk < 0.3);
    return rows;
  }, [query, filter]);

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="font-heading">Conjunctions</CardTitle>
          <div className="flex gap-2">
            <Input placeholder="Search ID or Object" value={query} onChange={(e) => setQuery(e.target.value)} className="w-52" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All risk levels</SelectItem>
                <SelectItem value="high">High (≥ 0.7)</SelectItem>
                <SelectItem value="medium">Medium (0.3–0.7)</SelectItem>
                <SelectItem value="low">Low (≤ 0.3)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Object IDs</TableHead>
                <TableHead>Closest Approach</TableHead>
                <TableHead>Miss Distance (km)</TableHead>
                <TableHead>Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/40">
                  <TableCell className="whitespace-nowrap">{row.objectA} × {row.objectB} <span className="text-muted-foreground">({row.id})</span></TableCell>
                  <TableCell>{new Date(row.time).toLocaleString()}</TableCell>
                  <TableCell>{row.missKm.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={riskClass(row.risk)}>{row.risk.toFixed(2)}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
