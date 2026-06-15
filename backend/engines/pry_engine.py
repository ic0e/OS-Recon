import asyncio
import json
import re
from typing import List, Optional

import nodriver as uc
from engines.payloads.payload_store import MINER_SCRIPT
from pydantic import BaseModel

CONCURRENCY_SEMAPHORE = asyncio.Semaphore(2)


class TargetProfile(BaseModel):
    url: str
    site: str
    username: str
    category: str


class PryMetrics(BaseModel):
    display_name: str
    avatar_url: Optional[str] = ""
    bio: Optional[str] = ""
    external_links: List[str] = []
    platform_specific: dict = {}


class PryResult(BaseModel):
    url: str
    site: str
    username: str
    status: str
    metrics: Optional[PryMetrics] = None
    error: Optional[str] = None


async def _execute_stealth_browser(profile: TargetProfile) -> PryResult:
    browser = None
    try:
        # Launch Chromium with anti-fingerprinting / stealth arguments
        browser = await uc.start(
            headless=True,
            browser_args=[
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--window-size=1920,1080",
                "--lang=en-US,en",
            ],
        )
    except Exception as e:
        return PryResult(
            url=profile.url,
            site=profile.site,
            username=profile.username,
            status="Failed",
            error=f"Failed to initialize browser context: {repr(e)}",
        )

    try:
        page = await browser.get(profile.url)
        await page.wait_for("body", timeout=12)
        # Give heavy client-side SPAs time to hydrate state objects
        await page.sleep(3)

        # YouTube Cookie Consent Bypass
        if "youtube.com" in profile.url:
            await page.evaluate("""
                (() => {
                    let elements = Array.from(document.querySelectorAll('button, [role="button"], input[type="submit"], ytd-button-renderer'));
                    let match = elements.find(el => {
                        let text = (el.textContent || el.value || el.getAttribute('aria-label') || '').toLowerCase();
                        return text.includes('accept all') || text.includes('i agree');
                    });
                    if (match) match.click();
                })()
            """)
            await page.sleep(
                2
            )  # Give the page a moment to reload/settle after clicking

        # Inject platform-targeted data mining routines
        raw_payload = await page.evaluate(MINER_SCRIPT)

        # Parse transmission payload safely
        payload = {}
        if isinstance(raw_payload, str):
            payload = json.loads(raw_payload)
        elif isinstance(raw_payload, dict):
            payload = raw_payload

        if not payload:
            raise Exception(
                "Stealth engine failed to map target footprint layers safely."
            )

        # Instantiate formatted Pydantic telemetry models
        metrics = PryMetrics(
            display_name=payload.get("display_name") or profile.username,
            avatar_url=payload.get("avatar_url") or "",
            bio=payload.get("bio") or "",
            external_links=payload.get("external_links") or [],
            platform_specific=payload.get("platform_specific") or {},
        )

        # Polish branding strings out of display outputs
        name = metrics.display_name
        for trim_target in [
            " • Instagram",
            " - YouTube",
            " | Pinterest",
            " - Profile",
            " photos and videos",
            " on Pinterest",
            " - Wikipedia",
        ]:
            if trim_target in name:
                name = name.split(trim_target)[0].strip()
        if "增" in name or "(@" in name:
            name = re.split(r" \(@| 增", name)[0].strip()
        metrics.display_name = name

        # Deep regex extraction block if data ended up falling back to standard description fields
        if metrics.bio and not metrics.platform_specific:
            bio_str = metrics.bio
            f_match = re.search(r"([\d,.\wKMB]+)\s*Followers", bio_str, re.IGNORECASE)
            f_ing_match = re.search(
                r"([\d,.\wKMB]+)\s*Following", bio_str, re.IGNORECASE
            )
            p_match = re.search(
                r"([\d,.\wKMB]+)\s*(?:Posts|Videos)", bio_str, re.IGNORECASE
            )

            if f_match:
                metrics.platform_specific["followers"] = f_match.group(1).strip()
            if f_ing_match:
                metrics.platform_specific["following"] = f_ing_match.group(1).strip()
            if p_match:
                metrics.platform_specific["posts"] = p_match.group(1).strip()

        # Clean structural system lines out of profiles
        if metrics.bio:
            if "See Instagram photos and videos" in metrics.bio:
                metrics.bio = (
                    metrics.bio.split("-")[-1]
                    .replace("See Instagram photos and videos from our profiles", "")
                    .strip()
                )
            elif "Watch the latest video" in metrics.bio:
                metrics.bio = metrics.bio.split("|")[-1].strip()

        return PryResult(
            url=profile.url,
            site=profile.site,
            username=profile.username,
            status="Verified",
            metrics=metrics,
        )

    except Exception as e:
        return PryResult(
            url=profile.url,
            site=profile.site,
            username=profile.username,
            status="Error",
            error=f"Error extracting target metrics: {str(e)}",
        )

    finally:
        if browser:
            try:
                browser.stop()
                print(
                    f"[+] Core execution environment successfully terminated for: {profile.url}"
                )
            except Exception:
                pass


async def scrape_isolated_session(profile: TargetProfile) -> PryResult:
    async with CONCURRENCY_SEMAPHORE:
        print(
            f"[*] Dispatching core platform-aware execution threads for: {profile.url}"
        )
        return await _execute_stealth_browser(profile)
