from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from utils.model_manager import model_manager

router = APIRouter()

class LinkPredictRequest(BaseModel):
    source: int
    target: int

class LinkSimulationRequest(BaseModel):
    neighbor_ids: List[int]
    target: int

@router.post("/predict")
async def predict_links(request: LinkPredictRequest):
    """Predict link probability between two existing nodes"""
    result = model_manager.predict_link(request.source, request.target)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

@router.post("/simulate")
async def simulate_link(request: LinkSimulationRequest):
    """Simulate link probability for a hypothetical new node"""
    result = model_manager.simulate_link(request.neighbor_ids, request.target)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result
