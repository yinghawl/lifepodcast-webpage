# ---- YOUTUBE STATS (CHANNEL + EPISODE) ----
youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

# Channel‑level statistics
yt_channel_resp = youtube.channels().list(
    part="statistics,contentDetails",
    id=CHANNEL_ID
).execute()

yt_stats = yt_channel_resp['items'][0]['statistics']
print("YouTube channel stats:", yt_stats)

# -------------------------------------------------
# Episode‑level stats: iterate over videos in the
# channel’s Uploads playlist and collect metrics.
# -------------------------------------------------
uploads_playlist_id = yt_channel_resp['items'][0]['contentDetails']\
    ['relatedPlaylists']['uploads']

videos_meta = []
next_page = None
MAX_VIDEOS = 100  # adjust if you need more

while True:
    playlist_resp = youtube.playlistItems().list(
        part="contentDetails",
        playlistId=uploads_playlist_id,
        maxResults=50,
        pageToken=next_page
    ).execute()

    video_ids = [item['contentDetails']['videoId']
                 for item in playlist_resp['items']]

    # Get stats for this batch of videos
    vids_resp = youtube.videos().list(
        part="snippet,statistics",
        id=",".join(video_ids)
    ).execute()

    for vid in vids_resp['items']:
        stats = vid['statistics']
        snippet = vid['snippet']
        videos_meta.append({
            "video_id": vid['id'],
            "title": snippet['title'],
            "published_at": snippet['publishedAt'],
            "view_count": int(stats.get('viewCount', 0)),
            "like_count": int(stats.get('likeCount', 0)),
            "comment_count": int(stats.get('commentCount', 0))
        })

    next_page = playlist_resp.get('nextPageToken')
    if (not next_page) or (len(videos_meta) >= MAX_VIDEOS):
        break

# Convert to DataFrame for easy analysis / export
yt_episodes_df = pd.DataFrame(videos_meta)
print("First few episode stats:")
print(yt_episodes_df.head())

# Optional: persist episode‑level stats
yt_episodes_df.to_csv("yt_episode_stats.csv", index=False)
