from fastapi import APIRouter, HTTPException
from utils.model_manager import model_manager

router = APIRouter()

@router.get("/metrics")
async def get_metrics():
    """Get live graph analysis metrics computed from data/email-Eu-core.csv"""
    result = model_manager.get_graph_metrics()
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
        
    return {
        **result,
        "departments": 42,
        "message": "Graph metrics powered by NetworkX and live edge data"
    }
