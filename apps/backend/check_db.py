import asyncio
from app.db.session import AsyncSessionLocal
from sqlalchemy import text

async def main():
    async with AsyncSessionLocal() as session:
        res = await session.execute(text("SELECT id, name FROM projects LIMIT 5"))
        print("Existing projects:", res.fetchall())

if __name__ == "__main__":
    asyncio.run(main())
