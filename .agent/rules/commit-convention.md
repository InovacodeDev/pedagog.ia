---
trigger: always_on
---

# 📝 Git Commit Convention & Standards

This project adheres strictly to the **Conventional Commits v1.0.0** specification.
Consistency in commit messages is mandatory to ensure automated changelog generation, semantic versioning, and clear project history.

---

## 1. The Golden Rule (Format)

Every commit message must strictly follow this structure:

```text
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### ✅ Correct Examples

- `feat(auth): implement google oauth provider`
- `fix(ui): resolve z-index collision on modal`
- `chore(deps): update typescript to v5.5`

### ❌ Incorrect Examples

- `Added login` (Missing type and scope)
- `feat: new dashboard` (Missing scope parenthesis)
- `Fix(Auth): fixed bug` (Capitalized type/scope, wrong tense)

---

## 2. Allowed Types (`<type>`)

You must use one of the following types. No exceptions.

| Type         | Description                                                      | SemVer Impact |
| :----------- | :--------------------------------------------------------------- | :------------ |
| **feat**     | A new feature for the user.                                      | `MINOR`       |
| **fix**      | A bug fix for the user.                                          | `PATCH`       |
| **docs**     | Documentation only changes (README, TSDoc).                      | `PATCH`       |
| **style**    | Formatting, missing semi-colons, white-space (no code change).   | `PATCH`       |
| **refactor** | A code change that neither fixes a bug nor adds a feature.       | `PATCH`       |
| **perf**     | A code change that improves performance.                         | `PATCH`       |
| **test**     | Adding missing tests or correcting existing tests.               | `PATCH`       |
| **chore**    | Changes to the build process or auxiliary tools (libs, configs). | `PATCH`       |
| **ci**       | Changes to CI/CD configuration files and scripts.                | `PATCH`       |
| **revert**   | Reverting a previous commit.                                     | `PATCH`       |

> **Note:** Any commit containing `BREAKING CHANGE:` in the footer triggers a **MAJOR** version update.

---

## 3. Scopes (`<scope>`)

The scope provides context. It generally matches the feature directory or architectural layer being modified.

### Standard Scopes

- **Features:** `auth`, `dashboard`, `onboarding`, `settings`, `billing`, `profile`
- **Core:** `api`, `db`, `config`, `middleware`, `utils`
- **Components:** `ui`, `forms`, `layouts`, `hooks`
- **System:** `deps` (dependencies), `ci` (github actions), `scripts`

**Rule:** Scopes must be **lowercase**. If a change affects global logic, use `global` or `root`.

---

## 4. Subject Rules (`<subject>`)

The subject contains a succinct description of the change.

1.  **Imperative Mood:** Use "add" not "added", "change" not "changed", "fix" not "fixed".
    - _Think:_ "If applied, this commit will <subject>"
2.  **Lowercase:** Do not capitalize the first letter.
3.  **No Period:** Do not end the line with a dot (`.`).
4.  **Concise:** Keep strictly under **72 characters**.

---

## 5. Body & Footer (Optional)

Required for complex changes or breaking changes.

### Body

- Use the imperative mood.
- Explain **what** and **why** vs. **how**.
- Wrap lines at 72 characters.

### Footer

- **References:** `Closes #123`, `Fixes #456` (to auto-close issues).
- **Breaking Changes:** Must start with `BREAKING CHANGE:` followed by a space or newline.

```text
feat(api): change user response structure

BREAKING CHANGE: The `user.id` field is now a UUID string instead of an integer.
Closes #42
```

---

## 6. Instructions for AI Agents

When generating commits for this repository:

1.  **Analyze Diff:** Look at `git diff --staged` to understand the context.
2.  **Identify Scope:** Map the changed files to the closest folder name in `src/features/` or `src/components/`.
3.  **Select Type:** Choose the most specific type from Section 2.
4.  **Draft Subject:** Write a concise, imperative summary.
5.  **Formatting:** Ensure no capitalization (except proper nouns) and no trailing periods.
6.  **Output:** Return **only** the commit message string.
