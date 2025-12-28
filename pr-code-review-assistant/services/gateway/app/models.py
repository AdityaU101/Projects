from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Job(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    pr_url: str
    status: str = "pending"
    result: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
