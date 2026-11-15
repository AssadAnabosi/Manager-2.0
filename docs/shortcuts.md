# Keyboard shortcuts and the command palette

On macOS use `⌘` where this page says `Ctrl`.

## Shortcuts

| Keys | Action |
| --- | --- |
| `Ctrl` + `K` | Open or close the command palette |
| `Ctrl` + `\` or `Ctrl` + `B` | Open or close the sidebar |
| `?` | Show the list of shortcuts (also in the palette as **Keyboard shortcuts**) |
| `Alt` + `1` to `9` | Go to the nth item of your sidebar (Worksheets, Bills, Cheques, Users, Payees, Settings, minus whatever your role cannot see, so the numbers follow what you have) |
| `[` / `]` | Go to the previous / next sidebar item, wrapping around |
| `g` then a letter | Go to a page: `d` dashboard, `w` worksheets, `b` bills, `c` cheques, `p` payees, `u` users, `s` settings (pages your role cannot open are ignored) |

## Command palette

The palette searches pages, creates records and switches the theme and language. Type in it:

| Type | Result |
| --- | --- |
| `c123` | **Add cheque with serial 123** (first result): opens the new cheque form with the serial filled in and the value field focused. Below it, **Search cheques with serial 123** |
| `b250` | Adds a **spent** bill of 250: the form opens with the amount and type filled in and the description field focused |
| `b-250` | The same, as a **received** bill |
| anything else | Matching pages, create actions, themes and languages |

Whatever you type, the last row is always **Search bills for "…"**, so Enter on a word that matches nothing searches the bills.

The "add" results only appear for roles that can write; the search results are always available.
