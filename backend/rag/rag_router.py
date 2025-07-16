# rag/rag_router.py

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Union, List, Dict, Any
from .query_agent import rag_query
from auth.auth_dependency import get_current_user

router = APIRouter(prefix="/rag", tags=["RAG Agent"])

class QueryRequest(BaseModel):
    question: str
    user_id: Optional[int] = None

class QueryResponse(BaseModel):
    question: str
    sql_query: str
    result: Union[str, List[Dict[str, Any]]]  # Can be string or list of dicts
    visualization: dict
    query_type: str
    table_data: Optional[List[Dict[str, Any]]] = None
    summary: Optional[str] = None
    error: Optional[str] = None
    mode: Optional[str] = None

@router.post("/query", response_model=QueryResponse)
async def process_query(
    request: QueryRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Process a natural language query about wealth management data
    """
    try:
        if not request.question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        # Process the query using the RAG agent
        response = rag_query(request.question)
        
        return QueryResponse(
            question=response["question"],
            sql_query=response.get("sql_query", ""),
            result=response.get("result", ""),
            visualization=response.get("visualization", {"type": "text", "content": ""}),
            query_type=response.get("query_type", "generic"),
            table_data=response.get("table_data"),
            summary=response.get("summary"),
            error=response.get("error"),
            mode=response.get("mode")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@router.get("/health")
async def rag_health_check():
    """
    Health check endpoint for the RAG agent
    """
    return {
        "status": "healthy",
        "service": "RAG Agent",
        "database": "connected"
    }

@router.get("/sample-queries")
async def get_sample_queries():
    """
    Get sample queries for testing
    """
    return {
        "sample_queries": [
            "Show me the top 3 clients by total portfolio value",
            "What is the asset allocation for Nikesh Sahoo's portfolio?",
            "Who holds the most Tesla stock?",
            "Show me all clients and their portfolio values",
            "What are the total investments by asset type?",
            "Which clients have aggressive risk appetite?",
            "Show me the portfolio breakdown for John Smith",
            "What is the total market value of all portfolios?",
            "Which assets have the highest market value?",
            "Show me clients with portfolio values above $1 million"
        ]
    } 