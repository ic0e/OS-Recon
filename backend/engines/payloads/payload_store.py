# move the payload in a separate file for better readability
MINER_SCRIPT = """
(() => {
    let url = window.location.href.toLowerCase();
    let docText = document.documentElement.innerHTML;
    
    let extracted = {
        display_name: "",
        avatar_url: "",
        bio: "",
        external_links: [],
        platform_specific: {}
    };

    let grabOutboundLinks = () => {
        let found = [];
        let host = window.location.hostname.replace('www.', '');
        document.querySelectorAll("a[href]").forEach(a => {
            let href = a.href;
            if (href && href.startsWith("http") && !href.includes(host)) {
                if (!href.includes("terms") && !href.includes("policies") && !href.includes("privacy") && !href.includes("github.blog") && !found.includes(href)) {
                    found.push(href);
                }
            }
        });
        return found.slice(0, 5);
    };

    if (url.includes("tiktok.com")) {
        try {
            let stateEl = document.querySelector("#__UNIVERSAL_DATA_FOR_WEB_TAG__") || document.querySelector("#SIGI_STATE");
            if (stateEl) {
                let rawJson = JSON.parse(stateEl.textContent);
                let userModule = rawJson.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo;
                if (userModule) {
                    extracted.display_name = userModule.user.nickname;
                    extracted.avatar_url = userModule.user.avatarLarger || userModule.user.avatarThumb;
                    extracted.bio = userModule.user.signature;
                    extracted.platform_specific = {
                        followers: userModule.stats.followerCount,
                        following: userModule.stats.followingCount,
                        likes: userModule.stats.heartCount,
                        videos: userModule.stats.videoCount,
                        verified: userModule.user.verified ? "Yes" : "No"
                    };
                    extracted.external_links = grabOutboundLinks();
                    return JSON.stringify(extracted);
                }
            }
        } catch(e) {}
    }

    if (url.includes("github.com")) {
        try {
            let nameEl = document.querySelector(".p-name");
            let bioEl = document.querySelector(".p-note");
            let avatarEl = document.querySelector(".avatar-user");
            
            extracted.display_name = nameEl ? nameEl.innerText.trim() : "";
            extracted.bio = bioEl ? bioEl.innerText.trim() : "";
            extracted.avatar_url = avatarEl ? avatarEl.src : "";
            
            let followersEl = document.querySelector("a[href*='tab=followers'] .Counter");
            let followingEl = document.querySelector("a[href*='tab=following'] .Counter");
            let reposEl = document.querySelector("span[data-org-item='repos_count'], .Counter[data-view-component='true']");
            
            extracted.platform_specific = {
                followers: followersEl ? followersEl.innerText.trim() : "0",
                following: followingEl ? followingEl.innerText.trim() : "0",
                repositories: reposEl ? reposEl.innerText.trim() : "0"
            };
            extracted.external_links = grabOutboundLinks();
            return JSON.stringify(extracted);
        } catch(e) {}
    }

    if (url.includes("reddit.com")) {
        try {
            let profileData = document.querySelector("shreddit-profile-info");
            if (profileData) {
                extracted.display_name = profileData.getAttribute("username") || "";
            }
            let metaImg = document.querySelector('meta[property="og:image"]');
            if (metaImg) extracted.avatar_url = metaImg.getAttribute("content");
            
            let bioEl = document.querySelector('div[data-testid="profile-bio"], #profile-bio-id');
            extracted.bio = bioEl ? bioEl.innerText.trim() : "";
            
            let karmaEl = document.querySelector("#profile-karma-id") || document.querySelector("[karma]");
            extracted.platform_specific = {
                karma: karmaEl ? karmaEl.innerText.trim() : "N/A",
            };
            return JSON.stringify(extracted);
        } catch(e) {}
    }

    try {
        let ldJsonEl = document.querySelector('script[type="application/ld+json"]');
        if (ldJsonEl) {
            let data = JSON.parse(ldJsonEl.textContent);
            let mainObj = Array.isArray(data) ? data[0] : data;
            if (mainObj && (mainObj.name || mainObj.alternativeName)) {
                extracted.display_name = mainObj.name || mainObj.alternativeName;
                extracted.avatar_url = mainObj.image || "";
                extracted.bio = mainObj.description || "";
                
                if (mainObj.interactionStatistic) {
                    let stats = Array.isArray(mainObj.interactionStatistic) ? mainObj.interactionStatistic : [mainObj.interactionStatistic];
                    stats.forEach(s => {
                        let type = s.interactionType?.toLowerCase() || "";
                        if (type.includes("userinteraction")) {
                            extracted.platform_specific["engagement_count"] = s.userInteractionCount;
                        }
                    });
                }
                if (extracted.display_name) {
                    extracted.external_links = grabOutboundLinks();
                    return JSON.stringify(extracted);
                }
            }
        }
    } catch(e) {}

    let ogTitle = document.querySelector('meta[property="og:title"]');
    let ogImg = document.querySelector('meta[property="og:image"]');
    let ogDesc = document.querySelector('meta[property="og:description"]');

    extracted.display_name = ogTitle ? ogTitle.getAttribute("content") : document.title;
    extracted.avatar_url = ogImg ? ogImg.getAttribute("content") : "";
    extracted.bio = ogDesc ? ogDesc.getAttribute("content") : "";
    extracted.external_links = grabOutboundLinks();

    return JSON.stringify(extracted);
})()
"""