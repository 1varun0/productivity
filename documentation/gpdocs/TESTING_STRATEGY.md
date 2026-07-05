# Testing Strategy

While Peak Hub relies heavily on the Supabase backend, a robust frontend testing strategy ensures the UI behaves predictably, especially for complex features like the Timetable grid and the Focus timer state.

*(Note: The current iteration of the project is primarily focused on rapid prototyping, but the following structure outlines the intended testing implementation).*

## Test Types

### 1. Unit Tests (Logic and Stores)
**Tool**: Vitest + Testing Library.
**Scope**: Individual utility functions, date math, and Zustand store actions.
**Example**: Testing the `useWeeklyTimetableStore` to ensure adding a block correctly handles overlapping times.

```typescript
// Example Vitest snippet for a utility
import { expect, test } from 'vitest'
import { calculateDuration } from './dateUtils'

test('calculates duration correctly across hours', () => {
  expect(calculateDuration('14:00', '15:30')).toBe(90) // minutes
})
```

### 2. Component Tests
**Tool**: React Testing Library.
**Scope**: Ensuring UI components render correctly based on props and simulate user interactions (clicks, typing).
**Example**: Testing that the `CaptureModal` opens when the store state changes, and that submitting the form calls the Supabase insert function.

### 3. End-to-End (E2E) Tests
**Tool**: Playwright or Cypress.
**Scope**: Simulating real user flows against a staging environment (or a local Supabase instance populated with seed data).
**Critical Flows to Test**:
- Complete sign-up, login, and logout.
- Creating a workspace, generating an invite link, and a second user accepting the link.
- Starting a focus session, completing it, and verifying the `session_memories` entry is created.

## Database Testing (Supabase)
Testing Row Level Security (RLS) policies is critical. This is done using `pgTAP` (a suite of database functions that make it easy to write TAP-emitting unit tests in `psql` scripts) or via automated integration tests that authenticate as different users and attempt forbidden actions.

**Goal**: Prove that User A cannot read or modify User B's tasks.

## Continuous Testing
Tests should run automatically on every Pull Request via GitHub Actions.
1. The CI pipeline runs `npm run lint`.
2. The CI pipeline runs `npm run test` (Vitest unit tests).
3. (Future) The CI pipeline runs Playwright against the Vercel Preview Deployment URL.
