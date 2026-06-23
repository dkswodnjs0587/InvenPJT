export type Board = {
  id: number;
  name: string;
  slug: string;
  description: string;
};

export type Post = {
  id: number;
  boardName: string;
  boardSlug: string;
  title: string;
  content: string;
  authorName: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string | null;
};

const API_BASE_URL = '/api';
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false';

export async function fetchBoards(): Promise<Board[]> {
  if (USE_MOCK_API) {
    return mockBoards;
  }

  return getJson('/boards');
}

export async function fetchLatestPosts(): Promise<Post[]> {
  if (USE_MOCK_API) {
    return mockPosts;
  }

  return getJson('/posts/latest');
}

export async function fetchPostsByBoard(boardSlug: string): Promise<Post[]> {
  if (USE_MOCK_API) {
    return mockPosts.filter((post) => post.boardSlug === boardSlug);
  }

  return getJson(`/boards/${boardSlug}/posts`);
}

export async function fetchPost(postId: string): Promise<Post> {
  if (USE_MOCK_API) {
    const post = mockPosts.find((item) => item.id === Number(postId));

    if (!post) {
      throw new Error('글을 찾을 수 없습니다.');
    }

    return post;
  }

  return getJson(`/posts/${postId}`);
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error('API 요청에 실패했습니다.');
  }

  return response.json();
}

const mockBoards: Board[] = [
  { id: 1, name: '자유 게시판', slug: 'free', description: '자유롭게 이야기를 나누는 공간' },
  { id: 2, name: '공략 게시판', slug: 'guide', description: '팁과 공략을 정리하는 공간' },
  { id: 3, name: '질문 게시판', slug: 'qna', description: '궁금한 점을 묻고 답하는 공간' },
];

const mockPosts: Post[] = [
  {
    id: 1,
    boardName: '자유 게시판',
    boardSlug: 'free',
    title: '인벤 스타일 커뮤니티 프로젝트 시작!',
    content: '프론트 화면을 먼저 확인할 수 있도록 임시 데이터로 표시되는 글입니다.',
    authorName: 'admin',
    viewCount: 12,
    createdAt: '2026-06-23T13:30:00',
    updatedAt: null,
  },
  {
    id: 2,
    boardName: '공략 게시판',
    boardSlug: 'guide',
    title: '게시판 기능 개발 순서 정리',
    content: '목록, 상세, 작성, 수정, 삭제 순서로 만들면 흐름을 잡기 쉽습니다.',
    authorName: 'team',
    viewCount: 8,
    createdAt: '2026-06-23T13:40:00',
    updatedAt: null,
  },
  {
    id: 3,
    boardName: '질문 게시판',
    boardSlug: 'qna',
    title: '백엔드는 언제 켜야 하나요?',
    content: '실제 DB 데이터와 API 연결을 확인할 때 백엔드를 함께 실행하면 됩니다.',
    authorName: 'guest',
    viewCount: 5,
    createdAt: '2026-06-23T13:50:00',
    updatedAt: null,
  },
];
