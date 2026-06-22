import logging
from typing import Any

from cachetools import TTLCache

logger = logging.getLogger(__name__)

SOCIAL_TTL = 600
REPOS_TTL = 1800
COMMITS_TTL = 3600

social_cache: TTLCache = TTLCache(maxsize=256, ttl=SOCIAL_TTL)
github_repos_cache: TTLCache = TTLCache(maxsize=128, ttl=REPOS_TTL)
github_commits_cache: TTLCache = TTLCache(maxsize=256, ttl=COMMITS_TTL)


def make_social_key(username: str, include_variations: bool) -> tuple:
    return ("social", username, include_variations)


def make_github_repos_key(target_input: str) -> tuple:
    return ("repos", target_input)


def make_github_commits_key(username: str, repo_name: str) -> tuple:
    return ("commits", username, repo_name)


async def cache_result(cache: TTLCache, key: tuple, func, *args, **kwargs) -> Any:
    if key in cache:
        logger.info("Cache HIT for %s", key)
        return cache[key]

    result = await func(*args, **kwargs)

    if isinstance(result, dict) and "error" in result:
        logger.info("Cache MISS for %s (not caching — error response)", key)
        return result

    cache[key] = result
    logger.info("Cache MISS for %s", key)
    return result


def clear_all_caches() -> None:
    social_cache.clear()
    github_repos_cache.clear()
    github_commits_cache.clear()
