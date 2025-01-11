from nba_api.stats.endpoints import leaguedashteamstats, leaguedashteamshotlocations
import pandas as pd

def fetch_all_nba_stats():
    try:
        # Fetch regular team stats
        print("Fetching regular team stats...")
        team_stats = leaguedashteamstats.LeagueDashTeamStats(
            season='2024-25',
            season_type_all_star='Regular Season',
            per_mode_detailed='PerGame'
        )
        df_stats = team_stats.get_data_frames()[0]
        
        # Fetch shot location stats
        print("Fetching shot location stats...")
        shot_stats = leaguedashteamshotlocations.LeagueDashTeamShotLocations(
            season='2024-25',
            season_type_all_star='Regular Season',
            per_mode_detailed='PerGame'
        )
        df_shots = shot_stats.get_data_frames()[0]
        
        # Save both to CSVs
        df_stats.to_csv('api_nba_team_stats.csv', index=False)
        df_shots.to_csv('api_nba_team_stats_shot_zones.csv', index=False)
        
        print("Successfully updated all NBA stats!")
        return df_stats, df_shots
        
    except Exception as e:
        print(f"Error fetching NBA stats: {str(e)}")
        return None, None

if __name__ == "__main__":
    fetch_all_nba_stats() 