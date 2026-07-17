"""Contact message repository."""

from sqlalchemy.orm import Session, sessionmaker

from app.database.session import get_session_factory
from app.models.contact_message import ContactMessage


class ContactRepository:
    """CRUD operations for contact/lead form submissions."""

    def __init__(self, session_factory: sessionmaker[Session] | None = None) -> None:
        self._session_factory = session_factory or get_session_factory()

    async def create(self, name: str, email: str, role: str, message: str) -> int:
        """Persist a contact message and return its id."""
        with self._session_factory() as session:
            record = ContactMessage(name=name, email=email, role=role, message=message)
            session.add(record)
            session.commit()
            session.refresh(record)
            return record.id
