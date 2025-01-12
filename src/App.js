import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ShotAnalysisDashboard = () => {
  const [selectedTeam, setSelectedTeam] = useState("");
  const [availableTeams, setAvailableTeams] = useState([]);
  const [teamData, setTeamData] = useState({});
  const [scoringImpact, setScoringImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("attempts");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        console.log("Fetching teams...");
        const response = await fetch('http://127.0.0.1:5000/test');
        const data = await response.json();
        console.log("Teams data:", data);
        
        if (data.available_teams?.length > 0) {
          setAvailableTeams(data.available_teams);
          setSelectedTeam(data.available_teams[0]);
        } else {
          setError("No teams available");
        }
      } catch (err) {
        console.error("Error fetching teams:", err);
        setError("Failed to load teams. Is the backend server running?");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!selectedTeam) return;
      
      setLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:5000/api/team-data');
        const allTeamData = await response.json();
        const teamData = allTeamData[selectedTeam];
        
        if (!teamData) {
          throw new Error('Team data not found');
        }

        const formattedData = {
          shot_analysis: {
            RA: {
              current_attempts: teamData.current.RA.attempts,
              optimal_attempts: teamData.optimal.RA.attempts,
              current_makes: teamData.current.RA.makes,
              optimal_makes: teamData.optimal.RA.makes,
              current_fg_percentage: teamData.current.RA.percentage,
              total_expected_value: teamData.current.RA.ev,
              suggested_change: teamData.impact.RA.attempt_difference,
              makes_difference: teamData.impact.RA.makes_difference
            },
            NRA: {
              current_attempts: teamData.current.NRA.attempts,
              optimal_attempts: teamData.optimal.NRA.attempts,
              current_makes: teamData.current.NRA.makes,
              optimal_makes: teamData.optimal.NRA.makes,
              current_fg_percentage: teamData.current.NRA.percentage,
              total_expected_value: teamData.current.NRA.ev,
              suggested_change: teamData.impact.NRA.attempt_difference,
              makes_difference: teamData.impact.NRA.makes_difference
            },
            MR: {
              current_attempts: teamData.current.MR.attempts,
              optimal_attempts: teamData.optimal.MR.attempts,
              current_makes: teamData.current.MR.makes,
              optimal_makes: teamData.optimal.MR.makes,
              current_fg_percentage: teamData.current.MR.percentage,
              total_expected_value: teamData.current.MR.ev,
              suggested_change: teamData.impact.MR.attempt_difference,
              makes_difference: teamData.impact.MR.makes_difference
            },
            LC3: {
              current_attempts: teamData.current.LC3.attempts,
              optimal_attempts: teamData.optimal.LC3.attempts,
              current_makes: teamData.current.LC3.makes,
              optimal_makes: teamData.optimal.LC3.makes,
              current_fg_percentage: teamData.current.LC3.percentage,
              total_expected_value: teamData.current.LC3.ev,
              suggested_change: teamData.impact.LC3.attempt_difference,
              makes_difference: teamData.impact.LC3.makes_difference
            },
            RC3: {
              current_attempts: teamData.current.RC3.attempts,
              optimal_attempts: teamData.optimal.RC3.attempts,
              current_makes: teamData.current.RC3.makes,
              optimal_makes: teamData.optimal.RC3.makes,
              current_fg_percentage: teamData.current.RC3.percentage,
              total_expected_value: teamData.current.RC3.ev,
              suggested_change: teamData.impact.RC3.attempt_difference,
              makes_difference: teamData.impact.RC3.makes_difference
            },
            AB3: {
              current_attempts: teamData.current.AB3.attempts,
              optimal_attempts: teamData.optimal.AB3.attempts,
              current_makes: teamData.current.AB3.makes,
              optimal_makes: teamData.optimal.AB3.makes,
              current_fg_percentage: teamData.current.AB3.percentage,
              total_expected_value: teamData.current.AB3.ev,
              suggested_change: teamData.impact.AB3.attempt_difference,
              makes_difference: teamData.impact.AB3.makes_difference
            }
          }
        };

        const scoringImpactData = {
          current_ppg: teamData.current.ppg,
          optimized_ppg: teamData.optimal.ppg,
          points_difference: teamData.impact.points_difference,
          ft_attempts: teamData.current.free_throws.attempts,
          ft_percentage: teamData.current.free_throws.percentage,
          projected_wins_impact: teamData.impact.points_difference * 2.7
        };

        setTeamData(formattedData);
        setScoringImpact(scoringImpactData);
      } catch (err) {
        setError("Failed to load team analysis");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [selectedTeam]);

  const shotTypeLabels = {
    'RA': 'Restricted Area',
    'NRA': 'Non-Restricted Area',
    'MR': 'Mid Range',
    'LC3': 'Left Corner 3',
    'RC3': 'Right Corner 3',
    'AB3': 'Above Break 3'
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-lg">Loading... Please make sure the backend server is running.</p>
    </div>
  );
  
  if (error) return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-lg text-red-500">{error}</p>
    </div>
  );

  const getChartData = () => {
    return Object.entries(teamData.shot_analysis).map(([type, data]) => ({
      name: shotTypeLabels[type],
      current: viewMode === "attempts" ? data.current_attempts : data.current_makes,
      optimal: viewMode === "attempts" ? data.optimal_attempts : data.optimal_makes,
    }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">NBA Shot Analysis Dashboard</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-[240px]">
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {availableTeams.map(team => (
                    <SelectItem key={team} value={team}>{team}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[240px]">
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select view mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attempts">Show Attempts</SelectItem>
                  <SelectItem value="makes">Show Makes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        {scoringImpact && (
          <CardContent>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Scoring Impact Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-lg">
                      Current PPG: <span className="font-bold">{scoringImpact.current_ppg.toFixed(1)}</span>
                    </p>
                    <p className="text-lg">
                      Optimized PPG: <span className="font-bold">{scoringImpact.optimized_ppg.toFixed(1)}</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg">
                      Points Impact: 
                      <span className={`font-bold ${scoringImpact.points_difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {' '}{scoringImpact.points_difference > 0 ? '+' : ''}{scoringImpact.points_difference.toFixed(1)}
                      </span>
                    </p>
                    <p className="text-lg">
                      Projected Wins Impact: 
                      <span className={`font-bold ${scoringImpact.projected_wins_impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {' '}{scoringImpact.projected_wins_impact > 0 ? '+' : ''}{scoringImpact.projected_wins_impact.toFixed(1)}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>
                    Shot Distribution Analysis ({viewMode === "attempts" ? "Attempts" : "Makes"})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[600px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={getChartData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                      >
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          height={100}
                          interval={0}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend 
                          verticalAlign="top" 
                          height={36}
                        />
                        <Bar 
                          dataKey="current" 
                          name={`Current ${viewMode}`}
                          fill="#93c5fd" 
                          barSize={40}
                        />
                        <Bar 
                          dataKey="optimal" 
                          name={`Optimal ${viewMode}`}
                          fill="#3b82f6" 
                          barSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Shot Type Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {Object.entries(teamData.shot_analysis).map(([type, data]) => (
                      <div key={type} className="p-8 border rounded-lg bg-gray-50">
                        <h3 className="font-semibold text-2xl mb-6">{shotTypeLabels[type]}</h3>
                        <div className="grid grid-cols-2 gap-x-16 gap-y-4">
                          <p className="text-xl">
                            <span className="font-medium">FG%:</span> {(data.current_fg_percentage * 100).toFixed(1)}%
                          </p>
                          <p className="text-xl">
                            <span className="font-medium">Expected Value:</span> {data.total_expected_value.toFixed(2)} points/shot
                          </p>
                          <p className="text-xl">
                            <span className="font-medium">Current Makes/Attempts:</span> {data.current_makes.toFixed(1)} / {data.current_attempts.toFixed(1)}
                          </p>
                          <p className="text-xl">
                            <span className="font-medium">Optimal Makes/Attempts:</span> {data.optimal_makes.toFixed(1)} / {data.optimal_attempts.toFixed(1)}
                          </p>
                          <p className={`text-xl font-semibold ${data.suggested_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Attempts: {data.suggested_change > 0 ? 'Increase' : 'Decrease'} by {Math.abs(data.suggested_change).toFixed(1)}
                          </p>
                          <p className={`text-xl font-semibold ${data.makes_difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Makes: {data.makes_difference > 0 ? 'Increase' : 'Decrease'} by {Math.abs(data.makes_difference).toFixed(1)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ShotAnalysisDashboard;