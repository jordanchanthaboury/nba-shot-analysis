import pandas as pd
import os

def test_files():
    # Get current directory
    current_dir = os.getcwd()
    print(f"Current directory: {current_dir}")
    
    # List all files in directory
    print("\nFiles in directory:")
    for file in os.listdir(current_dir):
        print(f"- {file}")
    
    # Try to read CSV files
    try:
        df1 = pd.read_csv('nba_team_stats_shot_zones.csv')
        print("\nSuccessfully read shot zones CSV!")
        print(f"Number of teams: {len(df1)}")
        print("\nColumns:")
        print(df1.columns.tolist())
    except Exception as e:
        print(f"\nError reading shot zones CSV: {str(e)}")
    
    try:
        df2 = pd.read_csv('nba_team_stats.csv')
        print("\nSuccessfully read team stats CSV!")
        print(f"Number of teams: {len(df2)}")
        print("\nColumns:")
        print(df2.columns.tolist())
    except Exception as e:
        print(f"\nError reading team stats CSV: {str(e)}")

if __name__ == "__main__":
    test_files()