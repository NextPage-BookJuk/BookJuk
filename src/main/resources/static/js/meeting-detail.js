// 전역 변수
const API_BASE = '/api';
let currentMeetingId = null;
let currentUserId = null;
let userRole = 'guest'; // 'guest', 'member', 'host', 'participant'
let currentPostId = null;

// 모임 수정
function editMeeting() {
    if (!requireLogin('모임 수정')) return;

    if (userRole !== 'host') {
        alert('모임 수정은 호스트만 가능합니다.');
        return;
    }

    window.location.href = `/createMeeting?edit=true&id=${currentMeetingId}`;
}

// 모임 취소
async function cancelMeeting() {
    if (!requireLogin('모임 취소')) return;

    if (userRole !== 'host') {
        alert('모임 취소는 호스트만 가능합니다.');
        return;
    }

    if (confirm('정말로 모임을 취소하시겠습니까?\n이 작업은 되돌릴 수 없으며, 모든 참가자에게 알림이 발송됩니다.')) {
        try {
            const response = await apiCall(`${API_BASE}/meetings/${currentMeetingId}/cancel`, {
                method: 'PATCH'
            });

            if (response && response.ok) {
                alert('모임이 취소되었습니다.');
                location.reload();
            } else {
                throw new Error('모임 취소에 실패했습니다.');
            }
        } catch (error) {
            console.error('모임 취소 실패:', error);
            alert('모임 취소 중 오류가 발생했습니다.');
        }
    }
}

// 브라우저 뒤로가기/새로고침 시 상태 복원
window.addEventListener('beforeunload', () => {
    // 필요한 경우 상태 저장
});

window.addEventListener('popstate', () => {
    // 브라우저 뒤로가기 시 상태 복원
    getCurrentUser();
});

// 페이지 가시성 변경 시 (다른 탭에서 돌아올 때)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // 페이지가 다시 활성화될 때 사용자 상태 재확인
        getCurrentUser();
    }
});

// 현재 사용자 정보 가져오기
async function getCurrentUser() {
    try {
        // 1. JWT 토큰 확인
        const token = localStorage.getItem('jwtToken');
        if (token) {
            // 서버에서 사용자 정보 검증 및 가져오기
            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const user = await response.json();
                currentUserId = user.id;
                userRole = user.role || 'member';

                // 로컬 스토리지에도 사용자 정보 저장
                localStorage.setItem('currentUser', JSON.stringify(user));

                updateUIByUserRole();
                return;
            } else {
                // 토큰이 유효하지 않은 경우
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('currentUser');
            }
        }

        // 2. 로컬 스토리지에서 임시 사용자 정보 확인 (개발/테스트용)
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            const user = JSON.parse(userData);
            currentUserId = user.id;
            userRole = user.role || 'member';
        } else {
            userRole = 'guest';
        }
        updateUIByUserRole();
    } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
        userRole = 'guest';
        updateUIByUserRole();
    }
}

// 모임 상세 정보 로드
async function loadMeetingDetail() {
    try {
        const response = await fetch(`${API_BASE}/meetings/${currentMeetingId}`);
        if (!response.ok) {
            throw new Error('모임 정보를 불러올 수 없습니다.');
        }
        const meeting = await response.json();

        // UI 업데이트
        updateMeetingInfo(meeting);

        // 사용자 역할 확인
        checkUserRole(meeting);

    } catch (error) {
        console.error('모임 정보 로드 실패:', error);
        // 임시 데이터로 테스트
        loadTestMeetingData();
    }
}

// 테스트용 임시 데이터
function loadTestMeetingData() {
    const testMeeting = {
        id: 1,
        title: "따뜻한 겨울 소설 읽기",
        description: "겨울에 어울리는 따뜻한 소설을 함께 읽어요",
        bookTitle: "논픽션",
        bookAuthor: "김영하 지음",
        genre: "소설",
        meetingTime: "2025-08-15T19:00:00",
        region: "서울",
        city: "강남구",
        district: "역삼동",
        detailAddress: "강남역 2번 출구 앞 카페",
        maxParticipants: 8,
        meetingStatus: "RECRUITING",
        imageUrl: null,
        host: {
            id: 1,
            username: "도도독",
            likesCount: 23,
            hostedMeetingsCount: 8
        },
        currentParticipants: 5
    };

    updateMeetingInfo(testMeeting);

    // 테스트용 사용자 역할 설정
    if (currentUserId === 1) {
        userRole = 'host';
    } else if (currentUserId) {
        userRole = 'member';
    }
    updateUIByUserRole();
}

// 모임 정보 UI 업데이트
function updateMeetingInfo(meeting) {
    document.getElementById('breadcrumb-title').textContent = meeting.title;
    document.getElementById('meeting-title').textContent = meeting.title;
    document.getElementById('book-title').textContent = meeting.bookTitle;
    document.getElementById('book-author').textContent = meeting.bookAuthor;

    // 날짜 포맷팅
    const meetingDate = new Date(meeting.meetingTime);
    document.getElementById('meeting-date').textContent =
        `${meetingDate.getFullYear()}년 ${meetingDate.getMonth() + 1}월 ${meetingDate.getDate()}일 ${meetingDate.getHours()}:${meetingDate.getMinutes().toString().padStart(2, '0')}`;

    document.getElementById('meeting-location').textContent = `${meeting.region} ${meeting.city} ${meeting.district}`;
    document.getElementById('meeting-genre').textContent = `장르: ${meeting.genre}`;
    document.getElementById('meeting-address').textContent = meeting.detailAddress || '상세주소 미제공';

    // 호스트 정보
    document.getElementById('host-avatar').textContent = meeting.host.username.charAt(0);
    document.getElementById('host-name').textContent = `${meeting.host.username} (호스트)`;
    document.getElementById('host-stats').textContent =
        `받은 좋아요 ${meeting.host.likesCount}개 · 주최 모임 ${meeting.host.hostedMeetingsCount}회`;

    // 상태 배지
    updateStatusBadges(meeting);

    // 사이드바 정보
    document.getElementById('participants-count').textContent = `${meeting.currentParticipants}/${meeting.maxParticipants}명`;
    document.getElementById('status-value').textContent = getStatusText(meeting.meetingStatus);
    document.getElementById('remaining-slots').textContent = `${meeting.maxParticipants - meeting.currentParticipants}자리`;

    // 이미지 설정
    if (meeting.imageUrl) {
        document.getElementById('meeting-image').style.backgroundImage = `url(${meeting.imageUrl})`;
    }
}

// 상태 배지 업데이트
function updateStatusBadges(meeting) {
    const badgesContainer = document.getElementById('status-badges');
    badgesContainer.innerHTML = '';

    // 모집 상태 배지
    const statusBadge = document.createElement('span');
    statusBadge.className = `status-tag status-${meeting.meetingStatus.toLowerCase()}`;
    statusBadge.textContent = getStatusText(meeting.meetingStatus);
    badgesContainer.appendChild(statusBadge);

    // 장르 배지
    const genreBadge = document.createElement('span');
    genreBadge.className = 'status-tag genre-tag';
    genreBadge.textContent = meeting.genre;
    badgesContainer.appendChild(genreBadge);
}

// 상태 텍스트 변환
function getStatusText(status) {
    const statusMap = {
        'RECRUITING': '모집 중',
        'COMPLETED': '종료',
        'CANCELLED': '취소됨'
    };
    return statusMap[status] || status;
}

// 사용자 역할 확인
function checkUserRole(meeting) {
    if (currentUserId === meeting.host.id) {
        userRole = 'host';
    } else {
        // 참가자 목록에서 사용자 상태 확인 (실제로는 API 호출)
        userRole = 'member';
    }
    updateUIByUserRole();
}

// 사용자 역할에 따른 UI 업데이트
function updateUIByUserRole() {
    const isHost = userRole === 'host';
    const isParticipant = userRole === 'participant';
    const isGuest = userRole === 'guest';
    const isMember = userRole === 'member';

    // 버튼 표시/숨김
    const editBtn = document.getElementById('editBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const applyBtn = document.getElementById('applyBtn');
    const writeBtn = document.getElementById('writeBtn');
    const pendingRequests = document.getElementById('pending-requests');
    const commentForm = document.getElementById('comment-form');

    if (isHost) {
        editBtn.style.display = 'inline-flex';
        cancelBtn.style.display = 'inline-flex';
        applyBtn.style.display = 'none';
        writeBtn.style.display = 'inline-flex';
        pendingRequests.style.display = 'block';
        loadPendingRequests();
    } else if (isParticipant) {
        applyBtn.innerHTML = '<span>✓</span> 참여 확정';
        applyBtn.disabled = true;
        writeBtn.style.display = 'inline-flex';
    } else if (isGuest) {
        writeBtn.style.display = 'none';
        if (commentForm) commentForm.style.display = 'none';
    } else {
        writeBtn.style.display = 'inline-flex';
    }

    // 네비게이션 헤더 업데이트
    updateNavigationHeader();
}

// 네비게이션 헤더 업데이트
function updateNavigationHeader() {
    const nav = document.querySelector('.nav');
    const isGuest = userRole === 'guest';

    if (isGuest) {
        // 게스트용 네비게이션
        nav.innerHTML = `
            <a href="#" onclick="goHome()">홈</a>
            <a href="#" onclick="goToLogin()">로그인</a>
            <a href="#" class="create-meeting-btn" onclick="createMeeting()">모임 만들기</a>
        `;
    } else {
        // 로그인 사용자용 네비게이션
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const username = userData.username || '사용자';

        nav.innerHTML = `
            <a href="#" onclick="goHome()">홈</a>
            <a href="#" onclick="goMyPage()">마이페이지</a>
            <a href="#" class="create-meeting-btn" onclick="createMeeting()">모임 만들기</a>
            <span style="color: #555; margin-right: 10px;">안녕하세요, ${username}님!</span>
            <a href="#" onclick="logout()">로그아웃</a>
        `;
    }
}

// 로그인 페이지로 이동
function goToLogin() {
    window.location.href = '/auth';
}

// 참가자 목록 로드
async function loadParticipants() {
    const loadingElement = document.getElementById('participants-loading');
    const listElement = document.getElementById('participants-list');

    try {
        loadingElement.style.display = 'block';
        listElement.innerHTML = '';

        const response = await fetch(`${API_BASE}/meetings/${currentMeetingId}/participants`);
        if (!response.ok) {
            throw new Error('참가자 목록을 불러올 수 없습니다.');
        }
        const participants = await response.json();

        participants.forEach(participant => {
            const item = createParticipantItem(participant);
            listElement.appendChild(item);
        });

    } catch (error) {
        console.error('참가자 목록 로드 실패:', error);
        // 테스트 데이터
        loadTestParticipants();
    } finally {
        loadingElement.style.display = 'none';
    }
}

// 테스트용 참가자 데이터
function loadTestParticipants() {
    const testParticipants = [
        { id: 1, username: "도도독", role: "HOST", status: "APPROVED" },
        { id: 2, username: "책벌레123", role: "PARTICIPANT", status: "APPROVED" },
        { id: 3, username: "소설마니아", role: "PARTICIPANT", status: "APPROVED" },
        { id: 4, username: "문학청년", role: "PARTICIPANT", status: "APPROVED" },
        { id: 5, username: "독서왕", role: "PARTICIPANT", status: "PENDING" }
    ];

    const listElement = document.getElementById('participants-list');
    listElement.innerHTML = '';

    testParticipants.filter(p => p.status === 'APPROVED').forEach(participant => {
        const item = createParticipantItem(participant);
        listElement.appendChild(item);
    });
}

// 참가자 아이템 생성
function createParticipantItem(participant) {
    const item = document.createElement('div');
    item.className = 'participant-mini-item';

    const roleText = participant.role === 'HOST' ? '호스트' : '참여 확정';

    item.innerHTML = `
        <div class="participant-mini-avatar">${participant.username.charAt(0)}</div>
        <div class="participant-mini-info">
            <div class="participant-mini-name">${participant.username}</div>
            <div class="participant-mini-status">${roleText}</div>
        </div>
    `;

    return item;
}

// 대기 중인 참가신청 로드 (호스트만)
async function loadPendingRequests() {
    const loadingElement = document.getElementById('pending-loading');
    const listElement = document.getElementById('pending-list');

    try {
        loadingElement.style.display = 'block';
        listElement.innerHTML = '';

        const response = await fetch(`${API_BASE}/meetings/${currentMeetingId}/participants?status=PENDING`);
        if (!response.ok) {
            throw new Error('대기 목록을 불러올 수 없습니다.');
        }
        const pendingParticipants = await response.json();

        if (pendingParticipants.length === 0) {
            listElement.innerHTML = '<div style="text-align: center; color: #777; padding: 20px;">대기 중인 신청이 없습니다.</div>';
        } else {
            pendingParticipants.forEach(participant => {
                const item = createPendingItem(participant);
                listElement.appendChild(item);
            });
        }

    } catch (error) {
        console.error('대기 목록 로드 실패:', error);
        // 테스트 데이터
        loadTestPendingRequests();
    } finally {
        loadingElement.style.display = 'none';
    }
}

// 테스트용 대기 목록
function loadTestPendingRequests() {
    const testPending = [
        { id: 5, username: "독서왕", role: "PARTICIPANT", status: "PENDING" }
    ];

    const listElement = document.getElementById('pending-list');
    listElement.innerHTML = '';

    if (testPending.length === 0) {
        listElement.innerHTML = '<div style="text-align: center; color: #777; padding: 20px;">대기 중인 신청이 없습니다.</div>';
    } else {
        testPending.forEach(participant => {
            const item = createPendingItem(participant);
            listElement.appendChild(item);
        });
    }
}

// 대기 아이템 생성
function createPendingItem(participant) {
    const item = document.createElement('div');
    item.className = 'pending-item';

    item.innerHTML = `
        <div class="pending-info">
            <div class="pending-avatar">${participant.username.charAt(0)}</div>
            <div class="pending-name">${participant.username}</div>
        </div>
        <div class="pending-actions">
            <button class="btn btn-success btn-sm" onclick="approveParticipant(${participant.id})">승인</button>
            <button class="btn btn-danger btn-sm" onclick="rejectParticipant(${participant.id})">거절</button>
        </div>
    `;

    return item;
}

// 게시글 목록 로드
async function loadPosts() {
    const loadingElement = document.getElementById('posts-loading');
    const listElement = document.getElementById('posts-list');
    const statsElement = document.getElementById('board-stats');

    try {
        loadingElement.style.display = 'block';
        listElement.innerHTML = '';

        const response = await fetch(`${API_BASE}/meetings/${currentMeetingId}/posts?page=1&size=10`);
        if (!response.ok) {
            throw new Error('게시글 목록을 불러올 수 없습니다.');
        }
        const postsData = await response.json();

        statsElement.textContent = `총 ${postsData.totalElements}개의 게시글`;

        if (postsData.content.length === 0) {
            listElement.innerHTML = '<div style="text-align: center; color: #777; padding: 40px;">아직 작성된 글이 없습니다.<br>첫 번째 글을 작성해보세요!</div>';
        } else {
            postsData.content.forEach(post => {
                const item = createPostItem(post);
                listElement.appendChild(item);
            });
        }

    } catch (error) {
        console.error('게시글 로드 실패:', error);
        // 테스트 데이터
        loadTestPosts();
    } finally {
        loadingElement.style.display = 'none';
    }
}

// 테스트용 게시글 데이터
function loadTestPosts() {
    const testPosts = [
        {
            postId: 1,
            title: "책 읽은 소감 미리 공유해요!",
            content: "김영하 작가의 '논픽션' 정말 재미있게 읽고 있어요. 현실과 허구 사이의 경계에 대한 이야기가 인상 깊네요. 다들 어떻게 생각하시나요?",
            username: "도도독",
            createdAt: "2025-08-17T10:00:00",
            commentCount: 2
        },
        {
            postId: 2,
            title: "모임 장소 안내",
            content: "안녕하세요! 모임 장소는 강남역 근처 조용한 카페로 정했습니다. 자세한 주소는 개별 메시지로 보내드릴게요.",
            username: "도도독",
            createdAt: "2025-08-16T15:30:00",
            commentCount: 8
        },
        {
            postId: 3,
            title: "처음 참여합니다!",
            content: "독서모임 처음 참여하는데 떨리네요! 잘 부탁드려요 😊",
            username: "책벌레123",
            createdAt: "2025-08-14T09:15:00",
            commentCount: 5
        }
    ];

    const listElement = document.getElementById('posts-list');
    const statsElement = document.getElementById('board-stats');

    listElement.innerHTML = '';
    statsElement.textContent = `총 ${testPosts.length}개의 게시글`;

    testPosts.forEach(post => {
        const item = createPostItem(post);
        listElement.appendChild(item);
    });
}

// 게시글 아이템 생성
function createPostItem(post) {
    const item = document.createElement('div');
    item.className = 'post-item';
    item.onclick = () => viewPost(post.postId);

    const createdDate = new Date(post.createdAt);
    const timeAgo = getTimeAgo(createdDate);

    item.innerHTML = `
        <div class="post-header">
            <div>
                <div class="post-title">${post.title}</div>
                <div class="post-meta">
                    <div class="post-author">
                        <div class="author-avatar">${post.username.charAt(0)}</div>
                        <span>${post.username}</span>
                    </div>
                    <span>•</span>
                    <span>${timeAgo}</span>
                </div>
            </div>
        </div>
        <div class="post-content">${post.content}</div>
        <div class="post-stats">
            <div class="post-stat-item">
                <span>💬</span>
                <span>댓글 ${post.commentCount || 0}</span>
            </div>
        </div>
    `;

    return item;
}

// 시간 차이 계산
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;

    return date.toLocaleDateString();
}

// 참가자 승인
async function approveParticipant(userId) {
    try {
        const response = await fetch(`${API_BASE}/meetings/${currentMeetingId}/participants/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'APPROVE' })
        });

        if (!response.ok) {
            throw new Error('승인 처리에 실패했습니다.');
        }

        alert('참가자를 승인했습니다.');
        loadPendingRequests();
        loadParticipants();

    } catch (error) {
        console.error('승인 실패:', error);
        alert('승인 처리 중 오류가 발생했습니다.');
    }
}

// 참가자 거절
async function rejectParticipant(userId) {
    if (!confirm('정말로 이 참가신청을 거절하시겠습니까?')) return;

    try {
        const response = await fetch(`${API_BASE}/meetings/${currentMeetingId}/participants/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'REJECT' })
        });

        if (!response.ok) {
            throw new Error('거절 처리에 실패했습니다.');
        }

        alert('참가신청을 거절했습니다.');
        loadPendingRequests();

    } catch (error) {
        console.error('거절 실패:', error);
        alert('거절 처리 중 오류가 발생했습니다.');
    }
}

// 로그인 체크 유틸리티 함수
function requireLogin(action) {
    if (userRole === 'guest') {
        if (confirm('로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?')) {
            window.location.href = '/auth';
        }
        return false;
    }
    return true;
}

// 모임 신청
function applyToMeeting() {
    if (!requireLogin('모임 신청')) return;

    document.getElementById('apply-modal').style.display = 'block';
}

// 글쓰기 모달 열기
function openWriteModal() {
    if (!requireLogin('글 작성')) return;

    // 참여자 권한 확인 (호스트 또는 승인된 참가자만)
    if (userRole !== 'host' && userRole !== 'participant') {
        alert('이 모임의 참여자만 글을 작성할 수 있습니다.');
        return;
    }

    document.getElementById('write-modal').style.display = 'block';
}

// 댓글 작성
async function addComment() {
    if (!requireLogin('댓글 작성')) return;

    const content = document.getElementById('newComment').value.trim();
    if (!content) {
        alert('댓글 내용을 입력해주세요.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/meetings/${currentMeetingId}/posts/${currentPostId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getAuthHeader()
            },
            body: JSON.stringify({ content })
        });

        if (!response.ok) {
            throw new Error('댓글 작성에 실패했습니다.');
        }

        alert('댓글이 작성되었습니다.');
        document.getElementById('newComment').value = '';

        // 게시글 다시 로드
        viewPost(currentPostId);

    } catch (error) {
        console.error('댓글 작성 실패:', error);
        alert('댓글 작성 중 오류가 발생했습니다.');
    }
}

// Authorization 헤더 생성
function getAuthHeader() {
    const token = localStorage.getItem('jwtToken');
    return token ? `Bearer ${token}` : '';
}

// 사용자 상태 표시 업데이트
function updateUserStatusDisplay() {
    const statusElement = document.getElementById('user-status');
    if (statusElement) {
        if (userRole === 'guest') {
            statusElement.textContent = '로그인이 필요합니다';
            statusElement.className = 'user-status guest';
        } else {
            const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
            statusElement.textContent = `${userData.username || '사용자'}님 (${getRoleDisplayName(userRole)})`;
            statusElement.className = `user-status ${userRole}`;
        }
    }
}

// 역할 표시명 변환
function getRoleDisplayName(role) {
    const roleMap = {
        'host': '호스트',
        'participant': '참여자',
        'member': '회원',
        'guest': '게스트'
    };
    return roleMap[role] || role;
}

// 게시글 작성
async function submitPost() {
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();

    if (!title || !content) {
        alert('제목과 내용을 모두 입력해주세요.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/meetings/${currentMeetingId}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, content })
        });

        if (!response.ok) {
            throw new Error('게시글 작성에 실패했습니다.');
        }

        alert('게시글이 작성되었습니다.');
        closeModal();
        loadPosts();

    } catch (error) {
        console.error('게시글 작성 실패:', error);
        alert('게시글 작성 중 오류가 발생했습니다.');
    }
}

// 게시글 상세 보기
async function viewPost(postId) {
    try {
        currentPostId = postId;
        const response = await fetch(`${API_BASE}/meetings/${currentMeetingId}/posts/${postId}`);
        if (!response.ok) {
            throw new Error('게시글을 불러올 수 없습니다.');
        }
        const postDetail = await response.json();

        // 모달에 데이터 설정
        document.getElementById('postDetailTitle').textContent = postDetail.title;
        document.getElementById('postDetailMeta').innerHTML = `
            <div class="post-author">
                <div class="author-avatar">${postDetail.authorName.charAt(0)}</div>
                <span>${postDetail.authorName}</span>
            </div>
            <span>•</span>
            <span>${getTimeAgo(new Date(postDetail.createdAt))}</span>
        `;
        document.getElementById('postDetailContent').textContent = postDetail.content;

        // 댓글 목록 로드
        loadComments(postDetail.comments || []);

        document.getElementById('post-detail-modal').style.display = 'block';

    } catch (error) {
        console.error('게시글 로드 실패:', error);
        alert('게시글을 불러올 수 없습니다.');
    }
}

// 댓글 목록 로드
function loadComments(comments) {
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '';

    if (comments.length === 0) {
        commentsList.innerHTML = '<div style="text-align: center; color: #777; padding: 20px;">아직 댓글이 없습니다.</div>';
        return;
    }

    comments.forEach(comment => {
        const commentItem = document.createElement('div');
        commentItem.style.cssText = 'padding: 10px; background-color: #f8f6f3; border-radius: 8px; margin-bottom: 10px;';
        commentItem.innerHTML = `
            <div style="font-weight: 500; margin-bottom: 5px;">${comment.authorName}</div>
            <div style="font-size: 14px;">${comment.content}</div>
            <div style="font-size: 12px; color: #777; margin-top: 5px;">${getTimeAgo(new Date(comment.createdAt))}</div>
        `;
        commentsList.appendChild(commentItem);
    });
}

// 모임 신청 확인
async function confirmApply() {
    try {
        const response = await fetch(`${API_BASE}/meetings/${currentMeetingId}/apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getAuthHeader()
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('로그인이 필요합니다.');
                window.location.href = '/auth';
                return;
            }
            throw new Error('신청에 실패했습니다.');
        }

        alert('모임 신청이 완료되었습니다. 호스트의 승인을 기다려주세요.');
        closeModal();

        // UI 업데이트
        const applyBtn = document.getElementById('applyBtn');
        applyBtn.innerHTML = '<span>⏰</span> 신청 대기 중';
        applyBtn.disabled = true;

    } catch (error) {
        console.error('신청 실패:', error);
        alert('신청 처리 중 오류가 발생했습니다.');
    }
}

// 게시글 작성
async function submitPost() {
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();

    if (!title || !content) {
        alert('제목과 내용을 모두 입력해주세요.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/meetings/${currentMeetingId}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getAuthHeader()
            },
            body: JSON.stringify({ title, content })
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('로그인이 필요합니다.');
                window.location.href = '/auth';
                return;
            }
            throw new Error('게시글 작성에 실패했습니다.');
        }

        alert('게시글이 작성되었습니다.');
        closeModal();
        loadPosts();

    } catch (error) {
        console.error('게시글 작성 실패:', error);
        alert('게시글 작성 중 오류가 발생했습니다.');
    }
}

// 페이지 로드 시 초기화 (개선)
document.addEventListener('DOMContentLoaded', async () => {
    // URL에서 meetingId 추출
    const urlParams = new URLSearchParams(window.location.search);
    const pathParts = window.location.pathname.split('/');

    // /meetings/{id} 형태에서 ID 추출
    if (pathParts[1] === 'meetings' && pathParts[2]) {
        currentMeetingId = parseInt(pathParts[2]);
    } else {
        currentMeetingId = urlParams.get('id') || 1; // 기본값 1
    }

    console.log('현재 모임 ID:', currentMeetingId);

    // 사용자 정보 가져오기
    await getCurrentUser();

    // 데이터 로드
    await loadMeetingDetail();
    await loadParticipants();
    await loadPosts();
});

// API 호출 시 공통 에러 처리
async function apiCall(url, options = {}) {
    try {
        const defaultHeaders = {
            'Content-Type': 'application/json'
        };

        // 인증이 필요한 경우 Authorization 헤더 추가
        const token = localStorage.getItem('jwtToken');
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        });

        // 401 Unauthorized 처리
        if (response.status === 401) {
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('currentUser');
            alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
            window.location.href = '/auth';
            return null;
        }

        return response;
    } catch (error) {
        console.error('API 호출 오류:', error);
        throw error;
    }
}

// 모달 닫기
function closeModal() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.style.display = 'none';
    });

    // 폼 초기화
    document.getElementById('postTitle').value = '';
    document.getElementById('postContent').value = '';
    document.getElementById('newComment').value = '';
}

// 네비게이션 함수들
function goHome() {
    window.location.href = '/';
}

function goMyPage() {
    // 로그인 상태 확인
    if (userRole === 'guest') {
        alert('로그인이 필요한 서비스입니다.');
        window.location.href = '/auth';
        return;
    }
    window.location.href = '/mypage';
}

function createMeeting() {
    // 로그인 상태 확인
    if (userRole === 'guest') {
        alert('로그인이 필요한 서비스입니다.');
        window.location.href = '/auth';
        return;
    }
    window.location.href = '/createMeeting';
}

function logout() {
    // 로그인 상태 확인
    if (userRole === 'guest') {
        alert('이미 로그아웃 상태입니다.');
        return;
    }

    if (confirm('정말 로그아웃하시겠습니까?')) {
        // 로컬 스토리지에서 사용자 정보 제거
        localStorage.removeItem('currentUser');

        // 서버에 로그아웃 요청 (JWT 토큰 무효화 등)
        logoutFromServer();

        alert('로그아웃되었습니다.');
        window.location.href = '/';
    }
}

// 서버에 로그아웃 요청
async function logoutFromServer() {
    try {
        // JWT 토큰이 있는 경우 서버에 로그아웃 요청
        const token = localStorage.getItem('jwtToken');
        if (token) {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        }

        // JWT 토큰도 제거
        localStorage.removeItem('jwtToken');
    } catch (error) {
        console.error('서버 로그아웃 요청 실패:', error);
        // 서버 요청이 실패해도 클라이언트 측 로그아웃은 진행
    }
}

// 모달 외부 클릭 시 닫기
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal();
    }
});