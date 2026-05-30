from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# import the analysis function from your local git_engine file
from engines.git_engine import analyze_github_target

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

@app.post("/api/scan")
async def handle_scan(request: ScanRequest):
    input_data = request.target.strip()

    if not input_data:
        raise HTTPException(status_code=400, detail="Target cannot be empty.")
    
    if "github.com" in input_data or not input_data.startswith("http"):
        
        result = await analyze_github_target(input_data)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
            
        return {
            "status": "completed",
            "engine": "git",
            "data": result
        }
        
    else:
        return {
            "status": "completed",
            "engine": "social",
            "data": {
                "username": input_data,
                "profile_url": input_data,
                "metrics": {"total": 0, "interesting_count": 0, "standard_count": 0},
                "interesting": [],
                "standard": []
            }
        }