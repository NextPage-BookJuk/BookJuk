// 전역 변수
window.currentMeetingId = null;
window.currentUserId = null;
window.userRole = 'guest';
window.currentPostId = null;
window.currentMeetingLocation = null;

/**
 * 로컬스토리지에서 JWT 토큰 추출 (키: authToken)
 */
function getJwtTokenFromLocalStorage() {
    const token = localStorage.getItem('authToken');
    return token && token.trim() !== '' ? token : null;
}

/**
 * 로그인 상태 확인
 */
function checkLoginStatus() {
    const token = getJwtTokenFromLocalStorage();
    return token !== null && token.trim() !== '';
}

/**
 * 로그인이 필요한 작업인지 확인
 */
function requireLogin(action) {
    if (!checkLoginStatus()) {
        if (confirm(`${action}을 위해서는 로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?`)) {
            window.location.href = '/auth';
        }
        return false;
    }
    return true;
}

/**
 * API 요청 헬퍼 함수
 */
async function apiRequest(endpoint, options = {}) {
    const token = getJwtTokenFromLocalStorage();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers
    };

    console.log(`API 요청: ${options.method || 'GET'} ${endpoint}`);

    try {
        const response = await fetch(endpoint, config);

        // 인증 오류 처리
        if (response.status === 401) {
            alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
            localStorage.removeItem('authToken');
            localStorage.removeItem('userInfo');
            window.location.href = '/auth';
            throw new Error('Unauthorized');
        }

        // 권한 오류 처리
        if (response.status === 403) {
            alert('이 작업을 수행할 권한이 없습니다.');
            throw new Error('Forbidden');
        }

        return response;
    } catch (error) {
        console.error('API 요청 실패:', error);
        throw error;
    }
}

/**
 * 현재 사용자 정보 가져오기
 */
async function getCurrentUser() {
    try {
        if (!checkLoginStatus()) {
            window.currentUserId = null;
            window.userRole = 'guest';
            updateUIByUserRole();
            return null;
        }

        const response = await apiRequest('/api/auth/me');

        if (response.ok) {
            const user = await response.json();
            window.currentUserId = user.id || user.userId;
            window.userRole = user.role || 'member';

            // 사용자 정보를 로컬스토리지에 저장
            localStorage.setItem('userInfo', JSON.stringify(user));

            console.log('현재 사용자:', user);
            return user;
        }
    } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        window.currentUserId = null;
        window.userRole = 'guest';
    }

    updateUIByUserRole();
    return null;
}

/**
 * 모임 상세 정보 로드
 */
async function loadMeetingDetail() {
    try {
        console.log('모임 상세 정보 로드 시작', 'meetingId:', window.currentMeetingId);

        const response = await apiRequest(`/api/meetings/${window.currentMeetingId}`);

        if (response.ok) {
            const meeting = await response.json();
            console.log('모임 정보 로드 성공:', meeting);

            updateMeetingInfo(meeting);
            checkUserRole(meeting);

            // 로그인된 사용자의 참여 상태 확인
            if (window.currentUserId) {
                await checkParticipationStatus();
            }
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('모임 정보 로드 실패:', error);
        alert('모임 정보를 불러오는데 실패했습니다.');
    }
}

/**
 * 사용자 역할 확인
 */
function checkUserRole(meeting) {
    console.log('사용자 역할 확인:', {
        currentUserId: window.currentUserId,
        hostId: meeting.hostId || meeting.host?.id,
        userRole: window.userRole
    });

    const hostId = meeting.hostId || meeting.host?.id;

    if (window.currentUserId && window.currentUserId === hostId) {
        window.userRole = 'host';
        console.log('호스트로 설정됨');
    } else if (window.currentUserId) {
        window.userRole = 'member';
        console.log('멤버로 설정됨');
    } else {
        window.userRole = 'guest';
        console.log('게스트로 설정됨');
    }

    updateUIByUserRole();

    // 역할이 설정된 후 상세주소 업데이트
    const updateElement = (id, content) => {
        const element = document.getElementById(id);
        if (element) element.textContent = content;
    };

    if (window.userRole === 'host' || window.userRole === 'participant') {
        // 상세주소 직접 파싱
        let detailAddress = '상세주소 미제공';

        if (meeting.location && meeting.location.trim()) {
            const parts = meeting.location.trim().split(' ');
            if (parts.length >= 3) {
                detailAddress = parts[parts.length - 1]; // "한국은행"
            }
        }

        console.log('상세주소 설정:', detailAddress);
        updateElement('meeting-address', detailAddress);
    } else {
        updateElement('meeting-address', '참여 후 확인 가능');
    }
}

/**
 * 참여 상태 확인
 */
async function checkParticipationStatus() {
    if (!window.currentUserId || window.userRole === 'host') return;

    try {
        const response = await apiRequest(`/api/meetings/${window.currentMeetingId}/participants`);

        if (response.ok) {
            const participants = await response.json();

            // 현재 사용자의 참여 상태 찾기
            const myParticipation = participants.find(p => p.id === window.currentUserId);

            if (myParticipation) {
                updateParticipationUI(myParticipation.status);
            }
        }
    } catch (error) {
        console.log('참여 상태 확인 실패:', error.message);
    }
}

/*
* 참여 상태에 따른 UI 업데이트
*/
function updateParticipationUI(status) {
    const applyBtn = document.getElementById('applyBtn');
    if (!applyBtn) return;

    switch (status) {
        case 'PENDING':
            applyBtn.innerHTML = '<span>⏰</span> 승인 대기중';
            applyBtn.disabled = true;
            applyBtn.className = 'btn btn-warning btn-full';
            break;

        case 'APPROVED':
            window.userRole = 'participant';
            applyBtn.innerHTML = '<span>✓</span> 참여 확정';
            applyBtn.disabled = true;
            applyBtn.className = 'btn btn-success btn-full';
            updateUIByUserRole();
            // 참가자가 되었으므로 상세주소 업데이트 (기존 저장된 정보 사용)
            updateDetailAddress();
            break;

        case 'REJECTED':
            applyBtn.innerHTML = '<span>✗</span> 참여 거절됨';
            applyBtn.disabled = true;
            applyBtn.className = 'btn btn-danger btn-full';
            break;

        default:
            applyBtn.innerHTML = '<span>✋</span> 모임 신청';
            applyBtn.disabled = false;
            applyBtn.className = 'btn btn-primary btn-full';
    }
}

/**
 * 역할별 UI 업데이트
 */
function updateUIByUserRole() {
    console.log('UI 업데이트 시작:', {
        userRole: window.userRole,
        currentUserId: window.currentUserId,
        isLoggedIn: checkLoginStatus()
    });

    const isHost = window.userRole === 'host';
    const isParticipant = window.userRole === 'participant';
    const isGuest = window.userRole === 'guest';
    const isMember = window.userRole === 'member';

    // 버튼들 가져오기
    const editBtn = document.getElementById('editBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const applyBtn = document.getElementById('applyBtn');
    const writeBtn = document.getElementById('writeBtn');
    const pendingRequests = document.getElementById('pending-requests');

    // 모든 버튼 초기화
    [editBtn, cancelBtn, applyBtn, writeBtn].forEach(btn => {
        if (btn) btn.style.display = 'none';
    });

    if (pendingRequests) pendingRequests.style.display = 'none';

    // 역할별 UI 설정
    if (isHost) {
        console.log('호스트 UI 설정');
        if (editBtn) {
            editBtn.style.display = 'inline-flex';
            editBtn.onclick = editMeeting;
        }
        if (cancelBtn) {
            cancelBtn.style.display = 'inline-flex';
            cancelBtn.onclick = cancelMeeting;
        }
        if (writeBtn) {
            writeBtn.style.display = 'inline-flex';
            writeBtn.onclick = openWriteModal;
        }
        if (pendingRequests) {
            pendingRequests.style.display = 'block';
            loadPendingRequests();
        }
    } else if (isParticipant) {
        console.log('참가자 UI 설정');
        if (writeBtn) {
            writeBtn.style.display = 'inline-flex';
            writeBtn.onclick = openWriteModal;
        }
    } else if (isGuest) {
        console.log('게스트 UI 설정');
        if (applyBtn) {
            applyBtn.style.display = 'inline-flex';
            applyBtn.innerHTML = '<span>✋</span> 모임 신청';
            applyBtn.disabled = false;
            applyBtn.onclick = applyToMeeting;
        }
    } else { // member
        console.log('멤버 UI 설정');
        if (writeBtn) {
            writeBtn.style.display = 'inline-flex';
            writeBtn.onclick = openWriteModal;
        }
        if (applyBtn) {
            applyBtn.style.display = 'inline-flex';
            applyBtn.innerHTML = '<span>✋</span> 모임 신청';
            applyBtn.disabled = false;
            applyBtn.onclick = applyToMeeting;
        }
    }

    updateNavigationHeader();

    // 역할 변경 시에는 meeting 객체 없이 호출 (기존 저장된 정보 사용)
    updateDetailAddress();
}

/**
 * 상세주소 업데이트 함수 (meeting 객체 선택적 사용)
 */
function updateDetailAddress(meeting = null) {
    const updateElement = (id, content) => {
        const element = document.getElementById(id);
        if (element) element.textContent = content;
    };

    if (window.userRole === 'host' || window.userRole === 'participant') {
        let detailAddress = '상세주소 미제공';

        // meeting 객체가 전달된 경우 직접 파싱 (가장 우선)
        if (meeting && meeting.location) {
            const parts = meeting.location.split(' ');
            if (parts.length >= 3) {
                detailAddress = parts[parts.length - 1];
                // 파싱한 결과를 전역 변수에 저장
                window.currentDetailAddress = detailAddress;
            }
        }
        // meeting 객체가 없으면 기존 저장된 정보 사용
        else if (window.currentDetailAddress) {
            detailAddress = window.currentDetailAddress;
        }

        console.log('상세주소 설정:', detailAddress, 'for role:', window.userRole);
        updateElement('meeting-address', detailAddress);
    } else {
        console.log('게스트/멤버 - 참여 후 확인 가능');
        updateElement('meeting-address', '참여 후 확인 가능');
    }
}

/**
 * 모임 정보 UI 업데이트
 */
function updateMeetingInfo(meeting) {
    const updateElement = (id, content) => {
        const element = document.getElementById(id);
        if (element) element.textContent = content;
    };

    const updateAttribute = (id, attr, value) => {
        const element = document.getElementById(id);
        if (element) element.setAttribute(attr, value);
    };

    // 기본 정보 업데이트 (안전하게 처리)
    updateElement('breadcrumb-title', meeting.title || '모임');
    updateElement('meeting-title', meeting.title || '모임 제목');
    updateElement('book-title', meeting.bookTitle || '도서 제목');
    updateElement('book-author', meeting.bookAuthor || '저자');

    // 날짜 포맷팅 (안전하게 처리)
    if (meeting.meetingTime) {
        const meetingDate = new Date(meeting.meetingTime);
        updateElement('meeting-date', formatDate(meetingDate));
    }

    // 위치 정보 구성 - location 필드 파싱
    let meetingLocation = '위치 정보 없음';
    let detailAddress = '상세주소 미제공';

    if (meeting.location) {
        // "경상남도 거창군 한국은행"을 공백으로 분리
        const parts = meeting.location.split(' ');

        if (parts.length >= 3) {
            // 마지막 부분을 상세주소로, 나머지를 일반 위치로
            detailAddress = parts[parts.length - 1]; // "한국은행"
            meetingLocation = parts.slice(0, -1).join(' '); // "경상남도 거창군"
        } else {
            meetingLocation = meeting.location;
        }
    }

    updateElement('meeting-location', meetingLocation);

    // 전역 변수에 위치 정보 저장 (게시글에서 사용)
    window.currentMeetingLocation = meetingLocation;

    // 상세주소를 전역 변수에 저장 (checkUserRole에서 사용)
    window.currentDetailAddress = detailAddress;

    updateElement('meeting-genre', meeting.genre ? `장르: ${meeting.genre}` : '장르: 미분류');

    // 호스트 정보 (안전하게 처리)
    if (meeting.host) {
        updateElement('host-avatar', meeting.host.username ? meeting.host.username.charAt(0) : '?');
        updateElement('host-name', `${meeting.host.username || '호스트'} (호스트)`);
        updateElement('host-stats', `받은 좋아요 ${meeting.host.likesCount || 0}개 · 주최 모임 ${meeting.host.hostedMeetingsCount || 0}회`);
    }

    // 참여자 수 정보 - 정확한 현재 참여자 수 반영
    const maxParticipants = meeting.maxParticipants || 0;
    const currentParticipants = meeting.currentParticipants || 0;

    // 상태 정보 업데이트
    updateElement('status-value', getStatusText(meeting.meetingStatus || meeting.status));
    updateElement('remaining-slots', `${Math.max(0, maxParticipants - currentParticipants)}자리`);

    // 최대 참여자 수 저장
    updateAttribute('participants-count', 'data-max-participants', maxParticipants);

    // 참여자 수 표시도 업데이트
    updateElement('participants-count', `${currentParticipants}/${maxParticipants}명`);

    // 마감일 설정 (모임 시간이 있는 경우만)
    if (meeting.meetingTime) {
        const deadline = new Date(meeting.meetingTime);
        deadline.setHours(deadline.getHours() - 1);
        updateElement('deadline', formatDate(deadline));
    }

    // 상태 배지 업데이트
    updateStatusBadges(meeting);

    // 이미지 설정
    const imageElement = document.getElementById('meeting-image');
    if (imageElement && meeting.imageUrl) {
        imageElement.style.backgroundImage = `url(${meeting.imageUrl})`;
        imageElement.style.backgroundSize = 'cover';
        imageElement.style.backgroundPosition = 'center';
    }

    // 페이지 제목 업데이트
    document.title = `${meeting.title || '모임'} - 북적북적`;

    // 원본 모임 데이터를 전역 변수에 저장 (수정에서 사용)
    window.currentMeetingData = meeting;
}

/**
 * 날짜 포맷팅 함수
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
}

/**
 * 상태 텍스트 변환
 */
function getStatusText(status) {
    if (!status) return '상태 정보 없음';

    const statusMap = {
        'RECRUITING': '모집 중',
        'FULL': '모집 마감',
        'COMPLETED': '종료',
        'CANCELLED': '취소됨'
    };
    return statusMap[status] || status;
}

/**
 * 상태 배지 업데이트
 */
function updateStatusBadges(meeting) {
    const badgesContainer = document.getElementById('status-badges');
    if (!badgesContainer) return;

    badgesContainer.innerHTML = '';

    // 모집 상태 배지 (status가 있는 경우만)
    const status = meeting.meetingStatus || meeting.status;
    if (status) {
        const statusBadge = document.createElement('span');
        statusBadge.className = `status-tag status-${status.toLowerCase()}`;
        statusBadge.textContent = getStatusText(status);
        badgesContainer.appendChild(statusBadge);
    }

    // 장르 배지 (genre가 있는 경우만)
    if (meeting.genre) {
        const genreBadge = document.createElement('span');
        genreBadge.className = 'status-tag genre-tag';
        genreBadge.textContent = meeting.genre;
        badgesContainer.appendChild(genreBadge);
    }
}

/**
 * 네비게이션 헤더 업데이트
 */
function updateNavigationHeader() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    const isLoggedIn = checkLoginStatus();
    const userInfo = localStorage.getItem('userInfo');
    const user = userInfo ? JSON.parse(userInfo) : null;

    if (!isLoggedIn) {
        nav.innerHTML = `
            <a href="/">홈</a>
            <a href="/auth">로그인</a>
            <a href="/createMeeting" class="create-meeting-btn">모임 만들기</a>
        `;
    } else {
        const username = user?.username || '사용자';
        nav.innerHTML = `
            <a href="/">홈</a>
            <a href="/mypage">마이페이지</a>
            <a href="/createMeeting" class="create-meeting-btn">모임 만들기</a>
            <span style="color: #555; margin-right: 10px;">안녕하세요, ${username}님!</span>
            <a href="#" onclick="logout()">로그아웃</a>
        `;
    }
}

/**
 * 모임 신청
 */
function applyToMeeting() {
    if (!requireLogin('모임 신청')) return;
    showModal('apply-modal');
}

/**
 * 모임 신청 확인
 */
async function confirmApply() {
    const applyBtn = document.getElementById('applyBtn');

    try {
        if (applyBtn) {
            applyBtn.disabled = true;
            applyBtn.innerHTML = '<span>⚿</span> 신청 중...';
        }

        const response = await apiRequest(`/api/meetings/${window.currentMeetingId}/apply`, {
            method: 'POST'
        });

        if (response.ok) {
            alert('모임 신청이 완료되었습니다! 호스트의 승인을 기다려주세요.');
            hideModal('apply-modal');
            updateParticipationUI('PENDING');
        } else {
            const errorData = await response.text();
            throw new Error(errorData || '신청 처리에 실패했습니다.');
        }
    } catch (error) {
        console.error('모임 신청 실패:', error);
        alert('모임 신청에 실패했습니다: ' + error.message);

        if (applyBtn) {
            applyBtn.disabled = false;
            applyBtn.innerHTML = '<span>✋</span> 모임 신청';
        }
    }
}

/**
 * 글쓰기 모달 열기
 */
function openWriteModal() {
    if (!requireLogin('글 작성')) return;

    if (window.userRole === 'guest') {
        alert('이 모임의 참여자만 글을 작성할 수 있습니다.');
        return;
    }

    // 폼 초기화
    const titleInput = document.getElementById('postTitle');
    const contentInput = document.getElementById('postContent');

    if (titleInput) titleInput.value = '';
    if (contentInput) contentInput.value = '';

    showModal('write-modal');
}

/**
 * 게시글 작성
 */
async function submitPost() {
    const titleElement = document.getElementById('postTitle');
    const contentElement = document.getElementById('postContent');
    const submitBtn = document.querySelector('#write-modal .btn-primary');

    if (!titleElement || !contentElement) {
        alert('입력 필드를 찾을 수 없습니다.');
        return;
    }

    const title = titleElement.value.trim();
    const content = contentElement.value.trim();

    // 유효성 검사
    if (!title) {
        alert('제목을 입력해주세요.');
        titleElement.focus();
        return;
    }

    if (!content) {
        alert('내용을 입력해주세요.');
        contentElement.focus();
        return;
    }

    if (title.length > 200) {
        alert('제목은 200자 이내로 입력해주세요.');
        return;
    }

    if (content.length > 2000) {
        alert('내용은 2000자 이내로 입력해주세요.');
        return;
    }

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = '게시 중...';
        }

        const response = await apiRequest(`/api/meetings/${window.currentMeetingId}/posts`, {
            method: 'POST',
            body: JSON.stringify({ title, content })
        });

        if (response.ok) {
            alert('게시글이 작성되었습니다.');
            hideModal('write-modal');
            loadPosts(); // 게시글 목록 새로고침
        } else {
            const errorData = await response.text();
            throw new Error(errorData || '게시글 작성에 실패했습니다.');
        }
    } catch (error) {
        console.error('게시글 작성 실패:', error);
        alert('게시글 작성에 실패했습니다: ' + error.message);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '게시';
        }
    }
}

/**
 * 참가자 목록 로드
 */
async function loadParticipants() {
    const loadingElement = document.getElementById('participants-loading');
    const listElement = document.getElementById('participants-list');

    try {
        if (loadingElement) loadingElement.style.display = 'block';
        if (listElement) listElement.innerHTML = '';

        const response = await apiRequest(`/api/meetings/${window.currentMeetingId}/participants?status=APPROVED`);

        if (response.ok) {
            const participants = await response.json();

            if (listElement) {
                listElement.innerHTML = '';

                if (participants.length === 0) {
                    listElement.innerHTML = `
                        <div style="text-align: center; color: #777; padding: 20px;">
                            아직 참여자가 없습니다.
                        </div>
                    `;
                } else {
                    participants.forEach(participant => {
                        const item = createParticipantItem(participant);
                        listElement.appendChild(item);
                    });
                }
            }

            // 참여자 수 업데이트 - 실제 참여자 수로 UI 갱신
            updateParticipantCount(participants.length);
        }
    } catch (error) {
        console.error('참가자 목록 로드 실패:', error);

        if (listElement) {
            listElement.innerHTML = `
                <div style="text-align: center; color: #dc3545; padding: 20px;">
                    참가자 목록을 불러오는데 실패했습니다.
                </div>
            `;
        }
    } finally {
        if (loadingElement) loadingElement.style.display = 'none';
    }
}

/**
 * 참가자 아이템 생성
 */
function createParticipantItem(participant) {
    const item = document.createElement('div');
    item.className = 'participant-mini-item';

    const roleText = participant.role === 'HOST' ? '호스트' : '참여자';
    const roleClass = participant.role === 'HOST' ? 'host' : 'participant';

    // 호스트인 경우 거절 버튼 표시
    const actionButtons = window.userRole === 'host' && participant.role !== 'HOST' ? `
        <div class="participant-actions">
            <button class="btn btn-danger btn-sm participant-reject-btn" onclick="kickParticipant(${participant.id})" title="내보내기">
                ✗
            </button>
        </div>
    ` : '';

    item.innerHTML = `
        <div class="participant-mini-avatar ${roleClass}">${participant.username.charAt(0)}</div>
        <div class="participant-mini-info">
            <div class="participant-mini-name">${escapeHtml(participant.username)}</div>
            <div class="participant-mini-status">${roleText}</div>
        </div>
        ${actionButtons}
    `;

    return item;
}

/**
 * 참가자 내보내기 (호스트 전용)
 */
async function kickParticipant(userId) {
    if (window.userRole !== 'host') {
        alert('호스트만 참가자를 내보낼 수 있습니다.');
        return;
    }

    if (!confirm('정말로 이 참가자를 내보내시겠습니까?')) return;

    try {
        const response = await apiRequest(`/api/meetings/${window.currentMeetingId}/participants/${userId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('참가자를 내보냈습니다.');
            loadParticipants(); // 참가자 목록 새로고침
            loadMeetingDetail(); // 모임 정보도 새로고침 (참여자 수 업데이트)
        } else {
            const errorData = await response.text();
            throw new Error(errorData || '참가자 내보내기에 실패했습니다.');
        }
    } catch (error) {
        console.error('참가자 내보내기 실패:', error);
        alert('참가자 내보내기에 실패했습니다: ' + error.message);
    }
}

/**
 * 참여자 수 업데이트
 */
function updateParticipantCount(count) {
    const countElement = document.getElementById('participants-count');
    const remainingElement = document.getElementById('remaining-slots');

    // 현재 모임 정보에서 최대 참여자 수 가져오기
    const maxParticipants = parseInt(document.querySelector('[data-max-participants]')?.getAttribute('data-max-participants')) || 8;

    if (countElement) {
        countElement.textContent = `${count}/${maxParticipants}명`;
    }

    if (remainingElement) {
        const remaining = Math.max(0, maxParticipants - count);
        remainingElement.textContent = `${remaining}자리`;

        // 자리가 없으면 신청 버튼 비활성화
        const applyBtn = document.getElementById('applyBtn');
        if (applyBtn && remaining === 0 && window.userRole !== 'participant') {
            applyBtn.disabled = true;
            applyBtn.innerHTML = '<span>✗</span> 모집 마감';
            applyBtn.className = 'btn btn-secondary btn-full';
        }
    }
}

/**
 * 대기 중인 참가신청 로드
 */
async function loadPendingRequests() {
    if (window.userRole !== 'host') return;

    const listElement = document.getElementById('pending-list');
    if (!listElement) return;

    try {
        const response = await apiRequest(`/api/meetings/${window.currentMeetingId}/participants?status=PENDING`);

        if (response.ok) {
            const pendingParticipants = await response.json();

            listElement.innerHTML = '';

            if (pendingParticipants.length === 0) {
                listElement.innerHTML = `
                    <div style="text-align: center; color: #777; padding: 20px;">
                        대기 중인 신청이 없습니다.
                    </div>
                `;
            } else {
                pendingParticipants.forEach(participant => {
                    const item = createPendingItem(participant);
                    listElement.appendChild(item);
                });
            }
        }
    } catch (error) {
        console.error('대기 목록 로드 실패:', error);
        listElement.innerHTML = `
            <div style="text-align: center; color: #dc3545; padding: 20px;">
                대기 목록을 불러오는데 실패했습니다.
            </div>
        `;
    }
}

/**
 * 대기 아이템 생성
 */
function createPendingItem(participant) {
    const item = document.createElement('div');
    item.className = 'pending-item';

    item.innerHTML = `
        <div class="pending-info">
            <div class="pending-avatar">${participant.username.charAt(0)}</div>
            <div class="pending-name">${escapeHtml(participant.username)}</div>
        </div>
        <div class="pending-actions">
            <button class="btn btn-success btn-sm" onclick="approveParticipant(${participant.id})" title="승인">
                ✓
            </button>
            <button class="btn btn-danger btn-sm" onclick="rejectParticipant(${participant.id})" title="거절">
                ✗
            </button>
        </div>
    `;

    return item;
}

/**
 * 참가자 승인
 */
async function approveParticipant(userId) {
    try {
        const response = await apiRequest(`/api/meetings/${window.currentMeetingId}/participants/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify({ action: 'APPROVE' })
        });

        if (response.ok) {
            alert('참가자를 승인했습니다.');

            // 목록 새로고침
            loadPendingRequests();
            loadParticipants();
            loadMeetingDetail();
        } else {
            const errorData = await response.text();
            throw new Error(errorData || '승인 처리에 실패했습니다.');
        }
    } catch (error) {
        console.error('승인 실패:', error);
        alert('승인 처리에 실패했습니다: ' + error.message);
    }
}

/**
 * 참가자 거절
 */
async function rejectParticipant(userId) {
    if (!confirm('정말로 이 참가신청을 거절하시겠습니까?')) return;

    try {
        const response = await apiRequest(`/api/meetings/${window.currentMeetingId}/participants/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify({ action: 'REJECT' })
        });

        if (response.ok) {
            alert('참가신청을 거절했습니다.');
            loadPendingRequests();
        } else {
            const errorData = await response.text();
            throw new Error(errorData || '거절 처리에 실패했습니다.');
        }
    } catch (error) {
        console.error('거절 실패:', error);
        alert('거절 처리에 실패했습니다: ' + error.message);
    }
}

/**
 * 게시글 목록 로드
 */
async function loadPosts() {
    const loadingElement = document.getElementById('posts-loading');
    const listElement = document.getElementById('posts-list');
    const statsElement = document.getElementById('board-stats');

    try {
        if (loadingElement) loadingElement.style.display = 'block';
        if (listElement) listElement.innerHTML = '';

        // 백엔드 API: page는 1부터 시작
        const response = await apiRequest(`/api/meetings/${window.currentMeetingId}/posts?page=1&size=20`);

        if (response.ok) {
            const postsData = await response.json();

            if (statsElement) {
                const totalPosts = postsData.totalElements || 0;
                statsElement.textContent = `총 ${totalPosts}개의 게시글`;
            }

            if (listElement) {
                listElement.innerHTML = '';

                const posts = postsData.content || [];

                if (posts.length === 0) {
                    listElement.innerHTML = `
                        <div style="text-align: center; color: #777; padding: 40px;">
                            <div style="font-size: 48px; margin-bottom: 20px;">📝</div>
                            <div style="font-size: 18px; margin-bottom: 10px;">아직 작성된 글이 없습니다</div>
                            <div style="font-size: 14px; color: #999;">첫 번째 글을 작성해보세요!</div>
                        </div>
                    `;
                } else {
                    posts.forEach(post => {
                        const item = createPostItem(post);
                        listElement.appendChild(item);
                    });
                }
            }
        }
    } catch (error) {
        console.error('게시글 로드 실패:', error);

        if (listElement) {
            listElement.innerHTML = `
                <div style="text-align: center; color: #dc3545; padding: 40px;">
                    게시글을 불러오는데 실패했습니다.
                    <br><button class="btn btn-secondary" onclick="loadPosts()" style="margin-top: 10px;">다시 시도</button>
                </div>
            `;
        }
    } finally {
        if (loadingElement) loadingElement.style.display = 'none';
    }
}

/**
 * 게시글 아이템 생성 (위치 정보 제거)
 */
function createPostItem(post) {
    const item = document.createElement('div');
    item.className = 'post-item';
    item.onclick = () => viewPostDetail(post);

    const timeAgo = getTimeAgo(new Date(post.createdAt));
    const truncatedContent = truncateText(post.content, 100);

    // PostResponse 또는 PostDetailResponse 구조에 맞춰 처리
    const authorName = post.username || post.authorName || '작성자';
    const commentCount = post.commentCount || 0;

    item.innerHTML = `
        <div class="post-header">
            <div>
                <div class="post-title">${escapeHtml(post.title)}</div>
                <div class="post-meta">
                    <div class="post-author">
                        <div class="author-avatar">${authorName.charAt(0)}</div>
                        <span>${escapeHtml(authorName)}</span>
                    </div>
                    <span>•</span>
                    <span>${timeAgo}</span>
                </div>
            </div>
        </div>
        <div class="post-content">${escapeHtml(truncatedContent)}</div>
        <div class="post-stats">
            <div class="post-stat-item">
                <span>💬</span>
                <span>댓글 ${commentCount}</span>
            </div>
        </div>
    `;

    return item;
}

/**
 * 게시글 상세 보기
 */
async function viewPostDetail(post) {
    try {
        // 상세 정보 로드
        const response = await apiRequest(`/api/meetings/${window.currentMeetingId}/posts/${post.postId}`);

        if (response.ok) {
            const detailData = await response.json();
            showPostDetailModal(detailData);
        } else {
            // 기본 정보로 모달 표시
            showPostDetailModal(post);
        }
    } catch (error) {
        console.error('게시글 상세 로드 실패:', error);
        showPostDetailModal(post);
    }
}

/**
 * 게시글 상세 모달 표시
 */
function showPostDetailModal(post) {
    const modal = document.getElementById('post-detail-modal');
    if (!modal) return;

    // 모달 내용 업데이트
    const titleElement = modal.querySelector('#postDetailTitle');
    const metaElement = modal.querySelector('#postDetailMeta');
    const contentElement = modal.querySelector('#postDetailContent');

    if (titleElement) titleElement.textContent = post.title;
    if (contentElement) contentElement.textContent = post.content;

    if (metaElement) {
        const authorName = post.username || post.authorName || '작성자';
        metaElement.innerHTML = `
            <div class="post-author">
                <div class="author-avatar">${authorName.charAt(0)}</div>
                <span>${escapeHtml(authorName)}</span>
            </div>
            <span>•</span>
            <span>${formatDate(new Date(post.createdAt))}</span>
        `;
    }

    // 댓글 로드
    loadPostComments(post);

    // 현재 게시글 ID 설정
    window.currentPostId = post.postId;

    showModal('post-detail-modal');
}

/**
 * 게시글 댓글 로드
 */
async function loadPostComments(post) {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;

    try {
        // API에서 댓글을 별도로 가져오기
        const response = await apiRequest(`/api/meetings/${window.currentMeetingId}/posts/${post.postId}/comments`);

        if (response.ok) {
            const comments = await response.json();
            displayComments(comments);
        } else {
            // 백엔드 API 응답에 댓글이 포함되어 있는 경우
            if (post.comments && Array.isArray(post.comments)) {
                displayComments(post.comments);
            } else {
                commentsList.innerHTML = '<div style="text-align: center; color: #777; padding: 20px;">아직 댓글이 없습니다.</div>';
            }
        }
    } catch (error) {
        console.error('댓글 로드 실패:', error);
        // fallback: post 객체에 포함된 댓글 사용
        if (post.comments && Array.isArray(post.comments)) {
            displayComments(post.comments);
        } else {
            commentsList.innerHTML = '<div style="text-align: center; color: #777; padding: 20px;">댓글을 불러오는데 실패했습니다.</div>';
        }
    }
}

/**
 * 댓글 표시
 */
function displayComments(comments) {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;

    commentsList.innerHTML = '';

    if (comments.length === 0) {
        commentsList.innerHTML = '<div style="text-align: center; color: #777; padding: 20px;">아직 댓글이 없습니다.</div>';
        return;
    }

    comments.forEach(comment => {
        const commentItem = document.createElement('div');
        commentItem.className = 'comment-item';
        commentItem.style.cssText = `
            padding: 15px;
            background-color: #f8f6f3;
            border-radius: 8px;
            margin-bottom: 10px;
            border-left: 3px solid #8b7355;
        `;

        const authorName = comment.username || comment.authorName || '작성자';
        commentItem.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <div style="width: 24px; height: 24px; background-color: #8b7355; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; color: white; margin-right: 8px;">
                    ${authorName.charAt(0)}
                </div>
                <span style="font-weight: 500; margin-right: 10px;">${escapeHtml(authorName)}</span>
                <span style="font-size: 12px; color: #777;">${getTimeAgo(new Date(comment.createdAt))}</span>
            </div>
            <div style="font-size: 14px; line-height: 1.4; margin-left: 32px;">${escapeHtml(comment.content)}</div>
        `;

        commentsList.appendChild(commentItem);
    });
}

/**
 * 댓글 작성
 */
async function addComment() {
    if (!requireLogin('댓글 작성')) return;

    const commentInput = document.getElementById('newComment');
    const submitBtn = document.querySelector('#comment-form button');

    if (!commentInput) return;

    const content = commentInput.value.trim();
    if (!content) {
        alert('댓글 내용을 입력해주세요.');
        commentInput.focus();
        return;
    }

    if (content.length > 500) {
        alert('댓글은 500자 이내로 입력해주세요.');
        return;
    }

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = '작성 중...';
        }

        const response = await apiRequest(`/api/meetings/${window.currentMeetingId}/posts/${window.currentPostId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });

        if (response.ok) {
            alert('댓글이 작성되었습니다.');
            commentInput.value = '';

            // 게시글 다시 로드하여 댓글 새로고침
            const currentPost = { postId: window.currentPostId };
            await viewPostDetail(currentPost);

            // 메인 게시글 목록도 새로고침 (댓글 카운트 업데이트)
            await loadPosts();
        } else {
            const errorData = await response.text();
            throw new Error(errorData || '댓글 작성에 실패했습니다.');
        }
    } catch (error) {
        console.error('댓글 작성 실패:', error);
        alert('댓글 작성에 실패했습니다: ' + error.message);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '댓글 작성';
        }
    }
}

/**
 * 유틸리티 함수들
 */
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
    return date.toLocaleDateString();
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 모달 관리 함수들
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeModal() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.style.display = 'none';
    });
}

/**
 * 네비게이션 함수들
 */
function goHome() {
    window.location.href = '/';
}

function goToLogin() {
    window.location.href = '/auth';
}

function goMyPage() {
    if (!checkLoginStatus()) {
        alert('로그인이 필요한 서비스입니다.');
        window.location.href = '/auth';
        return;
    }
    window.location.href = '/mypage';
}

function createMeeting() {
    if (!checkLoginStatus()) {
        alert('로그인이 필요한 서비스입니다.');
        window.location.href = '/auth';
        return;
    }

    window.location.href = '/createMeeting';
}

function editMeeting() {
    if (!requireLogin('모임 수정')) return;
    if (window.userRole !== 'host') {
        alert('모임 수정은 호스트만 가능합니다.');
        return;
    }

    // 수정 모달 표시
    showEditModal();
}

/**
 * 수정 모달 표시
 */
function showEditModal() {
    const modal = document.getElementById('edit-modal');
    if (!modal) {
        createEditModal();
    }

    // 현재 모임 정보로 폼 채우기
    fillEditForm();
    showModal('edit-modal');
}

/**
 * 수정 모달 생성
 */
function createEditModal() {
    const modalHTML = `
        <div id="edit-modal" class="modal-overlay" style="display: none;">
            <div class="modal edit-modal">
                <div class="modal-header">
                    <h3>✏️ 모임 수정</h3>
                    <button onclick="closeModal()" class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <form id="edit-form">
                        <div class="form-row">
                            <div class="form-group full-width">
                                <label>📝 모임 제목</label>
                                <input type="text" id="edit-title" class="form-input" placeholder="모임 제목을 입력하세요" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group full-width">
                                <label>📖 모임 설명</label>
                                <textarea id="edit-description" class="form-textarea" rows="3" placeholder="모임에 대한 설명을 입력하세요"></textarea>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group half-width">
                                <label>📚 책 제목</label>
                                <input type="text" id="edit-bookTitle" class="form-input" placeholder="책 제목">
                            </div>
                            <div class="form-group half-width">
                                <label>✏️ 저자</label>
                                <input type="text" id="edit-bookAuthor" class="form-input" placeholder="저자명">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group half-width">
                                <label>🎭 장르</label>
                                <select id="edit-genre" class="form-select">
                                    <option value="">선택하세요</option>
                                    <option value="소설">소설</option>
                                    <option value="에세이">에세이</option>
                                    <option value="자기계발">자기계발</option>
                                    <option value="역사">역사</option>
                                    <option value="과학">과학</option>
                                    <option value="철학">철학</option>
                                    <option value="예술">예술</option>
                                </select>
                            </div>
                            <div class="form-group half-width">
                                <label>👥 최대 참여자 수</label>
                                <input type="number" id="edit-maxParticipants" class="form-input" min="2" max="20" placeholder="2-20명">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group half-width">
                                <label>📅 모임 날짜/시간</label>
                                <input type="datetime-local" id="edit-meetingTime" class="form-input">
                            </div>
                            <div class="form-group half-width">
                                <label>📍 상세 주소</label>
                                <input type="text" id="edit-detailAddress" class="form-input" placeholder="구체적인 모임 장소">
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">
                        <span>❌</span> 취소
                    </button>
                    <button type="button" class="btn btn-primary" onclick="submitEditForm()">
                        <span>💾</span> 수정 완료
                    </button>
                </div>
            </div>
        </div>

        <style>
        .edit-modal {
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            background: linear-gradient(135deg, #fff 0%, #f8f6f3 100%);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            border: 2px solid #8b7355;
        }

        .edit-modal .modal-header {
            background: linear-gradient(135deg, #8b7355 0%, #a0886b 100%);
            color: white;
            padding: 20px 25px;
            border-radius: 18px 18px 0 0;
            border-bottom: none;
        }

        .edit-modal .modal-header h3 {
            margin: 0;
            font-size: 1.4em;
            font-weight: 600;
        }

        .edit-modal .modal-close {
            background: rgba(255,255,255,0.2);
            color: white;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            width: 35px;
            height: 35px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .edit-modal .modal-close:hover {
            background: rgba(255,255,255,0.3);
            transform: rotate(90deg);
        }

        .edit-modal .modal-body {
            padding: 25px;
        }

        .form-row {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
        }

        .form-group.full-width {
            flex: 1;
        }

        .form-group.half-width {
            flex: 1;
        }

        .form-group label {
            font-weight: 600;
            color: #8b7355;
            margin-bottom: 8px;
            font-size: 0.95em;
        }

        .form-input, .form-textarea, .form-select {
            padding: 12px 15px;
            border: 2px solid #e0d6c8;
            border-radius: 10px;
            font-size: 14px;
            transition: all 0.3s ease;
            background: white;
        }

        .form-input:focus, .form-textarea:focus, .form-select:focus {
            outline: none;
            border-color: #8b7355;
            box-shadow: 0 0 0 3px rgba(139, 115, 85, 0.1);
            transform: translateY(-1px);
        }

        .form-textarea {
            resize: vertical;
            min-height: 80px;
        }

        .edit-modal .modal-footer {
            padding: 20px 25px;
            background: #f8f6f3;
            border-radius: 0 0 18px 18px;
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        }

        .edit-modal .btn {
            padding: 12px 24px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: none;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .edit-modal .btn-secondary {
            background: #6c757d;
            color: white;
        }

        .edit-modal .btn-secondary:hover {
            background: #5a6268;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
        }

        .edit-modal .btn-primary {
            background: linear-gradient(135deg, #8b7355 0%, #a0886b 100%);
            color: white;
        }

        .edit-modal .btn-primary:hover {
            background: linear-gradient(135deg, #7a6248 0%, #8f7a5e 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(139, 115, 85, 0.3);
        }

        @media (max-width: 768px) {
            .edit-modal {
                max-width: 95%;
                margin: 20px;
            }
            
            .form-row {
                flex-direction: column;
                gap: 0;
            }
            
            .form-group.half-width {
                margin-bottom: 20px;
            }
        }
        </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * 수정 폼에 현재 데이터 채우기
 */
function fillEditForm() {
    const meeting = window.currentMeetingData;
    if (!meeting) return;

    document.getElementById('edit-title').value = meeting.title || '';
    document.getElementById('edit-description').value = meeting.description || '';
    document.getElementById('edit-bookTitle').value = meeting.bookTitle || '';
    document.getElementById('edit-bookAuthor').value = meeting.bookAuthor || '';
    document.getElementById('edit-genre').value = meeting.genre || '';
    document.getElementById('edit-maxParticipants').value = meeting.maxParticipants || '';
    document.getElementById('edit-detailAddress').value = window.currentDetailAddress || '';

    // 날짜/시간 설정
    if (meeting.meetingTime) {
        const meetingDate = new Date(meeting.meetingTime);
        const localDateTime = new Date(meetingDate.getTime() - meetingDate.getTimezoneOffset() * 60000)
            .toISOString().slice(0, 16);
        document.getElementById('edit-meetingTime').value = localDateTime;
    }
}

/**
 * 수정 폼 제출 (수정된 버전)
 */
async function submitEditForm() {
    const title = document.getElementById('edit-title').value.trim();
    if (!title) {
        alert('모임 제목을 입력해주세요.');
        return;
    }

    // 수정할 데이터만 전송 (필수 필드 + 수정된 필드)
    const updateData = {
        title: title,
        description: document.getElementById('edit-description').value.trim(),
        bookTitle: document.getElementById('edit-bookTitle').value.trim(),
        bookAuthor: document.getElementById('edit-bookAuthor').value.trim(),
        genre: document.getElementById('edit-genre').value,
        maxParticipants: parseInt(document.getElementById('edit-maxParticipants').value) || window.currentMeetingData.maxParticipants,
        meetingTime: document.getElementById('edit-meetingTime').value
    };

    // 위치 정보 처리 (상세주소가 입력된 경우만)
    const detailAddress = document.getElementById('edit-detailAddress').value.trim();
    if (detailAddress && window.currentMeetingData && window.currentMeetingData.location) {
        const parts = window.currentMeetingData.location.split(' ');
        if (parts.length >= 3) {
            parts[parts.length - 1] = detailAddress;
            updateData.location = parts.join(' ');
        } else {
            updateData.location = `${window.currentMeetingLocation} ${detailAddress}`.trim();
        }
    }

    console.log('수정 데이터:', updateData);

    try {
        const submitBtn = document.querySelector('#edit-modal .btn-primary');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>⏳</span> 수정 중...';
        }

        const response = await apiRequest(`/api/meetings/${window.currentMeetingId}`, {
            method: 'PUT',  // PUT으로 변경
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        console.log('수정 응답 상태:', response.status);

        if (response.ok) {
            alert('모임이 수정되었습니다.');
            closeModal();
            // 페이지 새로고침하여 모든 정보 업데이트
            await loadMeetingDetail();
        } else {
            const errorText = await response.text();
            console.error('서버 에러 응답:', errorText);
            throw new Error(`모임 수정에 실패했습니다 (${response.status}): ${errorText}`);
        }
    } catch (error) {
        console.error('모임 수정 실패:', error);
        alert('모임 수정에 실패했습니다: ' + error.message);
    } finally {
        const submitBtn = document.querySelector('#edit-modal .btn-primary');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>💾</span> 수정 완료';
        }
    }
}

function cancelMeeting() {
    if (!requireLogin('모임 취소')) return;
    if (window.userRole !== 'host') {
        alert('모임 취소는 호스트만 가능합니다.');
        return;
    }
    if (confirm('정말로 모임을 취소하시겠습니까?\n취소된 모임은 복구할 수 없습니다.')) {
        alert('모임 취소 기능은 아직 구현 중입니다.');
    }
}

function logout() {
    if (!checkLoginStatus()) {
        alert('이미 로그아웃 상태입니다.');
        return;
    }

    if (confirm('정말 로그아웃하시겠습니까?')) {
        // 백엔드 로그아웃 API 호출
        apiRequest('/api/auth/logout', { method: 'POST' })
            .then(() => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userInfo');
                alert('로그아웃되었습니다.');
                window.location.href = '/';
            })
            .catch(() => {
                // 백엔드 오류가 있어도 클라이언트에서 로그아웃 처리
                localStorage.removeItem('authToken');
                localStorage.removeItem('userInfo');
                alert('로그아웃되었습니다.');
                window.location.href = '/';
            });
    }
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
    // 모달 관련 이벤트
    document.addEventListener('click', (e) => {
        // 모달 배경 클릭 시 닫기
        if (e.target.classList.contains('modal-overlay')) {
            closeModal();
        }

        // 모달 닫기 버튼
        if (e.target.matches('.modal .btn-secondary') &&
            (e.target.textContent.includes('취소') || e.target.textContent.includes('닫기'))) {
            closeModal();
        }
    });

    // 키보드 이벤트
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

/**
 * 페이지 초기화
 */
async function initializePage() {
    console.log('페이지 초기화 시작');

    try {
        // URL에서 모임 ID 추출
        const urlParams = new URLSearchParams(window.location.search);
        const pathParts = window.location.pathname.split('/');

        if (pathParts[1] === 'meetings' && pathParts[2]) {
            window.currentMeetingId = parseInt(pathParts[2]);
        } else {
            window.currentMeetingId = parseInt(urlParams.get('id')) || 1;
        }

        console.log('모임 ID:', window.currentMeetingId);

        // 이벤트 리스너 설정
        setupEventListeners();

        // 사용자 정보 로드
        await getCurrentUser();
        console.log('사용자 정보 로드 완료, 역할:', window.userRole);

        // 데이터 병렬 로드
        const promises = [
            loadMeetingDetail(),
            loadParticipants(),
            loadPosts()
        ];

        const results = await Promise.allSettled(promises);

        // 결과 로깅
        results.forEach((result, index) => {
            const names = ['모임 정보', '참가자 목록', '게시글 목록'];
            if (result.status === 'fulfilled') {
                console.log(`${names[index]} 로드 성공`);
            } else {
                console.warn(`${names[index]} 로드 실패:`, result.reason);
            }
        });

        console.log('페이지 초기화 완료');

    } catch (error) {
        console.error('페이지 초기화 실패:', error);
        alert('페이지 로드 중 오류가 발생했습니다.');
    }
}

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 상태 체크 (create-meeting.js 패턴 사용)
    if (!checkLoginStatus()) {
        console.log('로그인되지 않은 사용자의 접근');
        // 게스트도 모임 상세를 볼 수 있으므로 리다이렉트하지 않음
    }

    initializePage();
});

// 전역 함수로 내보내기 (HTML에서 onclick으로 사용)
window.applyToMeeting = applyToMeeting;
window.confirmApply = confirmApply;
window.openWriteModal = openWriteModal;
window.submitPost = submitPost;
window.addComment = addComment;
window.approveParticipant = approveParticipant;
window.rejectParticipant = rejectParticipant;
window.kickParticipant = kickParticipant;
window.goHome = goHome;
window.goToLogin = goToLogin;
window.goMyPage = goMyPage;
window.createMeeting = createMeeting;
window.editMeeting = editMeeting;
window.cancelMeeting = cancelMeeting;
window.logout = logout;
window.closeModal = closeModal;
window.loadPosts = loadPosts;
window.submitEditForm = submitEditForm;

console.log('✨ 북적북적 모임 상세 페이지 준비 완료!');