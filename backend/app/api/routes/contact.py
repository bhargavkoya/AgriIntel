"""Contact/leads form endpoint."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.deps import get_contact_repository
from app.repositories.contact_repository import ContactRepository
from app.schemas import ContactRequest, ContactResponse

router = APIRouter(tags=["contact"])


@router.post("/contact", response_model=ContactResponse)
async def submit_contact_message(
    request: ContactRequest,
    repository: ContactRepository = Depends(get_contact_repository),
) -> ContactResponse:
    message_id = await repository.create(
        name=request.name, email=request.email, role=request.role, message=request.message
    )
    return ContactResponse(id=message_id)
