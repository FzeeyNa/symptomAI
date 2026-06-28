# Contributing to SymptomAI

Thank you for considering contributing to SymptomAI. Every contribution helps make health information more accessible.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue using the [Bug Report](https://github.com/FzeeyNa/symptomAI/issues/new?template=bug_report.md) template. Include as much detail as possible:

- Steps to reproduce the issue.
- Expected behavior vs. actual behavior.
- Screenshots or logs, if applicable.
- Your environment (OS, Node.js version, Python version).

### Suggesting Features

Have an idea for a new feature? Open an issue using the [Feature Request](https://github.com/FzeeyNa/symptomAI/issues/new?template=feature_request.md) template. Describe the problem you are trying to solve and your proposed solution.

### Submitting Code

1. **Fork the repository** and create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes.** Follow the coding conventions described below.

3. **Test your changes** to ensure nothing is broken:
   - For backend changes, verify the API starts without errors.
   - For frontend changes, test on at least one platform (Android or Expo Go).

4. **Commit your changes** with a clear and descriptive commit message:
   ```bash
   git commit -m "feat: add medication reminder notification"
   ```

   We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `refactor:` for code restructuring
   - `test:` for adding or updating tests
   - `chore:` for maintenance tasks

5. **Push your branch** and open a Pull Request against `main`:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Fill out the PR template** and wait for a review.

## Development Setup

Refer to the [Getting Started](README.md#getting-started) section in the README for environment setup instructions.

## Coding Conventions

### Python (Backend)
- Follow PEP 8 style guidelines.
- Use type hints for function signatures.
- Write docstrings for public functions and classes.

### TypeScript (Frontend)
- Use TypeScript strict mode.
- Define explicit types and interfaces in `src/types.ts`.
- Keep components focused and reusable.

## Code of Conduct

By participating in this project, you agree to maintain a welcoming and inclusive environment. Be respectful, constructive, and collaborative in all interactions.

## Questions?

If you have questions about contributing, feel free to open a [Discussion](https://github.com/FzeeyNa/symptomAI/discussions) or reach out by creating an issue.

Thank you for helping improve SymptomAI.
