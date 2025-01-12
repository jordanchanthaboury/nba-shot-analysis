from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
import sys

app = Flask(__name__)
CORS(app)

# Define shot types and their point values
shot_types = {
    'RA': 2,    # Restricted Area (2 points)
    'NRA': 2,   # Non-Restricted Area / In The Paint (Non-RA) (2 points) 
    'MR': 2,    # Mid-Range (2 points)
    'LC3': 3,   # Left Corner 3 (3 points)
    'RC3': 3,   # Right Corner 3 (3 points)
    'AB3': 3    # Above Break 3 (3 points)
}

def calculate_win_impact(current_pts, optimal_pts, current_wins, games_played, plus_minus):
    """
    Calculates the projected impact on wins based on scoring changes.
    
    Parameters:
    current_pts (float): Current points per game
    optimal_pts (float): Projected optimal points per game
    current_wins (int): Current number of wins
    games_played (int): Number of games played
    plus_minus (float): Current point differential per game
    
    Returns:
    dict: Dictionary containing win impact analysis
    """
    # Calculate how the scoring change would affect point differential
    pts_difference = optimal_pts - current_pts
    new_plus_minus = plus_minus + pts_difference
    
    # Calculate win probability based on new point differential
    # Using the Pythagorean expectation formula adapted for basketball
    # Typically uses 16.5 as the exponent for NBA games
    PYTH_EXP = 16.5
    
    # Calculate current win percentage
    current_win_pct = current_wins / games_played
    
    # Calculate new expected win percentage
    if new_plus_minus >= 0:
        new_win_pct = 1 / (1 + (1 / (new_plus_minus + 10)) ** PYTH_EXP)
    else:
        new_win_pct = 1 / (1 + (-new_plus_minus + 10) ** PYTH_EXP)
    
    # Project wins over the same number of games
    projected_wins = round(new_win_pct * games_played, 1)
    win_difference = projected_wins - current_wins
    
    return {
        "current_wins": current_wins,
        "current_win_pct": current_win_pct * 100,
        "projected_wins": projected_wins,
        "projected_win_pct": new_win_pct * 100,
        "win_difference": win_difference,
        "current_plus_minus": plus_minus,
        "projected_plus_minus": new_plus_minus
    }

def transform_shot_location_data(df_shots):
    """
    Transforms the NBA API shot location data into our analysis format.
    
    Parameters:
    df_shots (DataFrame): Raw shot location data from NBA API
    
    Returns:
    DataFrame: Transformed data with standardized column names
    """
    transformed_data = []
    
    for _, row in df_shots.iterrows():
        team_data = {'Team': row['TEAM_NAME']}
        
        # Map API zones to our internal format
        zone_mapping = {
            'Restricted Area': 'RA',
            'In The Paint (Non-RA)': 'NRA',
            'Mid-Range': 'MR',
            'Left Corner 3': 'LC3',
            'Right Corner 3': 'RC3',
            'Above the Break 3': 'AB3'
        }
        
        # Transform each zone's data
        for api_zone, internal_zone in zone_mapping.items():
            fgm = row[f'{api_zone} FGM']
            fga = row[f'{api_zone} FGA']
            fg_pct = row[f'{api_zone} FG_PCT'] * 100  # Convert decimal to percentage
            
            team_data.update({
                f'{internal_zone}_FGM': fgm,
                f'{internal_zone}_FGA': fga,
                f'{internal_zone}_FG%': fg_pct
            })
        
        transformed_data.append(team_data)
    
    return pd.DataFrame(transformed_data)

def merge_team_data(df_shots, df_stats):
    """
    Merges shot location data with team stats and calculates per game averages.
    
    Parameters:
    df_shots (DataFrame): Transformed shot location data
    df_stats (DataFrame): Team stats data from NBA API
    
    Returns:
    DataFrame: Merged data with all necessary statistics
    """
    # Create a mapping of relevant team stats
    team_stats = df_stats[['TEAM_NAME', 'FTM', 'FTA', 'FT_PCT', 'PTS', 'GP', 'W', 'L', 'PLUS_MINUS']].copy()
    team_stats.columns = ['Team', 'FT_FGM', 'FT_FGA', 'FT_PCT', 'PTS', 'GP', 'W', 'L', 'PLUS_MINUS']
    
    # Convert FT_PCT to percentage format to match our other percentages
    team_stats['FT_PCT'] = team_stats['FT_PCT'] * 100
    
    # Merge shot location data with team stats
    merged_df = df_shots.merge(team_stats, on='Team', how='inner')
    
    return merged_df

def analyze_shot_optimization(df):
    """
    Analyzes shot selection optimization including free throws and win impact.
    """
    # Previous EV and optimization calculations remain the same...
    # Calculate EV for each shot type
    for shot_type, points in shot_types.items():
        df[f'EV_{shot_type}'] = (df[f'{shot_type}_FG%'] / 100) * points
    
    # Calculate free throw EV
    df['EV_FT'] = (df['FT_PCT'] / 100) * 1  # 1 point per free throw
    
    # Calculate total field goal attempts
    df['Total_FGA'] = sum(df[f'{shot_type}_FGA'] for shot_type in shot_types)
    
    analysis_results = []
    
    for _, team in df.iterrows():
        team_analysis = {'Team': team['Team']}
        
        # Calculate current points from field goals and free throws
        current_fg_points = 0
        for shot_type, points in shot_types.items():
            current_attempts = team[f'{shot_type}_FGA']
            current_fg_pct = team[f'{shot_type}_FG%'] / 100
            current_makes = current_attempts * current_fg_pct
            current_points = current_makes * points
            current_fg_points += current_points
        
        current_ft_points = team['FT_FGM'] * 1
        current_total_points = current_fg_points + current_ft_points
        
        # Calculate optimal distribution (keeping free throws constant)
        shot_evs = {shot_type: team[f'{shot_type}_FG%'] / 100 * points 
                   for shot_type, points in shot_types.items()}
        total_ev = sum(shot_evs.values())
        
        optimal_fg_points = 0
        for shot_type, points in shot_types.items():
            fg_pct = team[f'{shot_type}_FG%'] / 100
            ev = fg_pct * points
            
            # Current statistics
            current_attempts = team[f'{shot_type}_FGA']
            current_makes = current_attempts * fg_pct
            
            # Optimal statistics
            optimal_proportion = shot_evs[shot_type] / total_ev
            optimal_attempts = team['Total_FGA'] * optimal_proportion
            optimal_makes = optimal_attempts * fg_pct
            optimal_points = optimal_makes * points
            optimal_fg_points += optimal_points
            
            attempt_difference = optimal_attempts - current_attempts
            makes_difference = optimal_makes - current_makes
            
            team_analysis.update({
                f'{shot_type}_Current_FG%': fg_pct,
                f'{shot_type}_EV': ev,
                f'{shot_type}_Current_Attempts': current_attempts,
                f'{shot_type}_Current_Makes': current_makes,
                f'{shot_type}_Optimal_Attempts': optimal_attempts,
                f'{shot_type}_Optimal_Makes': optimal_makes,
                f'{shot_type}_Attempt_Diff': attempt_difference,
                f'{shot_type}_Makes_Diff': makes_difference
            })
        
        optimal_total_points = optimal_fg_points + current_ft_points
        
        # Calculate win impact
        win_impact = calculate_win_impact(
            current_total_points,
            optimal_total_points,
            team['W'],
            team['GP'],
            team['PLUS_MINUS']
        )
        
        team_analysis.update({
            'current_ppg': current_total_points,
            'optimal_ppg': optimal_total_points,
            'ft_points': current_ft_points,
            'ft_attempts': team['FT_FGA'],
            'ft_percentage': team['FT_PCT'],
            **win_impact  # Add all win impact metrics
        })
        
        analysis_results.append(team_analysis)
    
    return pd.DataFrame(analysis_results)

@app.route('/api/team-data', methods=['GET'])
def serve_team_data():
    try:
        # Load and process API data
        df_shots = pd.read_csv('api_nba_team_stats_shot_zones.csv')
        df_stats = pd.read_csv('api_nba_team_stats.csv')
        
        # Transform and merge data
        transformed_shots = transform_shot_location_data(df_shots)
        merged_data = merge_team_data(transformed_shots, df_stats)
        
        # Perform analysis
        analysis_df = analyze_shot_optimization(merged_data)
        
        # Format response
        team_data = {}
        for team_name in merged_data['Team'].unique():
            team_analysis = analysis_df[analysis_df['Team'] == team_name].iloc[0]
            
            team_data[team_name] = {
                "current": {
                    "ppg": float(team_analysis['current_ppg']),
                    "wins": float(team_analysis['current_wins']),
                    "win_percentage": float(team_analysis['current_win_pct']),
                    "plus_minus": float(team_analysis['current_plus_minus']),
                    "free_throws": {
                        "attempts": float(team_analysis['ft_attempts']),
                        "percentage": float(team_analysis['ft_percentage']),
                        "points": float(team_analysis['ft_points'])
                    }
                },
                "optimal": {
                    "ppg": float(team_analysis['optimal_ppg']),
                    "projected_wins": float(team_analysis['projected_wins']),
                    "projected_win_percentage": float(team_analysis['projected_win_pct']),
                    "projected_plus_minus": float(team_analysis['projected_plus_minus'])
                },
                "impact": {
                    "points_difference": float(team_analysis['optimal_ppg'] - team_analysis['current_ppg']),
                    "wins_difference": float(team_analysis['win_difference']),
                    "plus_minus_difference": float(team_analysis['projected_plus_minus'] - team_analysis['current_plus_minus'])
                }
            }
            
            for shot_type in shot_types:
                team_data[team_name]["current"][shot_type] = {
                    "attempts": float(team_analysis[f'{shot_type}_Current_Attempts']),
                    "makes": float(team_analysis[f'{shot_type}_Current_Makes']),
                    "percentage": float(team_analysis[f'{shot_type}_Current_FG%']),
                    "ev": float(team_analysis[f'{shot_type}_EV'])
                }
                
                team_data[team_name]["optimal"][shot_type] = {
                    "attempts": float(team_analysis[f'{shot_type}_Optimal_Attempts']),
                    "makes": float(team_analysis[f'{shot_type}_Optimal_Makes'])
                }
                
                team_data[team_name]["impact"][shot_type] = {
                    "attempt_difference": float(team_analysis[f'{shot_type}_Attempt_Diff']),
                    "makes_difference": float(team_analysis[f'{shot_type}_Makes_Diff'])
                }
        
        return jsonify(team_data)
        
    except Exception as e:
        print("ERROR:", str(e), flush=True)
        return jsonify({"error": str(e)}), 500

# Rest of the code (test route and main) remains the same...

if __name__ == '__main__':
    print("\n=== Starting Flask Server ===", flush=True)
    print("Try accessing: http://127.0.0.1:5000/test", flush=True)
    sys.stdout.flush()
    app.run(debug=True, port=5000)