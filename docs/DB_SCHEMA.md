# Database Schema Draft

## boards

| Column | Type | Note |
| --- | --- | --- |
| id | BIGINT | Primary key |
| name | VARCHAR(50) | Board display name |
| slug | VARCHAR(50) | Unique board URL key |
| description | VARCHAR(255) | Board description |
| created_at | DATETIME | Created time |

## posts

| Column | Type | Note |
| --- | --- | --- |
| id | BIGINT | Primary key |
| board_id | BIGINT | FK to boards.id |
| title | VARCHAR(200) | Post title |
| content | TEXT | Post content |
| author_name | VARCHAR(50) | Temporary author name |
| view_count | INT | View count |
| created_at | DATETIME | Created time |
| updated_at | DATETIME | Updated time |

## comments

| Column | Type | Note |
| --- | --- | --- |
| id | BIGINT | Primary key |
| post_id | BIGINT | FK to posts.id |
| content | TEXT | Comment content |
| author_name | VARCHAR(50) | Temporary author name |
| created_at | DATETIME | Created time |

