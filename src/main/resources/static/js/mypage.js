/*const MyPage = () => {

    const init = async () => {

    }

    return {
        init,
    };
}
export default MyPage;*/
// 백엔드 API 서버의 기본 URL
const URL = 'api/mypage';

//=========== DOM ============//
// 프로필 정보
const $profileImage = document.getElementById('profileImage');
const $username = document.getElementById('profileName');
const $email = document.getElementById('profileEmail');
const $introduction = document.getElementById('profileBio');

// 활동 통계 정보
const $receivedLikes = document.getElementById('receivedLikes');
const $participatedMeetings = document.getElementById('totalMeetings');

// 모임 정보
const $title = document.querySelector('.meeting-title');
const $date = document.querySelector('.date');
const $role = document.querySelector('.role-badge');

//=========== 렌더링 관련 함수 ============//
const viewMyPage = (myInfo) => {
    console.log(myInfo)
    // 1. 마이페이지 정보를 뿌릴 태그
    // 개인 정보 태그
    const $profileHeader = document.querySelector('.profile-header');
    const $genreTags = document.querySelector('.genre-tags');

    // 통계 정보 태그

    // 모임 정보 태그
    const $meetingList = document.querySelector('.meetings-list');
    const $meetingItem = document.querySelector(".meeting-item");

    // 2. 랜더링 전 기존 정보 초기화
    $profileHeader.innerHTML = ` `;
    $meetingList.innerHTML = ` `;
    $receivedLikes.textContent = ` `;
    $participatedMeetings.textContent = ` `;
    $genreTags.innerHTML = ` `;

    // 3. 조회 값 랜더링
    // 개인 정보
    const profile = myInfo.data.profile;

    // 자기소개 설정에 따른 노출 처리
    let introduction = null;
    let bioStyle = null;
    if(profile.introduction) {
        introduction = profile.introduction;
        bioStyle = "display: block";
    } else {
        bioStyle = "display: none";
    }

    $profileHeader.innerHTML = `
        <div class="profile-image" id="profileImage">
            <img src="${profile.profileImage}" alt="프로필 사진">
        </div>
        <div class="profile-name" id="profileName">${profile.username}</div>
        <div class="profile-email" id="profileEmail">${profile.email}</div>
        <div class="profile-bio" id="profileBio" style="${bioStyle}">${introduction}</div>
    `;

    // 설정된 선호 장르가 있을 때만 정보를 뿌림
    if(profile.preferredGenre) {
        $genreTags.innerHTML = `
           <span class="genre-tag">${profile.preferredGenre}</span>
        `;
    }

    // 통계 정보
    const stat = myInfo.data.statistics;
    $receivedLikes.textContent = `${stat.receivedLikes}`;
    $participatedMeetings.textContent = `${stat.participatedMeeting}`;

    // 미팅 정보
    const meetings = myInfo.data.meetings || [];
    if(meetings.length === 0) {
        const $noMeeting = document.createElement('div');
        $noMeeting.innerHTML = `
            <div class="empty-state-icon">📖</div>
            <div class="empty-state-title">아직 참여한 모임이 없어요</div>
            <div class="empty-state-message">
                다양한 독서모임에 참여해보세요!<br>
                새로운 사람들과 함께 책을 읽는 즐거움을 경험할 수 있어요.
            </div>
            <button class="empty-state-button">
                모임 찾기
            </button>
        `;
        $noMeeting.className = 'empty-state';
        $meetingList.append($noMeeting);


    } else {
        meetings.forEach(meeting => {
            const $meetingItem = document.createElement('div');

            let roleClass = ``;
            let roleName = ``;

            let meetingStatus = ``;

            if(meeting.meetingStatus === 'RECRUITING') meetingStatus = '모집중';
            else if(meeting.meetingStatus === 'COMPLETED') meetingStatus = '종료';
            if(meeting.meetingStatus === 'CANCELLED') meetingStatus = '취소';

            if(meeting.role === 'HOST') {
                roleClass = 'role-host';
                roleName = '호스트';
            } else if((meeting.role === 'PARTICIPANT')){
                roleClass = 'role-participant';
                roleName = '참여자';
            }

            $meetingItem.innerHTML = `
                <div class="meeting-header">
                    <div class="meeting-info">
                        <div class="meeting-title">${meeting.meetingTitle}</div>
                        <div class="meeting-book">
                            <span class="book-title">${meeting.book.title}</span>
                            <span class="book-author">${meeting.book.author}</span>
                        </div>
                        <div class="meeting-meta">
                            <div class="meeting-meta-item">
                                <span>◎</span>
                                <span class="date">${formatDate(meeting.meetingTime)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="meeting-status">
                        <span class="status-badge status-recruiting">${meetingStatus}</span>
                        <span class="role-badge ${roleClass}">${roleName}</span>
                    </div>
                </div>
            `;
            $meetingItem.className = 'meeting-item';
            $meetingItem.dataset.id = meeting.meetingId;
            $meetingList.append($meetingItem);
        })
    }
}
//=========== 기타 함수 ============//

// ===== 인증 헬퍼 (auth.js 방식과 호환) =====
const authHelper = {
    getToken() {
        const token = localStorage.getItem('authToken') || localStorage.getItem('jwtToken');
        return token && token.trim() !== '' ? token : null;
    },
    getUser() {
        const userInfo = localStorage.getItem('userInfo') || localStorage.getItem('currentUser');
        return userInfo ? JSON.parse(userInfo) : null;
    },
    isLoggedIn() {
        return !!this.getToken();
    },
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('currentUser');
        updateNavigationByLoginStatus();
    }
}

// 시간 포맷 함수
function formatDate(dateString) {
    if (!dateString) return '';
    // "2025-08-18T21:00:00" → Date 객체 변환
    const date = new Date(dateString);

    // 로컬 시간 기준으로 yyyy-MM-dd HH:mm:ss 포맷
    const yyyy = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');

    return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
}

// 특정 미팅 상세 페이지로 이동
function goToMeetingDetail(meetingId) {
    window.location.href = `/meetings/${encodeURIComponent(meetingId)}`;
}

// 프로필 수정 페이지로 이동
function goToEditProfile() {
    window.location.href = `/editProfile`;
}

// 모임 찾기 페이지로 이동
function goToFindMeeting() {
    window.location.href = `/`;
}

function updateNavigationByLoginStatus() {
    const isLoggedIn = authHelper.isLoggedIn();
    const user = authHelper.getUser();

    // 헤더의 로그인/회원가입 버튼들
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    const startBtn = document.querySelector('.start-btn');

    // 사용자 네비게이션 영역 (있다면)
    let userNav = document.querySelector('.user-nav');

    // 사용자 네비게이션 영역이 없으면 생성
    if (!userNav && isLoggedIn) {
        userNav = document.createElement('div');
        userNav.className = 'user-nav';
        userNav.style.cssText = 'display: flex; align-items: center; gap: 15px; margin-left: auto;';

        // 적절한 위치에 삽입 (기존 버튼들 근처)
        const nav = document.querySelector('nav') || document.querySelector('header') || document.body;
        if (loginBtn && loginBtn.parentNode) {
            loginBtn.parentNode.insertBefore(userNav, loginBtn);
        } else {
            nav.appendChild(userNav);
        }
    }

    if (isLoggedIn && user) {
        console.log('로그인된 사용자:', user);

        // 로그인/회원가입 버튼 숨기기
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (startBtn) startBtn.style.display = 'none';

        // 사용자 네비게이션 표시
        if (userNav) {
            userNav.style.display = 'flex';
            userNav.innerHTML = `
                <a href="/createMeeting" class="create-meeting-btn">모임 만들기</a>
                <span style="color: #555; margin-right: 10px;">안녕하세요, ${user.username || user.name || '사용자'}님!</span>
                <button onclick="logout()" class="logout-btn">로그아웃</button>
            `;
        }
    } else {
        // 로그인되지 않은 상태
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (signupBtn) signupBtn.style.display = 'inline-block';
        if (startBtn) startBtn.style.display = 'inline-block';
        if (userNav) userNav.style.display = 'none';
    }
}

// 로그아웃 함수
function logout() {
    if (confirm('정말 로그아웃하시겠습니까?')) {
        authHelper.logout();
        window.location.href = `/`;
    }
}

// 홈으로 이동
function goHome() {
    window.location.href = `/`;
}

//=========== 서버 데이터 요청/응답 관련 함수 ============//
const fetchGetMyPage = async () => {
    console.log("마이페이지 js");
    const token = authHelper.getToken();
    if (!token) {
        throw new Error('인증 토큰이 없습니다.');
    }
    const res = await fetch('/api/mypage', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const result = await res.json();
    console.log(result);
    viewMyPage(result);
}
//=========== 이벤트 핸들러 설정 ============//
const addEventListeners = () => {
    const $editProfileBtn = document.querySelector('.btn-primary');
    const $meetingSection = document.querySelector('.activity-section');
    const $findMeetingBtn = document.querySelector('.empty-state-button');
    const $logoutBtn = document.querySelector('.logout-btn');
    const $logo = document.querySelector('h1.logo');

    // 수정 페이지 이동
    $editProfileBtn.addEventListener('click', e => {
        e.preventDefault()
        goToEditProfile();
    })

    // 모임 상세 페이지 이동
    $meetingSection.addEventListener('click', e => {
        e.preventDefault();
        const meetingItem = e.target.closest('.meeting-item');
        if(meetingItem) {
            const meetingId = meetingItem.dataset.id;
            goToMeetingDetail(meetingId);
        }
    })

    /*// 참여 모임 없을 시 모임 찾기 페이지 이동
    $findMeetingBtn.addEventListener('click', e => {
        e.preventDefault();
        console.log('이동버튼 클릭!')
        goToFindMeeting();
    })*/

    // 로그아웃 버튼 클릭 시
    $logoutBtn.addEventListener('click', e => {
        e.preventDefault();
        console.log('로그아웃 버튼 클릭!');
        logout();
    })

    // 홈으로 이동
    $logo.addEventListener('click', e => {
        goHome();
    })

}

//=========== 메인 코드 실행 ============//
(function () {

    // 페이지가 처음 열렸을 때 로그인 상태를 확인
    // 로그인 상태 확인
    if (!authHelper.isLoggedIn()) {
        document.querySelector('.container').innerHTML = ``;
        alert('로그인이 필요한 서비스입니다.');
        window.location.href = '/auth';
        return;
    }

    updateNavigationByLoginStatus();
    fetchGetMyPage();

    // 이벤트 핸들러들을 등록합니다.
    addEventListeners();
})();

