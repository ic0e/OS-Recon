from unittest.mock import AsyncMock, patch

import pytest

from engines.social_engine import (
    _check_site,
    generate_username_variations,
    scan_username,
    split_camel_case,
)

def test_generate_username_variations():
    variations = generate_username_variations("john")
    assert "john" in variations
    assert "john1" in variations
    
    variations = generate_username_variations("john_doe")
    assert "johndoe" in variations

@pytest.mark.asyncio
async def test_scan_username_invalid_format():
    result = await scan_username("invalid username!", include_variations=False)
    assert "error" in result
    assert result["error"] == "Invalid username format."

@pytest.mark.asyncio
async def test_check_site_found_via_status_code():
    mock_client = AsyncMock()
    mock_response = AsyncMock()

    mock_response.status_code = 200
    mock_response.text = "Some profile page"
    mock_client.get.return_value = mock_response

    site_cfg = {
        "url": "https://github.com/{}",
        "errorType": "status_code",
        "category": "development",
    }

    semaphore = AsyncMock()
    result = await _check_site(mock_client, "GitHub", site_cfg, "testuser", semaphore)
    
    assert result is not None
    assert result["status"] == "Found"
    assert result["url"] == "https://github.com/testuser"
