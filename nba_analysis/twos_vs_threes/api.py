from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import os
import sys

app = Flask(__name__)
CORS(app)

# Define shot types
shot_types = {
    'RA': 2,    # Restricted Area (2 points)
    'NRA': 2,   # Non-Restricted Area (2 points) 
    'MR': 2,    # Mid-Range (2 points)
    'LC3': 3,   # Left Corner 3 (3 points)
    'RC3': 3,   # Right Corner 3 (3 points)
    'AB3': 3    # Above Break 3 (3 points)
}

def analyze_shot_optimization(df):
    """
    Analyzes how teams should adjust their shot selection based on Expected Value.
    """
    # First calculate EV for each shot type
    for shot_type, points in shot_types.items():
        df[f'EV_{shot_type}'] = (df[f'{shot_type}_FG%'] / 100) * points

    # Calculate total EV and FGA
    df['Total_EV'] = sum(df[f'EV_{shot_type}'] for shot_type in shot_types)
    df['Total_FGA'] = sum(df[f'{shot_type}_FGA'] for shot_type in shot_types)
    
    analysis_results = []
    
    for _, team in df.iterrows():
        team_analysis = {'Team': team['Team']}
        
        # Calculate current points from field goals
        current_fg_points = sum(team[f'{shot_type}_FGA'] * team[f'{shot_type}_FG%'] / 100 * points 
                              for shot_type, points in shot_types.items())
        
        # Add free throw points
        current_ft_points = team['FT']
        current_total_points = current_fg_points + current_ft_points
        
        # Calculate optimal points (keeping free throws the same)
        shot_evs = {shot_type: team[f'{shot_type}_FG%'] / 100 * points 
                   for shot_type, points in shot_types.items()}
        total_ev = sum(shot_evs.values())
        
        optimal_fg_points = 0
        for shot_type, points in shot_types.items():
            optimal_proportion = shot_evs[shot_type] / total_ev
            optimal_attempts = team['Total_FGA'] * optimal_proportion
            optimal_points = optimal_attempts * team[f'{shot_type}_FG%'] / 100 * points
            optimal_fg_points += optimal_points
        
        optimal_total_points = optimal_fg_points + current_ft_points  # Include free throw points
        
        team_analysis.update({
            'current_ppg': current_total_points,
            'optimal_ppg': optimal_total_points,
            'ft_points': current_ft_points,
            'ft_attempts': team['FTA'],
            'ft_percentage': team['FT%']
        })
        
        for shot_type in shot_types:
            fg_pct = team[f'{shot_type}_FG%'] / 100
            ev = fg_pct * shot_types[shot_type]
            optimal_proportion = shot_evs[shot_type] / total_ev
            optimal_attempts = team['Total_FGA'] * optimal_proportion
            attempt_difference = optimal_attempts - team[f'{shot_type}_FGA']
            
            team_analysis.update({
                f'{shot_type}_Current_FG%': fg_pct,
                f'{shot_type}_EV': ev,
                f'{shot_type}_Current_Attempts': team[f'{shot_type}_FGA'],
                f'{shot_type}_Optimal_Attempts': optimal_attempts,
                f'{shot_type}_Attempt_Diff': attempt_difference
            })
        
        analysis_results.append(team_analysis)
    
    return pd.DataFrame(analysis_results)

@app.route('/test', methods=['GET'])
def test():
    print("\n=== Starting test route ===", flush=True)
    try:
        # Load CSVs from current directory
        df1 = pd.read_csv('nba_team_stats_shot_zones.csv')
        df2 = pd.read_csv('nba_team_stats.csv')
        df = pd.merge(df1, df2, on='Team', how='inner')
        teams = list(df['Team'].unique())
        
        return jsonify({
            "message": "API is working!",
            "available_teams": teams
        })
        
    except Exception as e:
        print("ERROR:", str(e), flush=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/team-data', methods=['GET'])
def serve_team_data():
    try:
        # Load CSVs from current directory
        df1 = pd.read_csv('nba_team_stats_shot_zones.csv')
        df2 = pd.read_csv('nba_team_stats.csv')
        df = pd.merge(df1, df2, on='Team', how='inner')
        
        analysis_df = analyze_shot_optimization(df)
        
        team_data = {}
        for team_name in df['Team'].unique():
            team_analysis = analysis_df[analysis_df['Team'] == team_name].iloc[0]
            
            team_data[team_name] = {
                "current": {
                    "ppg": float(team_analysis['current_ppg']),
                    "free_throws": {
                        "attempts": float(team_analysis['ft_attempts']),
                        "percentage": float(team_analysis['ft_percentage']),
                        "points": float(team_analysis['ft_points'])
                    }
                },
                "optimal": {
                    "ppg": float(team_analysis['optimal_ppg'])
                },
                "impact": {
                    "points_difference": float(team_analysis['optimal_ppg'] - team_analysis['current_ppg'])
                }
            }
            
            for shot_type in shot_types:
                team_data[team_name]["current"][shot_type] = {
                    "attempts": float(team_analysis[f'{shot_type}_Current_Attempts']),
                    "percentage": float(team_analysis[f'{shot_type}_Current_FG%']),
                    "ev": float(team_analysis[f'{shot_type}_EV'])
                }
                
                team_data[team_name]["optimal"][shot_type] = {
                    "attempts": float(team_analysis[f'{shot_type}_Optimal_Attempts'])
                }
                
                team_data[team_name]["impact"][shot_type] = {
                    "attempt_difference": float(team_analysis[f'{shot_type}_Attempt_Diff'])
                }
        
        return jsonify(team_data)
        
    except Exception as e:
        print("ERROR:", str(e), flush=True)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("\n=== Starting Flask Server ===", flush=True)
    print("Try accessing: http://127.0.0.1:5000/test", flush=True)
    sys.stdout.flush()
    app.run(debug=True, port=5000) 