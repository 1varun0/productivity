# Contributing Guidelines

Thank you for your interest in contributing to Peak Hub! We welcome issues and pull requests.

## Code of Conduct
By participating in this project, you are expected to uphold our Code of Conduct. Please be respectful, constructive, and inclusive in all interactions.

## How to Contribute

### 1. Reporting Bugs
- Ensure the bug was not already reported by searching the issue tracker.
- Use the **Bug Report** issue template (`.github/ISSUE_TEMPLATE/bug_report.md`).
- Provide clear steps to reproduce, expected behavior, and actual behavior.

### 2. Suggesting Enhancements
- Use the **Feature Request** issue template.
- Explain *why* the enhancement is necessary and how it fits into the "celestial/distraction-free" product vision.

### 3. Submitting Pull Requests
1. Fork the repository and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. Ensure the test suite passes (`npm run test`).
4. Ensure your code passes the linter (`npm run lint`).
5. Update documentation if necessary (specifically files in `gpdocs/`).
6. Open a PR using the Pull Request template.

## Documentation Maintenance
- Documentation is treated as code (docs-as-code). 
- All PRs that introduce new features, database tables, or environment variables **must** include corresponding updates to the `gpdocs/` directory.
- The documentation is reviewed periodically at the end of every sprint cycle.

## Roadmap
- [ ] Migrate component testing from React Testing Library to Playwright Component Tests.
- [ ] Establish a public API documentation site using Docusaurus (generated from these Markdown files).
