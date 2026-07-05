# Documentation Templates

Use these templates to ensure consistency across the project's documentation.

## 1. README Template
```markdown
# [Project Name]
[Brief one-sentence description]

## Highlights / Features
- Feature 1
- Feature 2

## Quickstart
\`\`\`bash
git clone ...
npm install
npm run dev
\`\`\`

## Documentation
See the \`gpdocs/\` folder for architecture, API specs, and database models.
```

## 2. CHANGELOG Template (Keep a Changelog format)
```markdown
# Changelog

## [Unreleased]
### Added
- New Focus Chamber celestial animation options.
### Fixed
- RLS policy bug on public note sharing.

## [1.2.0] - 2026-06-15
### Added
- Collaborative workspace chat.
```

## 3. Pull Request Template (`.github/PULL_REQUEST_TEMPLATE.md`)
```markdown
## Overview
Briefly describe what this PR does.

## Related Issues
Fixes #123

## Testing Done
- [ ] Unit tests added/updated.
- [ ] Tested locally against a clean Supabase instance.
- [ ] Verified RLS policies correctly reject unauthorized access.

## Screenshots (if UI change)
[Insert image]
```

## 4. Architecture Decision Record (ADR) Template
```markdown
# ADR [Number]: [Title]

**Date**: [YYYY-MM-DD]
**Status**: [Proposed / Accepted / Rejected]

## Context
What is the problem we are trying to solve?

## Decision
What is the proposed solution? Why did we choose this over alternatives?

## Consequences
What becomes easier or harder because of this change?
```
