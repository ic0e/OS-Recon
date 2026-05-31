from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# import the analysis function from your local git_engine file
from engines.git_engine import analyze_github_target, fetch_repo_commits
from engines.social_engine import scan_username

app = FastAPI()

# allow the React app to connect without CORS errors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    target: str

class CommitRequest(BaseModel):
    target: str
    username: str


def _is_github_input(text: str) -> bool:
    """Check if the input is specifically targeting GitHub (URL or github-specific format)."""
    return "github.com" in text


@app.post("/api/scan")
async def handle_scan(request: ScanRequest):
    input_data = request.target.strip()

    if not input_data:
        raise HTTPException(status_code=400, detail="Target cannot be empty.")
    
    if _is_github_input(input_data):
        # Direct GitHub URL -> git engine only
        git_data = await analyze_github_target(input_data)
        social_result = await scan_username(git_data["username"])
        
        if "error" in git_data:
            raise HTTPException(status_code=400, detail=git_data["error"])
            
        return {
            "status": "completed",
            "engine": "social",
            "data": social_result,
            "git_data": git_data
        }
    
    else:
        # Plain username -> social media scan
        social_result = await scan_username(input_data)
        
        if "error" in social_result:
            raise HTTPException(status_code=400, detail=social_result["error"])
        
        # If GitHub was found in social results, automatically run git engine too
        git_data = None
        if social_result.get("github_username"):
            git_result = await analyze_github_target(social_result["github_username"])
            if "error" not in git_result:
                git_data = git_result
        
        return {
            "status": "completed",
            "engine": "social",
            "data": social_result,
            "git_data": git_data,
        }
    

@app.post("/api/scanCommits")
async def handle_scan_commits(request: CommitRequest):
    repo_name = request.target.strip()
    username = request.username.strip()
    
    if not repo_name or not username:
        raise HTTPException(status_code=400, detail="Repository name and username are required.")
    
    # Call our new async network fetcher
    result = await fetch_repo_commits(username, repo_name)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
        
    return {
        "status": "completed",
        "data": result["commits"]
    }