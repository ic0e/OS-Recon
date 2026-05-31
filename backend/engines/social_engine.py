import httpx
import asyncio
import re

# ──────────────────────────────────────────────────────────
# SITE REGISTRY
# Each entry mirrors Sherlock's data.json format.
# errorType controls how we decide "user exists":
#   - "status_code" → 200 = found, 404/other = not found
#   - "message"     → page loads (200) but body contains errorMsg = not found
# ──────────────────────────────────────────────────────────

SITES = {
    "GitHub": {
        "url": "https://github.com/{}",
        "errorType": "status_code",
        "category": "development",
    },
    "GitLab": {
        "url": "https://gitlab.com/{}",
        "errorType": "status_code",
        "category": "development",
    },
    "Bitbucket": {
        "url": "https://bitbucket.org/{}/",
        "errorType": "status_code",
        "category": "development",
    },
    "Reddit": {
        "url": "https://www.reddit.com/user/{}/about.json",
        "errorType": "reddit_json",
        "category": "social",
    },
    "X (Twitter)": {
        "url": "https://nitter.privacydev.net/{}",
        "errorType": "message",
        "errorMsg": "User \"",
        "category": "social",
    },
    "Instagram": {
        "url": "https://www.instagram.com/{}/",
        "errorType": "status_code",
        "category": "social",
    },
    "YouTube": {
        "url": "https://www.youtube.com/@{}",
        "errorType": "status_code",
        "category": "media",
    },
    "TikTok": {
        "url": "https://www.tiktok.com/@{}",
        "errorType": "status_code",
        "category": "social",
    },
    "Pinterest": {
        "url": "https://www.pinterest.com/{}/",
        "errorType": "status_code",
        "category": "social",
    },
    "Twitch": {
        "url": "https://www.twitch.tv/{}",
        "errorType": "status_code",
        "category": "gaming",
    },
    "Steam": {
        "url": "https://steamcommunity.com/id/{}",
        "errorType": "message",
        "errorMsg": "The specified profile could not be found.",
        "category": "gaming",
    },
    "Spotify": {
        "url": "https://open.spotify.com/user/{}",
        "errorType": "status_code",
        "category": "media",
    },
    "SoundCloud": {
        "url": "https://soundcloud.com/{}",
        "errorType": "status_code",
        "category": "media",
    },
    "Medium": {
        "url": "https://medium.com/@{}",
        "errorType": "status_code",
        "category": "blogging",
    },
    "Dev.to": {
        "url": "https://dev.to/{}",
        "errorType": "status_code",
        "category": "development",
    },
    "Hashnode": {
        "url": "https://hashnode.com/@{}",
        "errorType": "status_code",
        "category": "development",
    },
    "LinkedIn": {
        "url": "https://www.linkedin.com/in/{}/",
        "errorType": "status_code",
        "category": "professional",
    },
    "Mastodon (mastodon.social)": {
        "url": "https://mastodon.social/@{}",
        "errorType": "status_code",
        "category": "social",
    },
    "Keybase": {
        "url": "https://keybase.io/{}",
        "errorType": "status_code",
        "category": "security",
    },
    "HackerOne": {
        "url": "https://hackerone.com/{}",
        "errorType": "status_code",
        "category": "security",
    },
    "Patreon": {
        "url": "https://www.patreon.com/{}",
        "errorType": "status_code",
        "category": "media",
    },
    "Behance": {
        "url": "https://www.behance.net/{}",
        "errorType": "status_code",
        "category": "design",
    },
    "Dribbble": {
        "url": "https://dribbble.com/{}",
        "errorType": "status_code",
        "category": "design",
    },
    "Gravatar": {
        "url": "https://en.gravatar.com/{}",
        "errorType": "status_code",
        "category": "social",
    },
    "Flickr": {
        "url": "https://www.flickr.com/people/{}",
        "errorType": "status_code",
        "category": "media",
    },
    "Vimeo": {
        "url": "https://vimeo.com/{}",
        "errorType": "status_code",
        "category": "media",
    },
    "About.me": {
        "url": "https://about.me/{}",
        "errorType": "status_code",
        "category": "social",
    },
    "Codecademy": {
        "url": "https://www.codecademy.com/profiles/{}",
        "errorType": "status_code",
        "category": "development",
    },
    "Replit": {
        "url": "https://replit.com/@{}",
        "errorType": "status_code",
        "category": "development",
    },
    "HackerRank": {
        "url": "https://www.hackerrank.com/{}",
        "errorType": "status_code",
        "category": "development",
    },
    "LeetCode": {
        "url": "https://leetcode.com/{}",
        "errorType": "status_code",
        "category": "development",
    },
    "npm": {
        "url": "https://www.npmjs.com/~{}",
        "errorType": "status_code",
        "category": "development",
    },
    "PyPI": {
        "url": "https://pypi.org/user/{}",
        "errorType": "status_code",
        "category": "development",
    },
    "Docker Hub": {
        "url": "https://hub.docker.com/u/{}",
        "errorType": "status_code",
        "category": "development",
    },
    "Stack Overflow": {
        "url": "https://stackoverflow.com/users/?tab=accounts&SearchFor={}",
        "errorType": "message",
        "errorMsg": "No users matched your",
        "category": "development",
    },
    "Roblox": {
        "url": "https://www.roblox.com/user.aspx?username={}",
        "errorType": "status_code",
        "category": "gaming",
    },
    "Minecraft (NameMC)": {
        "url": "https://namemc.com/profile/{}",
        "errorType": "status_code",
        "category": "gaming",
    },
    "Chess.com": {
        "url": "https://www.chess.com/member/{}",
        "errorType": "status_code",
        "category": "gaming",
    },
    "Lichess": {
        "url": "https://lichess.org/@/{}",
        "errorType": "status_code",
        "category": "gaming",
    },
    "Fiverr": {
        "url": "https://www.fiverr.com/{}",
        "errorType": "status_code",
        "category": "professional",
    },
    "Kaggle": {
        "url": "https://www.kaggle.com/{}",
        "errorType": "status_code",
        "category": "development",
    },
    "Trello": {
        "url": "https://trello.com/{}",
        "errorType": "status_code",
        "category": "professional",
    },
    "Telegram": {
        "url": "https://t.me/{}",
        "errorType": "message",
        "errorMsg": "If you have <strong>Telegram</strong>, you can contact",
        "invertMatch": True,
        "category": "social",
    },
    "Wattpad": {
        "url": "https://www.wattpad.com/user/{}",
        "errorType": "status_code",
        "category": "blogging",
    },
    "Tumblr": {
        "url": "https://{}.tumblr.com/",
        "errorType": "status_code",
        "category": "blogging",
    },
    "WordPress": {
        "url": "https://{}.wordpress.com/",
        "errorType": "status_code",
        "category": "blogging",
    },
    "Wikipedia": {
        "url": "https://en.wikipedia.org/wiki/Special:CentralAuth/{}?uselang=qqx",
        "errorType": "message",
        "errorMsg": "centralauth-admin-nonexistent:",
        "category": "social",
    },
    "Imgur": {
        "url": "https://imgur.com/user/{}",
        "errorType": "status_code",
        "category": "media",
    },
    "Unsplash": {
        "url": "https://unsplash.com/@{}",
        "errorType": "status_code",
        "category": "media",
    },
}


# ──────────────────────────────────────────────────────────
# CORE CHECK LOGIC
# ──────────────────────────────────────────────────────────

async def _check_site(
    client: httpx.AsyncClient,
    site_name: str,
    site_cfg: dict,
    username: str,
    semaphore: asyncio.Semaphore,
) -> dict | None:
    """
    Probe a single site for the username.
    Returns a result dict if the user exists, else None.
    """
    url = site_cfg["url"].format(username)
    error_type = site_cfg["errorType"]

    async with semaphore:
        try:
            resp = await client.get(url, timeout=12, follow_redirects=True)

            exists = False

            if error_type == "status_code":
                exists = resp.status_code == 200

            elif error_type == "message":
                body = resp.text
                error_msg = site_cfg.get("errorMsg", "")
                invert = site_cfg.get("invertMatch", False)
                if invert:
                    # For sites like Telegram: if the message IS present, user exists
                    exists = error_msg in body
                else:
                    # Normal: if error message is absent, user exists
                    exists = resp.status_code == 200 and error_msg not in body

            elif error_type == "reddit_json":
                # Reddit returns JSON with "error" key if user doesn't exist
                if resp.status_code == 200:
                    try:
                        data = resp.json()
                        # Reddit returns {"kind": "t2", "data": {...}} for real users
                        exists = data.get("kind") == "t2"
                    except Exception:
                        exists = False
                else:
                    exists = False

            if exists:
                return {
                    "site": site_name,
                    "url": site_cfg["url"].format(username).replace("/about.json", ""),
                    "category": site_cfg.get("category", "other"),
                    "status": resp.status_code,
                }

        except (httpx.TimeoutException, httpx.ConnectError, httpx.ReadError, Exception):
            # Site unreachable or blocked — skip silently
            pass

    return None


async def scan_username(username: str) -> dict:
    """
    Scan a username across all registered sites.
    Returns structured results grouped by category.
    """
    # Basic input sanitization
    username = username.strip().lstrip("@")
    if not username or not re.match(r"^[a-zA-Z0-9._-]{1,40}$", username):
        return {"error": "Invalid username format. Use only letters, numbers, dots, dashes, or underscores."}

    results: list[dict] = []

    # Throttle concurrency so we don't get rate-limited everywhere
    semaphore = asyncio.Semaphore(15)

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                       "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/json,*/*",
        "Accept-Language": "en-US,en;q=0.9",
    }

    async with httpx.AsyncClient(headers=headers) as client:
        tasks = [
            _check_site(client, name, cfg, username, semaphore)
            for name, cfg in SITES.items()
        ]
        raw_results = await asyncio.gather(*tasks)

    results = [r for r in raw_results if r is not None]

    # Group by category
    categories: dict[str, list[dict]] = {}
    for r in results:
        cat = r["category"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(r)

    # Check if GitHub was found — extract username for potential deep scan
    github_username = None
    for r in results:
        if r["site"] == "GitHub":
            github_username = username
            break

    return {
        "username": username,
        "total_found": len(results),
        "total_checked": len(SITES),
        "results": results,
        "categories": categories,
        "github_username": github_username,
    }
