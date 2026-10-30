# Specs

One folder per feature: `<slug>/spec.md` (what and why) and `<slug>/plan.md` (how, and in what order). Start a new one with `/sf-spec`. The slug is a short kebab-case name (`command-center`), never a number, so specs written on parallel branches can't collide. Copy [_template/](_template/).

Requirements are numbered `REQ-1`, `REQ-2` … within each spec. Outside the spec's folder, cite one as `<slug>/REQ-<n>`; the id is its own path.

Keep this index in the same commit as the spec it lists, with rows in alphabetical order. A spec missing from this table doesn't exist.

## Index

| Spec | Status | Summary |
|---|---|---|
| <!-- [command-center](command-center/spec.md) --> | <!-- approved --> | <!-- Send remote commands to a vehicle and see their status live --> |
