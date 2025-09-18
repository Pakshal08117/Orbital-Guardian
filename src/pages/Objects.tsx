import { Helmet } from "react-helmet-async";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Satellite, Zap, AlertTriangle, Search, Filter } from "lucide-react";

interface SpaceObject {
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
}

const mockObjects: SpaceObject[] = [
  { id: 'SAT-2391', name: 'Starlink-4521', type: 'satellite', country: 'USA', launchDate: '2023-03-15', altitude: 550, inclination: 53.2, period: 95.5, status: 'active', riskLevel: 'high', lastUpdate: '2024-08-10T08:30:00Z' },
  { id: 'DEB-9921', name: 'Cosmos-1408 Fragment', type: 'debris', country: 'Russia', launchDate: '1982-09-20', altitude: 485, inclination: 82.6, period: 93.8, status: 'inactive', riskLevel: 'high', lastUpdate: '2024-08-10T07:45:00Z' },
  { id: 'SAT-4521', name: 'Sentinel-2B', type: 'satellite', country: 'ESA', launchDate: '2017-03-07', altitude: 786, inclination: 98.6, period: 100.4, status: 'active', riskLevel: 'medium', lastUpdate: '2024-08-10T08:15:00Z' },
  { id: 'DEB-5563', name: 'Fengyun-1C Fragment', type: 'debris', country: 'China', launchDate: '1999-05-10', altitude: 865, inclination: 98.8, period: 102.1, status: 'inactive', riskLevel: 'medium', lastUpdate: '2024-08-10T06:22:00Z' },
  { id: 'SAT-7821', name: 'GPS III SV03', type: 'satellite', country: 'USA', launchDate: '2020-06-30', altitude: 20180, inclination: 55.0, period: 718.0, status: 'active', riskLevel: 'low', lastUpdate: '2024-08-10T08:45:00Z' },
  { id: 'DEB-2193', name: 'Iridium-33 Fragment', type: 'debris', country: 'USA', launchDate: '1997-09-14', altitude: 790, inclination: 86.4, period: 100.8, status: 'inactive', riskLevel: 'low', lastUpdate: '2024-08-10T07:12:00Z' },
  { id: 'SAT-1042', name: 'Terra (EOS AM-1)', type: 'satellite', country: 'USA', launchDate: '1999-12-18', altitude: 705, inclination: 98.2, period: 98.9, status: 'active', riskLevel: 'low', lastUpdate: '2024-08-10T08:20:00Z' },
  { id: 'SAT-6677', name: 'OneWeb-0123', type: 'satellite', country: 'UK', launchDate: '2022-04-01', altitude: 1200, inclination: 87.4, period: 109.5, status: 'active', riskLevel: 'low', lastUpdate: '2024-08-10T08:35:00Z' },
  { id: 'DEB-8891', name: 'ASAT Test Fragment', type: 'debris', country: 'India', launchDate: '2008-10-22', altitude: 650, inclination: 97.9, period: 97.8, status: 'inactive', riskLevel: 'low', lastUpdate: '2024-08-10T06:55:00Z' },
  { id: 'DEB-1002', name: 'SL-16 R/B Fragment', type: 'debris', country: 'Russia', launchDate: '2019-07-05', altitude: 420, inclination: 51.6, period: 92.1, status: 'decayed', riskLevel: 'low', lastUpdate: '2024-08-09T14:30:00Z' }
];

function getRiskBadgeVariant(risk: string) {
  switch (risk) {
    case 'high': return 'destructive';
    case 'medium': return 'default';
    default: return 'secondary';
  }
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'active': return 'default';
    case 'inactive': return 'secondary';
    default: return 'outline';
  }
}

export default function Objects() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredObjects = useMemo(() => {
    return mockObjects.filter(obj => {
      const matchesSearch = obj.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          obj.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          obj.country.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'all' || obj.type === typeFilter;
      const matchesRisk = riskFilter === 'all' || obj.riskLevel === riskFilter;
      const matchesStatus = statusFilter === 'all' || obj.status === statusFilter;
      
      return matchesSearch && matchesType && matchesRisk && matchesStatus;
    });
  }, [searchQuery, typeFilter, riskFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = mockObjects.length;
    const satellites = mockObjects.filter(obj => obj.type === 'satellite').length;
    const debris = mockObjects.filter(obj => obj.type === 'debris').length;
    const highRisk = mockObjects.filter(obj => obj.riskLevel === 'high').length;
    
    return { total, satellites, debris, highRisk };
  }, []);

  return (
    <main className="container py-8">
      <Helmet>
        <title>Objects – Orbital Guardian</title>
        <meta name="description" content="Browse tracked space objects in Orbital Guardian." />
        <link rel="canonical" href="/objects" />
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-3xl font-heading mb-4">Tracked Objects</h1>
        <p className="text-muted-foreground">
          Comprehensive catalog of satellites and space debris with real-time tracking data.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Objects</p>
                <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
              </div>
              <Satellite className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Satellites</p>
                <p className="text-2xl font-bold text-blue-600">{stats.satellites}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Debris Objects</p>
                <p className="text-2xl font-bold text-gray-600">{stats.debris}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{stats.highRisk}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search objects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Object Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="satellite">Satellites</SelectItem>
                <SelectItem value="debris">Debris</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="decayed">Decayed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Objects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Space Objects ({filteredObjects.length} found)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Object ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Altitude (km)</TableHead>
                  <TableHead>Period (min)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Last Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredObjects.map((obj) => (
                  <TableRow key={obj.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono">{obj.id}</TableCell>
                    <TableCell className="font-medium">{obj.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {obj.type === 'satellite' ? (
                          <Satellite className="h-4 w-4 text-blue-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-gray-600" />
                        )}
                        <span className="capitalize">{obj.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{obj.country}</TableCell>
                    <TableCell>{obj.altitude.toLocaleString()}</TableCell>
                    <TableCell>{obj.period.toFixed(1)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(obj.status)}>
                        {obj.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRiskBadgeVariant(obj.riskLevel)}>
                        {obj.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(obj.lastUpdate).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
