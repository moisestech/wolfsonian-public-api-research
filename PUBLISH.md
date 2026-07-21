# Publish this repository

From the project folder, after reviewing the README:

```bash
git init
git add .
git commit -m "Start public Wolfsonian API research notebook"
gh repo create wolfsonian-public-api-research --public --source=. --remote=origin --push
```

If GitHub CLI is not authenticated, create an empty public repository in GitHub first, then run:

```bash
git remote add origin <YOUR_REPOSITORY_URL>
git branch -M main
git push -u origin main
```

Suggested description:

> Independent technical notebook exploring The Wolfsonian's publicly documented digital collection API, provenance, uncertainty, and collection-based computational research.
