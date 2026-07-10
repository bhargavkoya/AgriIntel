ARCHITECTURAL CONSTRAINTS

These constraints must never be violated.

1. Notebooks are immutable research artifacts.
2. Backend is inference only.
3. Backend never imports notebook cells directly.
4. Backend loads exported artifacts only.
5. All preprocessing used during inference must be identical to training.
6. Business logic belongs only in service classes.
7. API routes must be thin controllers.
8. All AI models must be loaded once at application startup.
9. Every API must use request and response schemas.
10. Every module must be independently testable.
11. Frontend must never contain AI logic.
12. The project should be deployable with Docker in the future.
13. Every major architectural decision must be documented before implementation.
