# contracts

Single source of truth for domain models and API DTOs using Zod.

- **Domain**: persisted shapes (User, Briefing, ArticleCache, AuditLog)
- **DTOs**: request/response schemas for each endpoint group
- **Errors**: shared error payload
- **Config**: environment validation

### Usage

- API: validate requests at route boundaries, validate responses before sending.
- Web/Mobile: import types inferred from Zod for strong typing.

> Topics/industries/demographic are open-ended strings.
