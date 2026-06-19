import os
import requests
import feedparser
from flask import Flask, jsonify, render_template

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

def get_category(title, content):
    """Categorize the update based on keywords in title or content."""
    text = f"{title} {content}".lower()
    
    # Check for deprecations/removals
    if any(k in text for k in ["deprecat", "remove", "obsolet", "retire"]):
        return "deprecation"
    # Check for features/new things
    elif any(k in text for k in ["feature", "new ", "introduc", "announc", "support for", "preview"]):
        return "feature"
    # Check for fixes
    elif any(k in text for k in ["fix", "resolv", "bug ", "issu"]):
        return "fix"
    # Check for changes or updates
    elif any(k in text for k in ["chang", "updat", "modif", "improv", "enhanc", "behav"]):
        return "change"
    
    return "general"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/release-notes")
def get_release_notes():
    try:
        # Fetch the RSS feed with a timeout and user-agent
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        response = requests.get(FEED_URL, headers=headers, timeout=15)
        response.raise_for_status()
        
        # Parse XML with feedparser
        feed = feedparser.parse(response.content)
        
        notes = []
        for entry in feed.entries:
            # Extract HTML/text content
            content_value = ""
            if "content" in entry and len(entry.content) > 0:
                content_value = entry.content[0].value
            elif "summary" in entry:
                content_value = entry.summary
                
            published_str = entry.get("updated", entry.get("published", ""))
            title = entry.get("title", "No Title")
            link = entry.get("link", "")
            
            # Simple category detection
            category = get_category(title, content_value)
            
            notes.append({
                "id": entry.get("id", link),
                "title": title,
                "link": link,
                "published": published_str,
                "content": content_value,
                "category": category
            })
            
        return jsonify({
            "status": "success",
            "title": feed.feed.get("title", "BigQuery Release Notes"),
            "subtitle": feed.feed.get("subtitle", "Recent updates and release notes for Google Cloud BigQuery"),
            "last_updated": feed.feed.get("updated", ""),
            "notes": notes
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
