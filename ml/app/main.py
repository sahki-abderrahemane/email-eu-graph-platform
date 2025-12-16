from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import predict, embeddings, link_prediction, community, analysis

app = FastAPI(
    title="Email-EU ML Service",
    description="Machine Learning microservice for graph analytics",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # API Gateway
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(predict.router, prefix="/predict", tags=["predictions"])
app.include_router(embeddings.router, prefix="/embeddings", tags=["embeddings"])
app.include_router(link_prediction.router, prefix="/links", tags=["link-prediction"])
app.include_router(community.router, prefix="/community", tags=["community"])
app.include_router(analysis.router, prefix="/analysis", tags=["analysis"])

@app.get("/")
async def root():
    return {
        "service": "Email-EU ML Service",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    return {"status": "ok", "service": "ml-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)