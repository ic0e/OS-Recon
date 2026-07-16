# OS-RECON • [![Python](https://img.shields.io/badge/Python-3.14-3776ab?style=flat-square&logo=python&logoColor=white)](https://www.python.org/) [![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
A local reconnaissance dashboard for digital footprint analysis. Unlike standard username checkers, OS-Recon combines passive social scanning with active deep-profile extraction - spawning isolated stealth browser instances using nodriver to bypass anti scraping walls and pull raw metadata that static scanners can't reach.

[![Python](https://img.shields.io/badge/Python-3.14-3776ab?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![nodriver](https://img.shields.io/badge/nodriver-Stealth_Automation-4285f4?style=flat-square&logo=googlechrome&logoColor=white)](https://github.com/ultrafunkamsterdam/nodriver)
[![HTTPX](https://img.shields.io/badge/HTTPX-Async_HTTP-1f425f?style=flat-square&logo=target&logoColor=white)](https://www.python-httpx.org/)
[![curl-cffi](https://img.shields.io/badge/curl--cffi-Impersonate_TLS-064a6b?style=flat-square&logo=curl&logoColor=white)](https://github.com/lexiforest/curl_cffi)

Built around three engines: a fast async social scanner, a stealth browser orchestration layer (`nodriver`), and a GitHub intelligence module that audits repositories, parses commit history, and extracts developer metadata automatically.

Results are split into prioritized risks and general logs - designed with structured data output in mind for downstream analysis.

> !! Early MVP: expect bugs and unfinished modules.

## DEMO

### Scan & Select
Input one or more usernames and OS-Recon's async scanner probes dozens of platforms concurrently. Found profiles are flagged and queued - ready for deep extraction. If a platform blocks you, it's flagged as blocked for the user to manually check.

<img width="800" height="383" alt="scan" src="https://github.com/user-attachments/assets/acff4b80-9fc4-47be-8a75-0201f6e0efa5" />

---

### Deep Pry
Select your targets and launch the nodriver drones. Isolated stealth Chrome instances bypass anti-scraping walls and pull raw metadata, bios, outbound links, and platform-specific variables that static scanners can't reach. Collects the data for more advanced Analytics.

<img width="800" height="384" alt="deep pry" src="https://github.com/user-attachments/assets/ff11eb78-d9f9-4ee9-b7bb-d91552211612" />

---

### Analytics
All harvested data is put through analytics. You can get basic statistics and if set up, an AI summary that gets the key points from the data.

<img width="800" height="384" alt="analytics" src="https://github.com/user-attachments/assets/d77ef5b2-7f7e-4b8a-9f87-13e20a379412" />

---

## FEATURES ATM
- **DeepPry UI:**
Track target accounts in a clean dashboard. Includes auto fallback protocols to load media across different domains without CORS blocking.
- **Stealth Browser:**
Uses nodriver to spin up concurrent, isolated headless Chrome instances to not get blocked by cloudflare or other firewalls.
- **Profile Scraping:**
Pulls bios, links, and dynamic page variables from targets.
- **FastAPI Backend:**
Async backend using httpx and curl_cffi to grab registry metrics concurrently.
- **Analytics Tab (OPTIONAL API):** 
Toggle between raw data and AI analysis. Keeps tab state so you don't lose your place when switching views.
- **LLM Threat Analysis:**
Sends raw scraped dumps to Groq (`llama-3.1-8b-instant`) to strip out the important info from the messy data gathered.
- **GitHub Scanner:**
Hits the GitHub API to scan repos, extract metadata, and dig up hidden emails from commit histories.

## ROADMAP
Check out [issues](https://github.com/ic0e/OS-Recon/issues), the future features are mapped there.

## Current Project Structure
```
OS-RECON/
├── backend/                    # The backend server folder, handles scraping & processing.
│   ├── engines/                # Scrapers and parsers depending on input type.
│   │   ├── payloads/           # Javascript payloads used for the pry_engine.
│   │   │   └── payload_store.py
│   │   ├── git_engine.py       # GitHub repository analysis & commit fetching.
│   │   ├── pry_engine.py       # Stealth browser automation engine via nodriver.
│   │   └── social_engine.py    # Asynchronous username check registry & probe logic.
│   └── main.py                 # FastAPI application server.
└── frontend/                   # React TS + Vite frontend UI.
```

## How to Run
> **Disclaimer: This tool is developed strictly for educational, security auditing, and authorized open-source intelligence research. The developer assumes no liability for misuse or violations of third-party terms of service.**

**⚠️⚠️ NEVER RUN IN A PUBLIC NETWORK YOU DON'T TRUST. THIS TOOL IS FOR LOCAL USE ONLY. ⚠️⚠️**

**Requirements (links below in prerequisites section):**
- Python 3.10+ (preferably 3.14, or the newest availalable version)
- All libraries in `requirements.txt`
- Node.js 18+.
- Chrome (for the stealth browser module)

### Getting Started

**Non developers who want to try this out:** OS-Recon runs locally and requires a few tools to set up.
There's no hosted or deployed version yet, this is early development. You'll need to run it
through a terminal or an IDE like VS Code. Follow the steps below carefully and
it should work out of the box.

**Prerequisites:**
- [Python - newest version](https://www.python.org/downloads/)
- [Node.js](https://nodejs.org/)
- [Google Chrome](https://www.google.com/chrome/) (required for the stealth browser module)
- [Git](https://git-scm.com/downloads/) (to clone the repo)

**Clone the repo:**
```bash
git clone https://github.com/ic0e/OS-Recon.git
cd OS-Recon
```

Then follow the Backend and Frontend steps below.

### AI Analysis Setup (Optional)
The AI summary tab requires a Groq API token. If you choose not to use the AI analysis engine, the application will function fully without it. 
If you want a fast way to summarize the data and get basic conclusions/connections, it's recommended to get an API token.

1. Head to the Groq Console.
2. Generate a new API key under the API Keys management dashboard.
3. Create a .env file in the root directory and append your key:

```env
GROQ_API_KEY=gsk_your_token_here
```

*To start the project you need to run the Backend and the Frontend through the root folder.*

### Setup & Package installation
```bash
cd backend
pip install -r requirements.txt
# or if you have uv: uv sync
cd ..
npm install
```

### Startup
```bash
npm start
```

### Manual startup (separate terminals, recommended for development when changing stuff)

**Backend**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:8000`.

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to help.

## License
This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
