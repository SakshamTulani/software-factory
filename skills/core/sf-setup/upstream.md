# Upstream sources

Written by `/sf-setup`. The repos and documents this project consumes but doesn't own. The `sf-upstream` skill reads them and sends requests to them; `/sf-spec` cites them. This repo's specs and ADRs record only its own decisions; business rules and the API contract are cited from here.

## Sources

| Name | Kind | Location | Auth | Requests go to |
|---|---|---|---|---|
{{SOURCE_ROWS}}

<!-- Examples:
| backend | github-repo | `acme/fleet-api`, branch `develop` | gh | `acme/fleet-api` issues, label `spec-request` |
| backend-api | openapi | `https://api.acme.dev/openapi.json` | `BACKEND_API_TOKEN` | backend |
| product | doc | `https://acme.atlassian.net/wiki/spaces/FLEET` | Atlassian connector | backend |
-->

## Read, by kind

Fetch fresh every time. Record each source's SHA or version and the date.

**github-repo**: clone shallow into a temporary folder and read it there; never inside this repo.

```bash
d=$(mktemp -d) && gh repo clone <owner/repo> "$d" -- --depth 1 --branch <branch> -q
git -C "$d" rev-parse HEAD          # the SHA to cite
ls "$d"/docs/specs "$d"/docs/adr    # specs and decisions first; then any openapi.{json,yaml}; code last
```

**openapi**: fetch with curl; read only the paths the feature needs and the schemas they reference.

```bash
f=$(mktemp) && curl -fsSL <url> -o "$f"                       # public
f=$(mktemp) && curl -fsSL -H "Authorization: Bearer $TOKEN" <url> -o "$f"   # with a token (see Auth)
jq -r '.info.version' "$f"                                     # the version to cite
jq -r '.paths | keys[]' "$f" | grep -i <term>                  # find paths
jq '.paths["/vehicles/{id}"]' "$f"                             # one path
jq '.components.schemas.Vehicle' "$f"                          # a schema it references
```

YAML: convert first with `yq -o=json`. A Swagger 2 document keeps schemas under `.definitions`.

**doc**: read with the connector or MCP tool the Auth column names, or fetch a public page. With neither, ask the user to paste the relevant part. Cite the URL and the date.

## Auth

Repos use `gh auth`. A token is named here by its environment variable, never written into any file in git. Each developer exports it in their shell or adds it to `.env` (gitignored; without the `PUBLIC_` prefix, so it never reaches the browser). If it isn't in the environment, load just that line without printing it:

```bash
export "$(grep '^<VAR>=' .env)" && TOKEN="$<VAR>"
```

If it is unset or rejected, report the source as unreadable and ask; never ask the user to paste a token into the chat.

## Request

Requests go to the repo in the source's "Requests go to" column; a name there points to that source's row.

| Operation | Do |
|---|---|
| find an open request | `gh issue list -R <owner/repo> --label spec-request --state open --search "<terms>"` |
| comment on one | `gh issue comment <n> -R <owner/repo> --body "…"`, after the user says yes |
| file a request | `gh issue create -R <owner/repo> --title "Spec request: …" --label spec-request --body "…"`, after the user says yes |
| check the answer | `gh issue view <n> -R <owner/repo> --json state,comments` |

If the label doesn't exist on that repo, file without it and say so; creating labels on another team's repo is theirs to decide.
