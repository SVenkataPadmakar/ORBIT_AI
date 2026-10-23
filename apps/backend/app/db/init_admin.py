import asyncio
from sqlalchemy import select
from app.db.session import session_scope
from app.models.user import User
from app.core.security import hash_password

async def main() -> None:
    async with session_scope() as session:
        result = await session.execute(select(User).where(User.role == "admin"))
        admin = result.scalar_one_or_none()
        if admin is not None:
            admin.email = "admin@orbit.dev"
            admin.full_name = "Orbit System Administrator"
            admin.hashed_password = hash_password("AdminSecurePassword2026!")
            admin.is_active = True
            await session.commit()
            print(f"Single Admin normalized: email={admin.email}, full_name={admin.full_name}, active={admin.is_active}")
        else:
            new_admin = User(
                email="admin@orbit.dev",
                full_name="Orbit System Administrator",
                hashed_password=hash_password("AdminSecurePassword2026!"),
                role="admin",
                is_active=True,
                email_verified=True,
                auth_provider="email",
            )
            session.add(new_admin)
            await session.commit()
            print(f"Single Admin created: email={new_admin.email}, full_name={new_admin.full_name}")

if __name__ == "__main__":
    asyncio.run(main())
