from nba_api.stats.endpoints import leaguedashteamstats
import pandas as pd

def fetch_nba_stats():
    try:
        # Fetch team stats from NBA API
        team_stats = leaguedashteamstats.LeagueDashTeamStats(
            season='2023-24',
            season_type_all_star='Regular Season',
            per_mode_detailed='PerGame'
        )
        
        # Convert to DataFrame
        df = team_stats.get_data_frames()[0]
        
        # Save to CSV
        df.to_csv('nba_team_stats.csv', index=False)
        print("Successfully updated NBA stats!")
        return df
        
    except Exception as e:
        print(f"Error fetching NBA stats: {str(e)}")
        return None

if __name__ == "__main__":
    fetch_nba_stats() 