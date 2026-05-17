# Release Notes

## Phase 8 Verification

- Server unit tests passed.
- Client test suite passed after fixing the `LeadRow` ref typing mismatch.
- Client production build completed successfully.
- Local staging stack deployed with Docker Compose and smoke-tested successfully.
- Frontend root responded with `200 OK` at `http://localhost:3000/`.
- Backend health endpoint responded with `{"status":"ok"}` at `http://localhost:5000/api/v1/health`.

## Notes

- `server/.env` was updated for the local Docker Compose staging run so the backend could connect to the bundled MongoDB container.
- Security audit surfaced existing dependency advisories in the client toolchain; they are documented separately and should be handled as a follow-up upgrade task.