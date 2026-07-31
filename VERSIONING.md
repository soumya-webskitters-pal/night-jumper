# Version Management

Versions are updated automatically by the tracked Git `commit-msg` hook.

## Setup

Run once after cloning:

```sh
npm run version:setup
```

## Version rules

- Normal commits increment the minor version: `1.0.0` → `1.1.0`.
- Breaking commits increment the major version: `1.x.x` → `2.0.0`.
- Every bump is recorded in `VERSION_HISTORY.md` with the changed files.

Normal commits use the minor version automatically. For a major release, set
the bump type while committing:

```sh
VERSION_BUMP=major git commit -m "feat!: replace the game API"
```

To create a commit without changing the version:

```sh
SKIP_VERSION_BUMP=1 git commit -m "chore: update metadata"
```

Check upcoming versions without changing files:

```sh
npm run version:status
```
