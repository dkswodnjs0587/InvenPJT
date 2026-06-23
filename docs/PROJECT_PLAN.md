# Project Plan

## Goal

Build a reusable community-site template inspired by Inven. The first version focuses on shared structure, then each developer can extend it with their own topic and features.

## MVP Features

1. Home page with latest posts and popular boards
2. Board list
3. Post list by board
4. Post detail
5. Post create, update, delete
6. Login and signup screens
7. Comment structure
8. My page structure

## Suggested Work Split

- Backend owner: domain model, REST API, database, authentication
- Frontend owner: layout, pages, routing, API integration
- Shared: API contract, database design, GitHub pull request review

## Branch Rules

- Create work branches from `develop`.
- Name branches like `feature/post-api`, `feature/login-page`, `fix/header-layout`.
- Keep pull requests small enough to review comfortably.

