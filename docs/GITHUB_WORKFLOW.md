# GitHub Workflow

## First Setup

1. One person creates the GitHub repository.
2. Invite the friend as a collaborator.
3. Push this project to GitHub.
4. Create a `develop` branch from `main`.

## Daily Work

```bash
git checkout develop
git pull origin develop
git checkout -b feature/post-api
```

After finishing a feature:

```bash
git add .
git commit -m "Add post API"
git push origin feature/post-api
```

Then open a pull request into `develop`.

## Commit Message Examples

- `Add board API`
- `Add login page layout`
- `Fix post detail loading`
- `Update database schema docs`

