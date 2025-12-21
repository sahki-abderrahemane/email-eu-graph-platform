from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from utils.model_manager import model_manager

router = APIRouter()

class CommunityRequest(BaseModel):
    method: Optional[str] = "louvain"

@router.post("/detect")
async def detect_communities(request: CommunityRequest):
    """Detect communities in the graph using specified algorithm"""
    result = model_manager.detect_communities(request.method)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
        
    return {
        **result,
        "message": f"Community detection computed on live graph using {result['method']}"
    }
