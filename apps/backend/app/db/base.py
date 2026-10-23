"""
SQLAlchemy declarative base. All ORM models (added in the database-implementation
phase) inherit from `Base` so Alembic's autogenerate can discover them via
`Base.metadata`.
"""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
