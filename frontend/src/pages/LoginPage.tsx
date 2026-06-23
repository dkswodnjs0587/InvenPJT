function LoginPage() {
  return (
    <section className="auth-panel">
      <h1>로그인</h1>
      <form className="write-form">
        <label>
          아이디
          <input type="text" placeholder="아이디" />
        </label>
        <label>
          비밀번호
          <input type="password" placeholder="비밀번호" />
        </label>
        <button className="button" type="button">로그인</button>
      </form>
    </section>
  );
}

export default LoginPage;

