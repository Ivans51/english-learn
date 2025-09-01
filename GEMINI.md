# Project Guidelines for Gemini

## General Project Context

This is an e-commerce web application project. The frontend is built with React and TypeScript, and the backend is built with Node.js and Express.

## Rules for Version Control with Git

When generating or suggesting anything related to `git`, strictly follow these rules.

### 1. Commit Message Format

All commit messages must follow the **Conventional Commits** specification. The structure is as follows:

`<type>[optional scope]: <description>`

**Allowed types:**

*   **feat**: For a new feature.
*   **fix**: For a bug fix.
*   **docs**: Changes that only affect documentation.
*   **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc.).
*   **refactor**: A code change that neither fixes a bug nor adds a feature.
*   **test**: Adding missing tests or correcting existing tests.
*   **chore**: Changes to the build process or auxiliary tools.

**Examples of good commit messages:**

*   `feat(auth): implement Google sign-in`
*   `fix(api): correct pagination error in product list`
*   `docs(readme): update installation instructions`

### 2. Branch Naming Convention

All new branches must follow this format:

`<type>/<short-description>`

Where `<type>` can be:

*   `feature`
*   `fix`
*   `hotfix`
*   `release`

**Examples of good branch names:**

*   `feature/new-payment-gateway`
*   `fix/user-login-error`

### 3. Pull Request (PR) Process

*   Each Pull Request must be linked to an existing issue.
*   The PR description must explain what problem is being solved and how the solution was tested.

---
