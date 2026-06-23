# API Spec

Base URL: `http://localhost:8080/api`

## Boards

| Method | Path | Description |
| --- | --- | --- |
| GET | `/boards` | List boards |
| GET | `/boards/{boardSlug}/posts` | List posts in board |

## Posts

| Method | Path | Description |
| --- | --- | --- |
| GET | `/posts/{postId}` | Get post detail |
| POST | `/posts` | Create post |
| PUT | `/posts/{postId}` | Update post |
| DELETE | `/posts/{postId}` | Delete post |

## Request Examples

### Create Post

```json
{
  "boardSlug": "free",
  "title": "첫 글입니다",
  "content": "인벤 스타일 커뮤니티 프로젝트 시작!",
  "authorName": "admin"
}
```

