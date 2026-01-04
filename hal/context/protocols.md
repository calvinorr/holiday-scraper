# Development Protocols

## Code Standards

### TypeScript
- Strict mode enabled
- No `any` types without justification
- Use Zod for runtime validation

### React
- Functional components only
- Server components by default
- `use client` only when necessary

### Imports
- Use `@/` path alias
- Group: react > next > external > internal

## Git Workflow

### Commit Messages
Format: `type: description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code change (no new feature)
- `chore`: Maintenance
- `docs`: Documentation

### Branch Naming
- `feat/description`
- `fix/description`

## Testing

- Test scraper functions with sample HTML
- Mock external API calls
- Test database operations

## Security

- Never commit API keys
- Validate all user input
- Rate limit API routes
- Sanitize scraped HTML before display

## Performance

- Use ISR for deal pages
- Lazy load images
- Paginate large datasets
- Cache Gemini responses
