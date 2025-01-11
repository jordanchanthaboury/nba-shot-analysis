import schedule
import time
from create_stats_csv import fetch_nba_stats

def update_job():
    print("Updating NBA stats...")
    fetch_nba_stats()

# Schedule the update to run daily at midnight
schedule.every().day.at("00:00").do(update_job)

# Run once immediately when starting
update_job()

# Keep the script running
while True:
    schedule.run_pending()
    time.sleep(60)  # Check every minute 