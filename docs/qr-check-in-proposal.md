# QR Check-in Proposal

**Status: proposal only.** No scanner, QR code, attendance state, route, API, or database change is active. This proposal uses no real registrations or registration identifiers.

## Required Security Design

1. Add server-side staff authentication and authorization before exposing family lookup or check-in operations. The current browser-only password and `localStorage` flag are not an authorization boundary; the existing family endpoints also need protection before a check-in rollout.
2. Generate an opaque, cryptographically random token on the server. Do not encode a family ID, phone number, child age, or other participant data in the QR code. Store only a token hash, associate it with the registration and conference, and support expiration and revocation.
3. Keep scanning inside an authenticated staff interface. Submit the token in a TLS-protected request body rather than placing it in a URL, where it could be retained in browser history, access logs, or referrer data.
4. Record attendance server-side in a transaction with a unique constraint for the conference and family. A repeated scan should return a clear already-checked-in result without creating a second attendance record.
5. Record an audit event containing the staff actor and timestamp. Apply rate limits, minimize logs, restrict staff permissions, and define token rotation and retention procedures.

## Future Implementation Steps

1. Approve the staff identity provider, roles, and authorization model.
2. Review and approve a database migration for token hashes, expiry/revocation, attendance, and audit records. Do not run migrations until explicitly authorized.
3. Implement and test authenticated server endpoints with an isolated test database or mocks. Cover invalid, expired, revoked, replayed, and duplicate scans.
4. Build a staff-only scanner and check-in result view; test camera permission denial and manual token entry.
5. Run security review and staging verification before any production rollout.

Until those steps are authorized and complete, no QR check-in should be described as operational.