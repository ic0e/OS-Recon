# OS-RECON

A local reconnaissance dashboard for digital footprint analysis. Unlike standard username checkers, OS-Recon combines passive social scanning with active deep-profile extraction - spawning isolated stealth browser instances using `nodriver` to bypass anti-scraping walls and pull raw metadata that static scanners can't reach.

Built around three engines: a fast async social scanner, a stealth browser orchestration layer (nodriver), and a GitHub intelligence module that audits repositories, parses commit history, and extracts developer metadata automatically.

Results are split into prioritized risks and general logs - designed with structured data output in mind for downstream analysis.

> !! Early MVP: expect bugs and unfinished modules.

## FEATURES ATM: (readme last updated on June 2 2026)
- **DeepPry Launchpad UI:** An interactive profile view, tracking target accounts with automatic cross origin media fallback protocols for forbidden resource handling.
- **Stealth Browser Orchestration:** Advanced deep-reconnaissance module (`nodriver`) that spawns concurrent, isolated headless Chrome instances to bypass anti-scraping walls.
- **Deep Profile Telemetry Extraction:** Captures un-vetted metadata blocks including biography extracts, cross-referenced outbound links, and dynamic platform specific variables (followers, post counts, bios, etc.).
- **FastAPI server backend:** Runs asynchronous tasks, used for fetching with httpx & curl_cffi. Collects data on a username(s).
- **More filters for false positives:** lets a user know when the scanner was blocked from a website, allowing human verification to see if a profile exists.
- **Automatic github deep scan:** Automated intelligence that uses GitHub's API to extract repository risks, parse metadata metrics, and audit commit history.

## TODO:
- Fix bugs related to the nodriver deep pry scanner.
- Improve on the scanner to yield less false positives.
- Implement data & AI analysis

## FUTURE FEATURES TASKLIST:
- LLM integration (analysis engine, NOT a chatbot): fully prompt engineered module that analyzes deep scan data and returns structured output rendered directly in the UI - bio pattern analysis, cross-platform connection mapping, risk flagging, etc.
- Analytics depth: analyze and find connections between data, names, etc.
- Deep source code scanner looking for secrets inside files.
- Port to electron for easier running.

## Current Project Layout
```
OS-RECON/
├── backend/                    # The backend server folder, handles scraping & processing.
│   ├── engines/                # Scrapers and parsers depending on input type.
│   │   ├── payloads/           # Javascript payloads used for the pry_engine.
│   │   │   └── payload_store.py # The base JS payload used to collect data from the selected websites.
│   │   ├── git_engine.py       # GitHub repository analysis & commit fetching.
│   │   ├── pry_engine.py       # Stealth browser automation engine via nodriver.
│   │   └── social_engine.py    # Asynchronous username check registry & probe logic.
│   └── main.py                 # FastAPI application server.
└── frontend/                   # React TS + Vite frontend UI.
```

## How to Run

Requires Python 3.10+ and Node.js 18+. Chrome must be installed for the stealth browser module.

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:8000`.
