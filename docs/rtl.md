# Right-to-left (Arabic)

Arabic is a first-class language, so every screen must work mirrored. The goal is that a page never has to think about direction: the components in `components/ui` and `components/component` already handle it.

## Where direction comes from

- `<html dir>` and `lang` follow the active language: set before first paint by the script in `index.html`, then kept in sync by the `languageChanged` handler in `main.tsx`.
- Radix primitives (Select, Dropdown, Tabs, Popover, Tooltip, Switch, ...) default to `ltr` unless told otherwise. `RadixDirection` (`components/shell/direction.tsx`) wraps the app in Radix's `DirectionProvider`, and that context also reaches portalled content (dialogs, drawers, popovers).
- In code, `useLocale().dir` gives `"ltr" | "rtl"`. Use it only when a prop needs a value, for example a sheet `side`.

## Rules

1. Logical utilities only: `ms-` / `me-` / `ps-` / `pe-` / `start-` / `end-` / `text-start` / `text-end` / `border-s` / `border-e` / `rounded-s` / `rounded-e`. Never `ml-` / `mr-` / `pl-` / `pr-` / `left-` / `right-` / `text-left` / `text-right` / `border-l` / `border-r`. `gap-` and `space-x-` are already direction-aware.
2. Do not put `dir="ltr"` on a layout container, a form item or a table cell. It flips every logical utility inside it. To keep a value left-to-right (phone numbers, e-mails, usernames, money, serials, dates) wrap only the value: `<bdi dir="ltr">{value}</bdi>`.
3. `ltr:` / `rtl:` variants match the element's own computed direction (overridden in `index.css`; Tailwind's default also matches everything under a `dir` ancestor). Prefer logical utilities over them.
4. Icons that point somewhere (chevrons, arrows, panel toggles) take the `rtl-flip` class. Up/down icons and symmetrical ones do not.
5. Things that are about a physical side (a Radix `side="left"`, a toast corner, a fixed-position sheet) stay physical; pick the value from `useLocale().dir` when it should follow the language.
6. An input that must type left-to-right (digits, serials) gets `dir="ltr"` and `[text-align:match-parent]`, so its text still starts at the page's start edge.
7. Print layouts are not mirrored on purpose; leave them alone.

## Checklist for a new component

- Only logical classes; search the file for `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right`, `border-l`, `border-r`.
- Absolutely positioned things use `start-` / `end-`.
- Directional icons use `rtl-flip`.
- LTR values are wrapped in `<bdi dir="ltr">`, not their container.
- Looked at in Arabic (the language switch is in the user menu), including inside a dialog on desktop and in a drawer on a phone.
