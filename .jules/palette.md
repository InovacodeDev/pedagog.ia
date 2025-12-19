# Palette's Journal 🎨

## 2024-05-23 - Exam Upload Accessibility
**Learning:** The file upload dropzone was completely inaccessible to keyboard users, a common pattern in drag-and-drop interfaces.
**Action:** Always add `tabIndex`, `role="button"`, and `onKeyDown` handlers to clickable `div`s used as custom buttons or inputs.
