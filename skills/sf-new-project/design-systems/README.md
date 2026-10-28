# Design systems

Each folder holds one `DESIGN.md`: YAML token front matter, then prose rules (Overview, Colors, Typography, Layout, Elevation, Shapes, Components, Do's and Don'ts, Responsive, Known Gaps). The project's `shadcn` skill reads this format when it maps a design onto shadcn.

`/sf-new-project` asks which design system a frontend project follows, copies that `DESIGN.md` to the project root, and records it as `"designSystem"` in `factory.json`. The project's `src/index.css` is then generated from the tokens by the `shadcn` skill ("apply this DESIGN.md").

| Design system | From | Use for |
|---|---|---|
| [`intellicar-default`](intellicar-default/DESIGN.md) (default) | fms-ui | Intellicar fleet and telematics products. Client brand via white-label tokens only |

## Adding one

1. Create `<name>/DESIGN.md` in the same format. Keep tenant-brand tokens apart from product tokens, as `intellicar-default` does.
2. Add a row here.
3. Generate a throwaway project with it and check that the shadcn mapping and `pnpm check` both pass.
