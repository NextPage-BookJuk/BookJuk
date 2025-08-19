// ==================================================
// 1. 인증 모듈 (팀원들이 사용할 핵심 기능)
// ==================================================
export const auth = {
    async signup(username, email, password, preferredGenre, introduction) {
        const response = await fetch('/api/users/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, preferredGenre, introduction }),
        });
        const data = await response.json();
        if (!response.ok) throw data;
        return data;
    },
    async login(email, password) {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw data;

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data.user));
        return data;
    },
    async checkEmail(email) {
        const response = await fetch(`/api/users/check-email?email=${email}`);
        const data = await response.json();
        if (!response.ok) throw data;
        return data;
    },
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
    },
    getToken() { return localStorage.getItem('authToken'); },
    getUser() {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    },
    isLoggedIn() { return !!this.getToken(); }
};

// ==================================================
// 2. API 요청 모듈 (팀원들이 사용할 핵심 기능)
// ==================================================
export const api = {
    async request(endpoint, options = {}) {
        const token = auth.getToken();
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(endpoint, { ...options, headers });

        if (response.status === 401) {
            auth.logout();
            showToast('세션이 만료되었습니다. 다시 로그인해주세요.', 'error');
            setTimeout(() => window.location.href = '/auth', 2000);
            throw new Error('Unauthorized');
        }

        const data = await response.json();
        if (!response.ok) throw data;
        return data;
    }
};

// ==================================================
// 3. 페이지 UI 및 이벤트 처리
// ==================================================

// Toast UI 함수
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const messageEl = document.createElement('span');
    messageEl.className = 'toast-message';
    messageEl.textContent = message;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close-btn';
    closeBtn.innerHTML = '&times;';

    const progress = document.createElement('div');
    progress.className = 'toast-progress';

    toast.append(messageEl, closeBtn, progress);
    container?.appendChild(toast);

    const removeToast = () => {
        toast.style.animation = 'slideOut 0.5s forwards';
        toast.addEventListener('animationend', () => toast.remove());
    };

    closeBtn.onclick = removeToast;
    setTimeout(removeToast, 5000);
}

// ==================================================
// 인증 게이트키핑 로직 (로그인 상태면 로그인 페이지 접속 시 메인 페이지로 자동 이동)
// 페이지가 로드되자마자 로그인 상태를 확인합니다.
// ==================================================
(function () {
    const path = window.location.pathname;
    if (auth.isLoggedIn() && (path === '/login' || path === '/signup')) {
        // 로그인 폼/회원가입 폼을 숨겨서 깜빡임을 방지
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        if(loginForm) loginForm.classList.add('hidden');
        if(signupForm) signupForm.classList.add('hidden');

        // 사용자에게 알림을 보여주고 메인 페이지로 리다이렉트
        showToast('이미 로그인된 상태입니다. 메인 페이지로 이동합니다.', 'success');
        setTimeout(() => {
            window.location.href = '/'; // 메인 페이지('/')로 이동
        }, 1500); // 1.5초 후에 이동
    }
})();
// ==================================================

// DOM 요소 가져오기
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginTabBtn = document.getElementById('login-tab-btn');
const signupTabBtn = document.getElementById('signup-tab-btn');

// 탭 전환 함수
function showForm(formToShow, tabToActivate) {
    loginForm.classList.add('hidden');
    signupForm.classList.add('hidden');
    loginTabBtn.classList.remove('active');
    signupTabBtn.classList.remove('active');

    formToShow.classList.remove('hidden');
    tabToActivate.classList.add('active');
}

loginTabBtn?.addEventListener('click', () => showForm(loginForm, loginTabBtn));
signupTabBtn?.addEventListener('click', () => showForm(signupForm, signupTabBtn));

// --- 회원가입 폼 로직 ---
const usernameInput = document.getElementById('signup-username');
const emailInput = document.getElementById('signup-email');
const emailCheckBtn = document.getElementById('email-check-btn');
const passwordInput = document.getElementById('signup-password');
const passwordConfirmInput = document.getElementById('signup-password-confirm');
const signupSubmitBtn = document.getElementById('signup-submit-btn');

let isEmailCheckedAndValid = false;

// 이메일 중복 확인
emailCheckBtn?.addEventListener('click', async () => {
    const email = emailInput.value;
    const emailErrorEl = document.getElementById('email-error');
    const emailSuccessEl = document.getElementById('email-success');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailErrorEl.textContent = '올바른 이메일 형식이 아닙니다.';
        emailErrorEl.style.display = 'block';
        return;
    }

    try {
        const result = await auth.checkEmail(email);
        if (result.available) {
            emailErrorEl.style.display = 'none';
            emailSuccessEl.textContent = '사용 가능한 이메일입니다.';
            emailSuccessEl.style.display = 'block';
            emailInput.classList.add('success');
            emailInput.classList.remove('error');
            isEmailCheckedAndValid = true;
        } else {
            emailSuccessEl.style.display = 'none';
            emailErrorEl.textContent = '이미 사용 중인 이메일입니다.';
            emailErrorEl.style.display = 'block';
            emailInput.classList.add('error');
            emailInput.classList.remove('success');
            isEmailCheckedAndValid = false;
        }
    } catch (error) {
        showToast(error.detail || '이메일 확인 중 오류 발생', 'error');
        isEmailCheckedAndValid = false;
    }
    validateSignupForm();
});

// 이메일 입력 시, 확인 상태 초기화
emailInput?.addEventListener('input', () => {
    isEmailCheckedAndValid = false;
    emailInput.classList.remove('success', 'error');
    document.getElementById('email-success').style.display = 'none';
    document.getElementById('email-error').style.display = 'none';
    validateSignupForm();
});

// 실시간 비밀번호 일치 확인
passwordConfirmInput?.addEventListener('input', () => {
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;
    const errorEl = document.getElementById('password-confirm-error');
    if (password && passwordConfirm && password !== passwordConfirm) {
        errorEl.textContent = '비밀번호가 일치하지 않습니다.';
        errorEl.style.display = 'block';
    } else {
        errorEl.style.display = 'none';
    }
    validateSignupForm();
});

// 회원가입 폼 전체 유효성 검사 및 버튼 활성화
function validateSignupForm() {
    const isUsernameValid = usernameInput.value.trim() !== '';
    const isPasswordValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/.test(passwordInput.value);
    const isPasswordConfirmed = passwordInput.value === passwordConfirmInput.value;

    if (isUsernameValid && isEmailCheckedAndValid && isPasswordValid && isPasswordConfirmed) {
        signupSubmitBtn.disabled = false;
    } else {
        signupSubmitBtn.disabled = true;
    }
}
if(usernameInput && passwordInput) [usernameInput, passwordInput].forEach(input => input.addEventListener('input', validateSignupForm));

// 회원가입 폼 제출
signupForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = usernameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const introduction = document.getElementById('signup-introduction').value;
    const selectedGenre = document.querySelector('input[name="genre"]:checked')?.value || null;

    try {
        await auth.signup(username, email, password, selectedGenre, introduction);
        showToast('회원가입이 완료되었습니다! 로그인 해주세요.', 'success');
        signupForm.reset();
        showForm(loginForm, loginTabBtn);
    } catch (error) {
        showToast(error.detail || '회원가입 중 오류가 발생했습니다.', 'error');
    }
});

// --- 로그인 폼 제출 ---
loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        await auth.login(email, password);
        showToast('로그인 성공! 모임 목록으로 이동합니다.', 'success');
        setTimeout(() => window.location.href = '/', 1000); // 1초 후 모임 목록(메인 페이지)으로
    } catch (error) {
        showToast(error.detail || '로그인에 실패했습니다.', 'error');
    }
});

// --- 장르 동적 생성 ---
const genres = ["소설", "에세이", "자기계발", "역사", "과학", "인문"];
const genreGroup = document.getElementById('genre-group');
genres.forEach((genre, index) => {
    const id = `genre${index + 1}`;
    const item = document.createElement('div');
    item.className = 'checkbox-item';
    item.innerHTML = `
        <input type="radio" id="${id}" name="genre" value="${genre}">
        <label for="${id}">${genre}</label>
    `;
    genreGroup?.appendChild(item);
});