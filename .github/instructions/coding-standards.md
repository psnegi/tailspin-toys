---
description: 'Repository-wide coding standards, focusing on comments, documentation, and TypeScript formatting'
applyTo: '.github/instructions/**'
---

# Coding Standards (Comments, Documentation, TypeScript)

This consolidated guidance captures the comment and documentation expectations referenced by issue #8.

## Comment philosophy

- Comment intent, not mechanics. Explain *why* a piece of code exists, the reasoning behind non-obvious decisions, or the constraints that influenced the implementation. Remove comments that merely paraphrase the code.
- Treat stale or incorrect comments as bugs: update or remove them in the same change that edits the related code.

## Documentation expectations (TSDoc / JSDoc)

- Every exported function in `db/` and `src/lib/` MUST include a TSDoc/JSDoc block describing:
  - A one-line summary of purpose
  - Parameter descriptions (including the injectable `db` argument when present)
  - The return value (type and semantic meaning)
  - Any thrown errors or side effects
- Keep signatures explicit: exported functions should use explicit parameter and return types to make docs and type-checking precise.

Example:

```ts
/**
 * Fetches game details by id.
 * @param db - Injectable Database client (migrated test DB can be supplied in tests)
 * @param id - Game id
 * @returns The Game record or null if not found
 */
export async function getGameById(db: Database, id: number): Promise<Game | null> { ... }
```

## Component Props documentation

- Reusable `.astro` components MUST declare a `Props` interface in frontmatter and include a short TSDoc comment explaining the purpose of each prop and the component contract.
- Document optional/required semantics and whether props are rendered to the DOM (security consideration for raw HTML strings).

## TypeScript formatting & linting

- Follow the project's ESLint + Prettier configuration. Where TypeScript formatting is opinionated, express it as an ESLint rule so it is enforced automatically.
- Keep explicit parameter & return types on exported functions to satisfy `tsgo` (native TS 7) checks.
- Add ESLint rules for documentation where appropriate (e.g., require-jsdoc-style rules) only after verifying the `eslint` config and CI handle the change.

## Acceptance checklist (issue #8)

- [ ] `.github/instructions` files reference this consolidated coding-standards guidance and document the comment philosophy
- [ ] TSDoc/JSDoc expectations documented for exported functions in `db/` and `src/lib/`
- [ ] `.astro` component `Props` documentation expectations documented
- [ ] TypeScript formatting rules documented and enforcement notes for ESLint
- [ ] README links to or summarizes this coding standards document


If any of these items require project-level lint rule changes or CI updates, open a follow-up issue and include the rationale and implementation plan.