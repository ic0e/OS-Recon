from unittest.mock import AsyncMock, patch

import pytest

from engines.git_engine import (
    analyze_github_target,
)

@pytest.mark.asyncio
async def test_valid_github_username_scan():
    result = await analyze_github_target("ic0e")

    assert result["profile_url"] == "https://github.com/ic0e"
    assert result["metrics"]["total"] > 0

@pytest.mark.asyncio
async def test_invalid_github_username_scan():
    result = await analyze_github_target("WRONG USERNAME FORMAT @@@")

    assert result["error"]
