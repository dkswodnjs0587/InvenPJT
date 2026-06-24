# LOUNGE

Spring Boot와 React로 만든 커뮤니티 프로젝트입니다. 게시판, 회원가입, 로그인 기능은 로컬 MySQL 데이터베이스를 사용합니다.

## 요구 환경

- Java 21
- Maven
- Node.js 20 이상
- MySQL 8 이상

## 데이터베이스 설정

먼저 MySQL에 데이터베이스를 생성합니다.

```sql
CREATE DATABASE invenpjt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

`backend/.env.example`을 참고해 `backend/.env`를 만들고 로컬 DB 정보를 입력합니다. `.env`는 Git에 포함되지 않습니다.

```text
DB_URL=jdbc:mysql://localhost:3306/invenpjt?serverTimezone=Asia/Seoul&characterEncoding=UTF-8&useUnicode=true&useSSL=false&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=your-password
```

백엔드는 시작할 때 `boards`, `members`, `posts` 테이블을 MySQL에 생성·갱신합니다. 회원 비밀번호는 BCrypt 해시로만 저장됩니다.

## 실행

백엔드와 프론트는 각각 별도 터미널에서 실행합니다.

```bash
cd backend
mvn spring-boot:run
```

```bash
cd frontend
npm install
npm run dev -- --port 5174
```

- Frontend: `http://127.0.0.1:5174`
- Backend API: `http://localhost:8080`
