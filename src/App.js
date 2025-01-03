import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './components/ui/select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ShotAnalysisDashboard = () => {
  // Sample data structure - replace with your actual data
  const teamData = {
    "Chicago Bulls": {
      current: {
        RA: { attempts: 29.9, percentage: 0.63, points: 37.7 },
        NRA: { attempts: 20.0, percentage: 0.42, points: 16.8 },
        MR: { attempts: 5.5, percentage: 0.41, points: 4.4 },
        LC3: { attempts: 4.6, percentage: 0.39, points: 5.4 },
        RC3: { attempts: 6.1, percentage: 0.43, points: 7.8 },
        AB3: { attempts: 25.2, percentage: 0.34, points: 25.5 }
      },
      optimal: {
        RA: { attempts: 25.9, percentage: 0.63, points: 32.7 },
        NRA: { attempts: 15.0, percentage: 0.42, points: 12.6 },
        MR: { attempts: 4.5, percentage: 0.41, points: 3.6 },
        LC3: { attempts: 7.6, percentage: 0.39, points: 8.9 },
        RC3: { attempts: 9.1, percentage: 0.43, points: 11.7 },
        AB3: { attempts: 29.2, percentage: 0.34, points: 29.7 }
      }
    }
  };

  const [selectedTeam, setSelectedTeam] = useState("Chicago Bulls");

  // Transform data for the chart
  const prepareChartData = (team) => {
    const data = [];
    const shotTypes = ['RA', 'NRA', 'MR', 'LC3', 'RC3', 'AB3'];
    
    shotTypes.forEach(type => {
      data.push({
        name: type,
        current: team.current[type].attempts,
        optimal: team.optimal[type].attempts,
        currentEV: (team.current[type].percentage * (type.includes('3') ? 3 : 2)).toFixed(2),
        optimalEV: (team.optimal[type].percentage * (type.includes('3') ? 3 : 2)).toFixed(2)
      });
    });
    return data;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">NBA Shot Analysis Dashboard</CardTitle>
          <div className="w-[240px]">
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(teamData).map(team => (
                  <SelectItem key={team} value={team}>{team}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Shot Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Shot Distribution Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareChartData(teamData[selectedTeam])}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="current" name="Current Attempts" fill="#93c5fd" />
                      <Bar dataKey="optimal" name="Optimal Attempts" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Expected Value Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Expected Value Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prepareChartData(teamData[selectedTeam]).map(shot => (
                    <div key={shot.name} className="p-4 border rounded-lg">
                      <h3 className="font-semibold">{shot.name} Shots</h3>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p>Current: {shot.current.toFixed(1)} attempts</p>
                          <p>EV: {shot.currentEV} points/shot</p>
                        </div>
                        <div>
                          <p>Optimal: {shot.optimal.toFixed(1)} attempts</p>
                          <p className={
                            Number(shot.optimal) > Number(shot.current) 
                              ? "text-green-600" 
                              : "text-red-600"
                          }>
                            {Number(shot.optimal) > Number(shot.current) ? "Increase" : "Decrease"} by{" "}
                            {Math.abs(shot.optimal - shot.current).toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShotAnalysisDashboard;