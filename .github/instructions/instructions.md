---
applyTo: '**'
---
# Copilot Usage Guidelines for This Repository

## 🚫 Behavioral Guardrails

**Copilot is not allowed to:**
- Discontinue work on any task after a first failure — **it must try at least five distinct approaches** before marking a task as blocked or unresolved.
- Alter the application's **design, UX, or core logic flow** unless explicitly allowed via a written note in a `plan.md` or issue description.
- Delete any tasks from `todo.md`. Tasks may only be:
  - Marked as done (`- [x]`) or
  - Move tasks to `archive_todo.md` once fully completed under the `/docs/` folder.
- Unless requested to, do NOT alter the program flow or logic. If a task is not clear, it should be documented in the `todo.md` file and/or the relevant plan file.

## ✅ Workflow Protocol

### 1. Always Plan First
Before implementing **any new feature or fix**, Copilot must:

1. Create a corresponding `plan-[feature-name].md` inside the `/docs/` folder.
2. This plan **must include**:
   - Feature name or bugfix title
   - Goal & expected behavior
   - Technical steps to implement
   - Potential edge cases
   - Impact on existing files or UX
   - Create also a checklist if that feature or bug is resolved at the end of the plan
   - Use the checklist to determine if this plan is done or not and therefore check the individual items both in the checklist and also `todo.md`
3. Link this plan directly in `todo.md` when creating new tasks.

### 2. Task Management
- Use `todo.md` to create and update tasks.
- When creating a new task:
  - Always include a link to the related `/docs/plan-*.md` file.
  - Use descriptive bullets and group tasks into meaningful sections (e.g., MVP, Alpha, Polish).
- When a larger feature is completed:
  - Move related completed tasks to `archive_todo.md` under the `/docs/` folder.
  - Ensure they remain in their original format with any relevant notes or links preserved.

### 3. Documentation and Communication
- Annotate all changes in `todo.md` with brief **implementation notes** or obstacles.
- Reference `docs/*` plans or files when applicable.
- If an obstacle is encountered, write it down in the related plan file or in a new `/docs/issue-[topic].md`.
- to every component you touch, if not already there add to the beginning of the file a documantion comment, documenting the following:
  - The component name
  - The purpose of the component
  - The props it receives
  - The expected behavior of the component
  - Any important notes or caveats
  - Any dependencies or external libraries used
  - Other components integrating this component or using it (just direct references)

## 🔁 Retry Expectations

If a problem or bug is encountered:

- Copilot must attempt **five unique implementation strategies** before:
  - Logging the issue as blocked
  - Requesting clarification
- Each attempt should differ significantly (e.g., alternate API usage, DOM structure, CSS method, fallback behavior).

Use inline `// Attempt 1`, `// Attempt 2`, etc. to indicate retries in the codebase if needed.

## 🧠 Mind the Boundaries

Copilot should:
- Align component changes with `docs/component-structure.md`
- Respect existing data schema per `docs/data-structure.md`
- Maintain language-aware behavior based on `docs/multilingual-support.md`

## 📦 Final Output Responsibilities

For each completed task:
- Ensure relevant source files are updated and committed.
- Update `todo.md` to mark tasks as complete.
- Add any implementation notes in the relevant plan or task.
- Move completed major blocks into `archive_todo.md`.

---

By following this protocol, Copilot becomes a reliable assistant within a human-defined framework of structure, clarity, and versioned memory.

