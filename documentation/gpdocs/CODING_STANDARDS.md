# Coding Standards and Processes

Consistent coding standards prevent style drift, reduce cognitive load, and make the codebase easier to navigate. Peak Hub relies on automated tooling and strict processes to maintain quality.

## Coding Standards
- **TypeScript**: Strict mode is enabled. Explicitly type all component props and function return values where inference is not obvious. Avoid `any` at all costs; use `unknown` if a type is truly uncertain.
- **Styling**: All styling is handled via Tailwind CSS v4. Do not use inline `style={{...}}` attributes unless dynamically calculating a value that cannot be represented by a utility class (e.g., dynamic `transform` offsets in the Timetable).
- **File Naming**:
  - React Components: `PascalCase.tsx` (e.g., `SettingsModal.tsx`).
  - Hooks: `camelCase.ts` (e.g., `useStore.ts`).
  - Utility Functions/Types: `camelCase.ts` (e.g., `dateUtils.ts`, `types.ts`).
- **State Management**: Use local `useState` for ephemeral UI state (dropdowns, toggles). Use Zustand for state that crosses component boundaries or needs to be persisted to localStorage (e.g., Focus Timer).

## Formatting and Linting
- **ESLint**: The project uses the flat config (`eslint.config.js`). It enforces React hooks rules, TypeScript strictness, and prevents common errors.
- Run linting before pushing: `npm run lint`.

## Branching Strategy
We use a simplified GitHub Flow model (trunk-based development):
- `main` is the primary branch. It is always deployable.
- Create feature branches off `main`: 
  - Format: `feature/<short-description>` (e.g., `feature/workspace-chat`).
  - Format: `bugfix/<short-description>` (e.g., `bugfix/timetable-drag-drop`).
- Never push directly to `main`.

## Pull Request (PR) Workflow
1. Commit your changes locally. Use descriptive commit messages (e.g., "fix: resolve RLS policy bug on habit entries").
2. Push your branch to the remote repository.
3. Open a Pull Request against `main`.
4. Ensure the PR title clearly describes the change.

## Code Review Checklist
Reviewers should check for the following before approving:
- **Functionality**: Does the code solve the problem or implement the feature correctly?
- **Security**: Are there any new Supabase queries? If so, is RLS preventing unauthorized access? (e.g., missing `user_id` checks).
- **Performance**: Are React hooks (`useEffect`, `useMemo`) missing dependency array variables? Is the component rendering excessively?
- **Styling**: Are hardcoded colors used instead of the `@theme` variables?
- **Documentation**: Are complex business logic functions documented?
