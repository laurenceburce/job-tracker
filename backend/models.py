from sqlalchemy import Table, Column, Integer, String, Date, Text
from database import metadata

applications = Table(
    "applications",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("company", String, nullable=False),
    Column("position", String, nullable=False),
    Column("job_link", String),
    Column("status", String),
    Column("applied_date", Date),
    Column("notes", Text),
)
