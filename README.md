# InvenPJT

Java, Spring Boot, React, MySQL로 만드는 인벤 스타일 커뮤니티 사이트입니다.

## Project Structure

```text
InvenPJT/
  backend/   Spring Boot API server
  frontend/  React client
  docs/      Planning, API, database notes
```

## Getting Started

Before running the project, install these tools:

- Java 21
- Maven
- Node.js 20 or newer
- MySQL 8

### Run Backend and Frontend Together

```bash
npm install
npm run dev
```

Frontend server: `http://localhost:5173`

Backend server: `http://localhost:8080`

### Backend

```bash
cd backend
mvn spring-boot:run
```

Backend server: `http://localhost:8080`

By default, the backend uses an in-memory development database, so it can run before MySQL is configured.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend server: `http://localhost:5173`

The frontend uses temporary mock data by default, so you can check the screen before the backend is running.
When you want to connect to the real Spring Boot API, create `frontend/.env` and set:

```text
VITE_USE_MOCK_API=false
```

## Database

Create a local MySQL database first:

```sql
CREATE DATABASE invenpjt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then run the backend with the MySQL profile:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

You can set your local database values with environment variables:

```text
DB_URL=jdbc:mysql://localhost:3306/invenpjt?serverTimezone=Asia/Seoul&characterEncoding=UTF-8
DB_USERNAME=root
DB_PASSWORD=your-password
```

## Team Workflow

- `main`: stable branch
- `develop`: shared development branch
- `feature/feature-name`: feature work branch

Use pull requests before merging work into `develop` or `main`.

## GitHub Setup

```bash
git init
git add .
git commit -m "Initial project scaffold"
git branch -M main
git remote add origin https://github.com/your-username/InvenPJT.git
git push -u origin main
```
