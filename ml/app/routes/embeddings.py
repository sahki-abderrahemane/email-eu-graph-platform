from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from utils.model_manager import model_manager

router = APIRouter()

class EmbeddingRequest(BaseModel):
    dimensions: Optional[int] = 128
    walk_length: Optional[int] = 80
    num_walks: Optional[int] = 10

@router.post("/generate")
async def generate_embeddings(request: EmbeddingRequest):
    """Generate Node2Vec embeddings (NOT IMPLEMENTED - Use precomputed)"""
    return {
        "status": "info",
        "message": "Dynamic generation not supported yet. Using precomputed embeddings.",
        "dimensions": request.dimensions
    }

@router.get("/visualize")
async def visualize_embeddings(method: str = "pca"):
    """Get PCA visualization data from precomputed embeddings"""
    result = model_manager.get_embeddings_viz(method)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
        
    return {
        "status": "success",
        "message": f"Embeddings visualized using {method}",
        **result
    }
