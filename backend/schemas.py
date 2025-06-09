from pydantic import BaseModel
from typing import Optional
from datetime import date

class ApplicationIn(BaseModel):
    company: str
    position: str
    job_link: Optional[str] = None
    status: Optional[str] = "Applied"
    applied_date: Optional[date] = None
    notes: Optional[str] = None

class Application(ApplicationIn):
    id: int
