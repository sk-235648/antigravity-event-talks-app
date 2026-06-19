# 🌐 BigQuery Release Pulse

An elegant, modern cyber-dark dashboard built with **Python Flask** and **Vanilla HTML, CSS, and JavaScript**. This application automatically fetches and parses the official Google Cloud BigQuery Release Notes RSS/Atom feed, categorizes the updates dynamically, and offers a premium sharing flow to Twitter/X.

---

## ✨ Features

- **🔄 Real-Time Sync**: Fetch the latest release notes from Google Cloud with a single click. A clean spinner animation indicates active fetching.
- **🏷️ Automated Categorization**: Automatically groups updates into five color-coded types:
  - 🚀 **Feature**: New updates, previews, or announcements.
  - ⚙️ **Change**: Updates to existing behavior or system features.
  - 🛠️ **Fix**: Bug resolutions and fixed issues.
  - ⚠️ **Deprecation**: Deprecated features or upcoming removals.
  - 📢 **General**: Uncategorized logs or informational entries.
- **📊 Interactive Metrics**: Dashboard statistics cards act as filter shortcuts. Click on "Features" or "Fixes" to instantly filter the list.
- **🔍 Full-Text Search**: Live, case-insensitive keyword search across both release note titles and descriptions.
- **🐦 Built-in Tweet Share Modal**: Select any specific release note to compose a prefilled draft. Features a live 280-character limit counter (handling URLs as exactly 23 characters matching Twitter's API criteria) before opening the X sharing intent.
- **⏳ Loading Skeletons**: Displays pulsing loading templates while querying the backend.

---

## 🛠️ Technology Stack

- **Backend**: Python 3.13+, Flask, Requests, Feedparser
- **Frontend**: HTML5, Vanilla CSS3 (Custom variables, dark theme layout, CSS animation), Vanilla JS (ES6)
- **Icons**: FontAwesome 6 (CDN)
- **Typography**: Outfit & Inter (Google Fonts)

---

## 📁 Directory Structure

```text
├── static/
│   ├── css/
│   │   └── styles.css       # Custom premium dark theme stylesheets
│   └── js/
│       └── app.js           # Client-side UI manager & state flow
├── templates/
│   └── index.html           # Main dashboard template
├── .gitignore               # Configured version control exclusions
├── app.py                   # Flask server, feed fetcher, and parser
├── requirements.txt         # Project dependencies
└── README.md                # Project documentation (this file)
```

---

## 🚀 How to Run Locally

### 1. Prerequisite
Ensure you have Python 3.13+ installed.

### 2. Set Up Virtual Environment
Initialize and activate a virtual environment in the project directory:

**Windows (PowerShell)**:
```powershell
python -m venv .venv
.venv\Scripts\activate
```

**macOS/Linux**:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Start the Application
```bash
python app.py
```

Open your browser and navigate to **`http://127.0.0.1:5000`** to access the dashboard.

---

## 🐦 Tweeting Updates

1. Select any update and click the **Tweet Update** button.
2. A premium tweet preview composer modal will open.
3. Edit the text as desired (character count is calculated dynamically).
4. Click **Post to X** to securely publish the update via your browser.
