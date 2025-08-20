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
    updateDetailAddress();
}

/**
 * 참여 상태 확인 - 수정된 버전
 */
async function checkParticipationStatus() {
    if (!window.currentUserId || window.userRole === 'host') return;

    try {
        const response = await apiRequest(`/api/meetings/${window.currentMeetingId}/participants`);

        if (response.ok) {
            const responseData = await response.json();
            console.log('참여 상태 확인 API 응답:', responseData);

            // API 응답 구조 확인
            let participants;
            if (responseData.success && responseData.data) {
                participants = responseData.data; // ApiResponse 구조
            } else if (responseData.content) {
                participants = responseData.content; // 페이지네이션 구조
            } else if (Array.isArray(responseData)) {
                participants = responseData; // 직접 배열
            } else {
                participants = [];
            }

            // 현재 사용자의 참여 상태 찾기
            const myParticipation = participants.find(p => p.id === window.currentUserId);

            if (myParticipation) {
                console.log('내 참가자 정보:', myParticipation);

                // 백엔드에서 role 필드로 상태 확인
                if (myParticipation.role === 'PARTICIPANT' || myParticipation.role === 'HOST') {
                    window.userRole = myParticipation.role === 'HOST' ? 'host' : 'participant';
                    console.log('승인된 참가자로 설정됨:', window.userRole);
                    updateParticipationUI('APPROVED');
                } else {
                    // 대기중이거나 다른 상태
                    if (myParticipation.status) {
                        updateParticipationUI(myParticipation.status);
                    }
                }
            } else {
                console.log('참가자 목록에 없음 - 비참가자');
                window.userRole = 'member';
            }
        }
    } catch (error) {
        console.log('참여 상태 확인 실패:', error.message);
        window.userRole = 'member';
    }
}

/**
 * 참여 상태에 따른 UI 업데이트
 */
function updateParticipationUI(status) {
    const applyBtn = document.getElementById('applyBtn');
    if (!applyBtn) return;

    switch (status) {
        case 'PENDING':
            applyBtn.innerHTML = '<span></span> 승인 대기중';
            applyBtn.disabled = true;
            applyBtn.className = 'btn btn-warning btn-full';
            break;

        case 'APPROVED':
            window.userRole = 'participant';
            applyBtn.innerHTML = '<span>✓</span> 참여 확정';
            applyBtn.disabled = true;
            applyBtn.className = 'btn btn-success btn-full';
            updateUIByUserRole();
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

    // 모임 상태 확인
    const meetingCompleted = window.currentMeetingData &&
        (window.currentMeetingData.meetingStatus === 'COMPLETED' ||
            window.currentMeetingData.status === 'COMPLETED');

    // 버튼들 가져오기
    const editBtn = document.getElementById('editBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const completeBtn = document.getElementById('completeBtn');
    const applyBtn = document.getElementById('applyBtn');
    const writeBtn = document.getElementById('writeBtn');
    const pendingRequests = document.getElementById('pending-requests');

    // 모든 버튼 초기화
    [editBtn, cancelBtn, applyBtn, writeBtn, completeBtn].forEach(btn => {
        if (btn) btn.style.display = 'none';
    });
    if (pendingRequests) pendingRequests.style.display = 'none';

    // 역할별 UI 설정
    if (isHost) {
        console.log('호스트 UI 설정');
        if (!meetingCompleted) {
            if (editBtn) {
                editBtn.style.display = 'inline-flex';
                editBtn.onclick = editMeeting;
            }
            if (cancelBtn) {
                cancelBtn.style.display = 'inline-flex';
                cancelBtn.onclick = cancelMeeting;
            }
            if (completeBtn) {
                completeBtn.style.display = 'inline-flex';
                completeBtn.onclick = completeMeeting;
            }
            if (pendingRequests) {
                pendingRequests.style.display = 'block';
                loadPendingRequests();
            }
        }
        if (writeBtn) {
            writeBtn.style.display = 'inline-flex';
            writeBtn.onclick = openWriteModal;
        }
    } else if (isParticipant) {
        console.log('참가자 UI 설정');
        if (writeBtn) {
            writeBtn.style.display = 'inline-flex';
            writeBtn.onclick = openWriteModal;
        }
    } else if (isGuest) {
        console.log('게스트 UI 설정');
        if (applyBtn && !meetingCompleted) {
            applyBtn.style.display = 'inline-flex';
            applyBtn.innerHTML = '<span></span> 모임 신청';
            applyBtn.disabled = false;
            applyBtn.onclick = applyToMeeting;
        }
    } else { // member
        console.log('멤버 UI 설정');
        if (writeBtn) {
            writeBtn.style.display = 'inline-flex';
            writeBtn.onclick = openWriteModal;
        }
        if (applyBtn && !meetingCompleted) {
            applyBtn.style.display = 'inline-flex';
            applyBtn.innerHTML = '<span></span> 모임 신청';
            applyBtn.disabled = false;
            applyBtn.onclick = applyToMeeting;
        }
    }

    updateNavigationHeader();
}

/**
 * 모임 종료 함수
 */
async function completeMeeting() {
    if (!requireLogin('모임 종료')) return;
    if (window.userRole !== 'host') {
        alert('모임 종료는 호스트만 가능합니다.');
        return;
    }

    if (!confirm('정말로 모임을 종료하시겠습니까?\n종료된 모임에서는 참여자들이 서로 리뷰를 남길 수 있습니다.')) {
        return;
    }

    try {
        const response = await apiRequest(`/api/meetings/${window.currentMeetingId}/complete`, {
            method: 'PUT'
        });

        if (response.ok) {
            alert('모임이 종료되었습니다. 이제 참여자들이 서로 리뷰를 남길 수 있습니다.');
            await loadMeetingDetail();
            await loadParticipants();
        } else {
            const errorData = await response.text();
            throw new Error(errorData || '모임 종료에 실패했습니다.');
        }
    } catch (error) {
        console.error('모임 종료 실패:', error);
        alert('모임 종료에 실패했습니다: ' + error.message);
    }
}

/**
 * 상세주소 업데이트 함수
 */
function updateDetailAddress(meeting = null) {
    const updateElement = (id, content) => {
        const element = document.getElementById(id);
        if (element) element.textContent = content;
    };

    if (window.userRole === 'host' || window.userRole === 'participant') {
        let detailAddress = '상세주소 미제공';

        if (meeting && meeting.location) {
            const parts = meeting.location.split(' ');
            if (parts.length >= 3) {
                detailAddress = parts[parts.length - 1];
                window.currentDetailAddress = detailAddress;
            }
        } else if (window.currentDetailAddress) {
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

    // 기본 정보 업데이트
    updateElement('breadcrumb-title', meeting.title || '모임');
    updateElement('meeting-title', meeting.title || '모임 제목');
    updateElement('book-title', meeting.bookTitle || '도서 제목');
    updateElement('book-author', meeting.bookAuthor || '저자');

    // 날짜 포맷팅
    if (meeting.meetingTime) {
        const meetingDate = new Date(meeting.meetingTime);
        updateElement('meeting-date', formatDate(meetingDate));
    }

    // 위치 정보 구성
    let meetingLocation = '위치 정보 없음';
    let detailAddress = '상세주소 미제공';

    if (meeting.location) {
        const parts = meeting.location.split(' ');
        if (parts.length >= 3) {
            detailAddress = parts[parts.length - 1];
            meetingLocation = parts.slice(0, -1).join(' ');
        } else {
            meetingLocation = meeting.location;
        }
    }

    updateElement('meeting-location', meetingLocation);
    window.currentMeetingLocation = meetingLocation;
    window.currentDetailAddress = detailAddress;

    updateElement('meeting-genre', meeting.genre ? `장르: ${meeting.genre}` : '장르: 미분류');

    // 호스트 정보
    if (meeting.host) {
        updateElement('host-avatar', meeting.host.username ? meeting.host.username.charAt(0) : '?');
        updateElement('host-name', `${meeting.host.username || '호스트'} (호스트)`);
        updateElement('host-stats', `받은 좋아요 ${meeting.host.likesCount || 0}개 · 주최 모임 ${meeting.host.hostedMeetingsCount || 0}회`);
    }

    // 참여자 수 정보
    const maxParticipants = meeting.maxParticipants || 0;
    const currentParticipants = meeting.currentParticipants || 0;

    updateElement('status-value', getStatusText(meeting.meetingStatus || meeting.status));
    updateElement('remaining-slots', `${Math.max(0, maxParticipants - currentParticipants)}자리`);
    updateAttribute('participants-count', 'data-max-participants', maxParticipants);
    updateElement('participants-count', `${currentParticipants}/${maxParticipants}명`);

    // 마감일 설정
    if (meeting.meetingTime) {
        const deadline = new Date(meeting.meetingTime);
        deadline.setHours(deadline.getHours() - 1);
        updateElement('deadline', formatDate(deadline));
    }

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

    // 원본 모임 데이터 저장
    window.currentMeetingData = meeting;
}

/**
 * 참가자 목록 로드 - 완전 수정된 버전
 */
async function loadParticipants() {
    const loadingElement = document.getElementById('participants-loading');
    const listElement = document.getElementById('participants-list');

    try {
        if (loadingElement) loadingElement.style.display = 'block';
        if (listElement) listElement.innerHTML = '';

        console.log('참가자 목록 로드 시작:', {
            meetingId: window.currentMeetingId,
            currentUserId: window.currentUserId,
            userRole: window.userRole
        });

        const response = await apiRequest(`/api/meetings/${window.currentMeetingId}/participants?status=APPROVED`);

        if (response.ok) {
            const responseData = await response.json();
            console.log('참가자 API 응답 전체:', responseData);

            // API 응답 구조 확인
            let participants;
            if (responseData.success && responseData.data) {
                participants = responseData.data; // ApiResponse 구조
            } else if (responseData.content) {
                participants = responseData.content; // 페이지네이션 구조
            } else if (Array.isArray(responseData)) {
                participants = responseData; // 직접 배열
            } else {
                participants = [];
            }

            console.log('추출된 참가자 데이터:', participants);

            if (listElement) {
                listElement.innerHTML = '';

                if (!Array.isArray(participants) || participants.length === 0) {
                    listElement.innerHTML = `
                        <div style="text-align: center; color: #777; padding: 20px;">
                            아직 참여자가 없습니다.
                        </div>
                    `;
                } else {
                    participants.forEach((participant, index) => {
                        console.log(`참가자 ${index + 1} 상세:`, {
                            id: participant.id,
                            username: participant.username,
                            role: participant.role,
                            reviewsCount: participant.reviewsCount,
                            isReviewedByCurrentUser: participant.isReviewedByCurrentUser
                        });
                        const item = createParticipantItem(participant);
                        listElement.appendChild(item);
                    });
                }
            }

            updateParticipantCount(Array.isArray(participants) ? participants.length : 0);
        } else {
            console.error('참가자 목록 API 응답 오류:', response.status, response.statusText);
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('참가자 목록 로드 실패:', error);

        if (listElement) {
            listElement.innerHTML = `
                <div style="text-align: center; color: #dc3545; padding: 20px;">
                    참가자 목록을 불러오는데 실패했습니다.
                    <br><small>${error.message}</small>
                    <br><button class="btn btn-secondary" onclick="loadParticipants()" style="margin-top: 10px;">다시 시도</button>
                </div>
            `;
        }
    } finally {
        if (loadingElement) loadingElement.style.display = 'none';
    }
}

/**
 * 참가자 아이템 생성 - 완전 수정된 버전
 */
function createParticipantItem(participant) {
    const item = document.createElement('div');
    item.className = 'participant-mini-item';

    const roleText = participant.role === 'HOST' ? '호스트' : '참여자';
    const roleClass = participant.role === 'HOST' ? 'host' : 'participant';

    // 프로필 이미지 처리
    const profileImageUrl = participant.profileImage || '/images/defaultProfile.png';
    const isDefaultImage = !participant.profileImage || participant.profileImage.includes('defaultProfile.png');

    // 백엔드에서 받은 값 그대로 사용
    const reviewCount = participant.reviewsCount || participant.reviewCount || 0;
    const isReviewed = participant.isReviewedByCurrentUser || participant.isReviewed || false;

    console.log(`${participant.username} 리뷰 정보:`, {
        reviewCount,
        isReviewed,
        currentUserId: window.currentUserId,
        participantId: participant.id,
        userRole: window.userRole
    });

    let reviewButtonHtml = '';

    // 모임 완료 상태 확인
    const meetingCompleted = window.currentMeetingData &&
        (window.currentMeetingData.meetingStatus === 'COMPLETED' ||
            window.currentMeetingData.status === 'COMPLETED');

    console.log(`${participant.username} 리뷰 버튼 조건:`, {
        hasUserId: !!window.currentUserId,
        notSelf: window.currentUserId !== participant.id,
        isHostOrParticipant: (window.userRole === 'host' || window.userRole === 'participant'),
        userRole: window.userRole,
        meetingCompleted,
        canReview: window.currentUserId &&
            window.currentUserId !== participant.id &&
            (window.userRole === 'host' || window.userRole === 'participant') &&
            meetingCompleted
    });

    // 리뷰 버튼 표시 조건
    if (window.currentUserId &&
        window.currentUserId !== participant.id &&
        (window.userRole === 'host' || window.userRole === 'participant') &&
        meetingCompleted) {

        // 모임 완료 + 참여자/호스트 → 리뷰 버튼 표시
        if (isReviewed) {
            reviewButtonHtml = `
                <div class="review-section">
                    <button class="btn btn-sm btn-success review-btn" disabled title="이미 리뷰를 남겼습니다">
                        ❤️ ${reviewCount}
                    </button>
                </div>
            `;
        } else {
            reviewButtonHtml = `
                <div class="review-section">
                    <button class="btn btn-sm btn-outline-primary review-btn" 
                            onclick="reviewParticipant(${participant.id})"
                            title="이 참여자에게 좋아요 주기">
                        🤍 ${reviewCount}
                    </button>
                </div>
            `;
        }
    } else {
        // 모든 다른 경우 → 리뷰 수만 표시
        reviewButtonHtml = `
            <div class="review-section">
                <span class="review-count like-badge" title="받은 좋아요 수">❤️ ${reviewCount}</span>
            </div>
        `;
    }

    // 호스트 전용 내보내기 버튼
    const actionButtons = window.userRole === 'host' &&
    participant.role !== 'HOST' &&
    !meetingCompleted ? `
        <div class="participant-actions">
            <button class="btn btn-danger btn-sm participant-reject-btn" 
                    onclick="kickParticipant(${participant.id})" 
                    title="참가자 내보내기">
                ✗
            </button>
        </div>
    ` : '';

    // 프로필 이미지 HTML
    const profileImageHtml = isDefaultImage ?
        `<div class="participant-mini-avatar ${roleClass}">${participant.username.charAt(0)}</div>` :
        `<img src="${profileImageUrl}" alt="${participant.username}" class="participant-mini-avatar ${roleClass}" />`;

    item.innerHTML = `
        ${profileImageHtml}
        <div class="participant-mini-info">
            <div class="participant-mini-name">${escapeHtml(participant.username)}</div>
            <div class="participant-mini-status">${roleText}</div>
        </div>
        ${reviewButtonHtml}
        ${actionButtons}
    `;

    return item;
}

/**
 * 리뷰 함수 - 완전 수정된 버전
 */
async function reviewParticipant(participantId) {
    console.log('리뷰 함수 호출:', {
        participantId,
        currentUserId: window.currentUserId,
        userRole: window.userRole,
        meetingId: window.currentMeetingId
    });

    if (!requireLogin('리뷰 작성')) return;

    // 권한 체크 강화
    if (window.userRole !== 'host' && window.userRole !== 'participant') {
        console.log('권한 없음:', window.userRole);
        alert('이 모임의 참여자만 리뷰를 남길 수 있습니다.');
        return;
    }

    // 모임 완료 확인
    const meetingCompleted = window.currentMeetingData &&
        (window.currentMeetingData.meetingStatus === 'COMPLETED' ||
            window.currentMeetingData.status === 'COMPLETED');

    if (!meetingCompleted) {
        alert('완료된 모임에서만 리뷰를 남길 수 있습니다.');
        return;
    }

    // 자기 자신 체크
    if (window.currentUserId === participantId) {
        alert('자신에게는 리뷰를 남길 수 없습니다.');
        return;
    }

    if (!confirm('이 참여자에게 좋아요를 주시겠습니까?\n한 번 주면 취소할 수 없습니다.')) {
        return;
    }

    try {
        console.log('리뷰 API 요청:', {
            url: `/api/meetings/${window.currentMeetingId}/reviews`,
            body: { toUserId: participantId }
        });

        const response = await apiRequest(`/api/meetings/${window.currentMeetingId}/reviews`, {
            method: 'POST',
            body: JSON.stringify({ toUserId: participantId })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('리뷰 성공 응답:', result);

            alert('리뷰가 완료되었습니다!');
            await loadParticipants();

        } else {
            const errorData = await response.text();
            console.error('리뷰 실패 응답:', errorData);

            if (errorData.includes('DUPLICATE_LIKE') || errorData.includes('중복')) {
                alert('이미 이 참여자에게 리뷰를 남겼습니다.');
                await loadParticipants();
            } else if (errorData.includes('MEETING_NOT_COMPLETED')) {
                alert('완료된 모임에서만 리뷰를 남길 수 있습니다.');
            } else {
                throw new Error(errorData || '리뷰 작성에 실패했습니다.');
            }
        }
    } catch (error) {
        console.error('리뷰 작성 실패:', error);
        alert('리뷰 작성에 실패했습니다: ' + error.message);
    }
}

/**
 * 참가자 스타일 CSS
 */
const style = document.createElement('style');
style.textContent = `
    /* 참가자 아이템 기본 스타일 */
    .participant-mini-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: #f8f6f3;
        border-radius: 12px;
        margin-bottom: 8px;
        border: 1px solid #e0d6c8;
        transition: all 0.3s ease;
    }

    .participant-mini-item:hover {
        background: #f0ede8;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(139, 115, 85, 0.1);
    }

    /* 프로필 아바타 */
    .participant-mini-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 16px;
        color: white;
        flex-shrink: 0;
    }

    .participant-mini-avatar.host {
        background: linear-gradient(135deg, #8b7355 0%, #a0886b 100%);
        border: 2px solid #d4af37;
    }

    .participant-mini-avatar.participant {
        background: linear-gradient(135deg, #6c8bb3 0%, #5a7a9e 100%);
    }

    .participant-mini-avatar img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
    }

    /* 참가자 정보 */
    .participant-mini-info {
        flex-grow: 1;
        min-width: 0;
    }

    .participant-mini-name {
        font-weight: 600;
        color: #333;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .participant-mini-status {
        font-size: 12px;
        color: #666;
    }

    /* 리뷰 섹션 */
    .review-section {
        display: flex;
        align-items: center;
        margin-left: auto;
        flex-shrink: 0;
    }

    .review-btn {
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
        border: 1px solid;
        cursor: pointer;
        transition: all 0.2s ease;
        background: white;
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .review-btn.btn-outline-primary {
        border-color: #8b7355;
        color: #8b7355;
    }

    .review-btn.btn-outline-primary:hover:not(:disabled) {
        background: #8b7355;
        color: white;
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(139, 115, 85, 0.3);
    }

    .review-btn.btn-success {
        border-color: #28a745;
        background: #28a745;
        color: white;
    }

    .review-btn:disabled {
        cursor: not-allowed;
        opacity: 0.7;
    }

    .review-count {
        font-size: 12px;
        color: #666;
        font-weight: 500;
        padding: 4px 8px;
        background: rgba(139, 115, 85, 0.1);
        border-radius: 6px;
    }

    .like-badge {
        font-size: 12px;
        color: #666;
        font-weight: 500;
        padding: 4px 8px;
        background: rgba(139, 115, 85, 0.1);
        border-radius: 6px;
    }

    /* 참가자 액션 버튼 */
    .participant-actions {
        display: flex;
        gap: 4px;
        margin-left: 8px;
        flex-shrink: 0;
    }

    .participant-reject-btn {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 1px solid #dc3545;
        background: white;
        color: #dc3545;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
    }

    .participant-reject-btn:hover {
        background: #dc3545;
        color: white;
        transform: scale(1.1);
        box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
    }

    /* 반응형 */
    @media (max-width: 768px) {
        .participant-mini-item {
            padding: 10px;
            gap: 10px;
        }

        .participant-mini-avatar {
            width: 36px;
            height: 36px;
            font-size: 14px;
        }

        .review-btn {
            padding: 4px 8px;
            font-size: 11px;
        }

        .participant-reject-btn {
            width: 24px;
            height: 24px;
            font-size: 10px;
        }
    }
`;

// 스타일을 head에 추가
if (!document.getElementById('participant-styles')) {
    style.id = 'participant-styles';
    document.head.appendChild(style);
}

/**
 * 참가자 내보내기 (호스트 전용)
 */
async function kickParticipant(userId) {
    if (window.userRole !== 'host') {
        return;
    }

    if (!confirm('정말로 이 참가자를 내보내시겠습니까?')) return;

    try {
        const response = await apiRequest(`/api/meetings/${window.currentMeetingId}/participants/${userId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadParticipants();
            loadMeetingDetail();
        } else {
            const errorData = await response.text();
            throw new Error(errorData || '참가자 내보내기에 실패했습니다.');
        }
    } catch (error) {
        console.error('참가자 내보내기 실패:', error);
    }
}

/**
 * 참여자 수 업데이트
 */
function updateParticipantCount(count) {
    const countElement = document.getElementById('participants-count');
    const remainingElement = document.getElementById('remaining-slots');

    const maxParticipants = parseInt(document.querySelector('[data-max-participants]')?.getAttribute('data-max-participants')) || 8;

    if (countElement) {
        countElement.textContent = `${count}/${maxParticipants}명`;
    }

    if (remainingElement) {
        const remaining = Math.max(0, maxParticipants - count);
        remainingElement.textContent = `${remaining}자리`;

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
            loadPendingRequests();
            loadParticipants();
            loadMeetingDetail();
        } else {
            const errorData = await response.text();
            throw new Error(errorData || '승인 처리에 실패했습니다.');
        }
    } catch (error) {
        console.error('승인 실패:', error);
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
            loadPendingRequests();
        } else {
            const errorData = await response.text();
            throw new Error(errorData || '거절 처리에 실패했습니다.');
        }
    } catch (error) {
        console.error('거절 실패:', error);
    }
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

    const status = meeting.meetingStatus || meeting.status;
    if (status) {
        const statusBadge = document.createElement('span');
        statusBadge.className = `status-tag status-${status.toLowerCase()}`;
        statusBadge.textContent = getStatusText(status);
        badgesContainer.appendChild(statusBadge);
    }

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

        if (applyBtn) {
            applyBtn.disabled = false;
            applyBtn.innerHTML = '<span></span> 모임 신청';
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
        return;
    }

    const title = titleElement.value.trim();
    const content = contentElement.value.trim();

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
            hideModal('write-modal');
            loadPosts();
        } else {
            const errorData = await response.text();
            throw new Error(errorData || '게시글 작성에 실패했습니다.');
        }
    } catch (error) {
        console.error('게시글 작성 실패:', error);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '게시';
        }
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
 * 게시글 아이템 생성
 */
function createPostItem(post) {
    const item = document.createElement('div');
    item.className = 'post-item';
    item.onclick = () => viewPostDetail(post);

    const timeAgo = getTimeAgo(new Date(post.createdAt));
    const truncatedContent = truncateText(post.content, 100);

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
        const response = await apiRequest(`/api/meetings/${window.currentMeetingId}/posts/${post.postId}`);

        if (response.ok) {
            const detailData = await response.json();
            showPostDetailModal(detailData);
        } else {
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

    loadPostComments(post);
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
        const response = await apiRequest(`/api/meetings/${window.currentMeetingId}/posts/${post.postId}/comments`);

        if (response.ok) {
            const comments = await response.json();
            displayComments(comments);
        } else {
            if (post.comments && Array.isArray(post.comments)) {
                displayComments(post.comments);
            } else {
                commentsList.innerHTML = '<div style="text-align: center; color: #777; padding: 20px;">아직 댓글이 없습니다.</div>';
            }
        }
    } catch (error) {
        console.error('댓글 로드 실패:', error);
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
            commentInput.value = '';

            const currentPost = { postId: window.currentPostId };
            await viewPostDetail(currentPost);
            await loadPosts();
        } else {
            const errorData = await response.text();
            throw new Error(errorData || '댓글 작성에 실패했습니다.');
        }
    } catch (error) {
        console.error('댓글 작성 실패:', error);
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
        return;
    }

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
                    <h3>모임 수정</h3>
                    <button onclick="closeModal()" class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="edit-form">
                        <div class="form-row">
                            <div class="form-group full-width">
                                <label for="edit-title">모임 제목</label>
                                <div class="input-with-icon">
                                    <i class="fas fa-book-reader"></i>
                                    <input type="text" id="edit-title" class="form-input" placeholder="모임 제목을 입력하세요" required>
                                </div>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group full-width">
                                <label for="edit-description">모임 설명</label>
                                <div class="input-with-icon">
                                    <i class="fas fa-pen"></i>
                                    <textarea id="edit-description" class="form-textarea" rows="3" placeholder="모임에 대한 설명을 입력하세요"></textarea>
                                </div>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group half-width">
                                <label for="edit-bookTitle">책 제목</label>
                                <div class="input-with-icon">
                                    <i class="fas fa-book"></i>
                                    <input type="text" id="edit-bookTitle" class="form-input" placeholder="책 제목">
                                </div>
                            </div>
                            <div class="form-group half-width">
                                <label for="edit-bookAuthor">저자</label>
                                <div class="input-with-icon">
                                    <i class="fas fa-user-edit"></i>
                                    <input type="text" id="edit-bookAuthor" class="form-input" placeholder="저자명">
                                </div>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group half-width">
                                <label for="edit-genre">장르</label>
                                <div class="input-with-icon">
                                    <i class="fas fa-layer-group"></i>
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
                            </div>
                            <div class="form-group half-width">
                                <label for="edit-maxParticipants">최대 참여자 수</label>
                                <div class="input-with-icon">
                                    <i class="fas fa-users"></i>
                                    <input type="number" id="edit-maxParticipants" class="form-input" min="2" max="20" placeholder="2-20명">
                                </div>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group half-width">
                                <label for="edit-meetingTime">모임 날짜/시간</label>
                                <div class="input-with-icon">
                                    <i class="fas fa-calendar-alt"></i>
                                    <input type="datetime-local" id="edit-meetingTime" class="form-input">
                                </div>
                            </div>
                            <div class="form-group half-width">
                                <label for="edit-detailAddress">상세 주소</label>
                                <div class="input-with-icon">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <input type="text" id="edit-detailAddress" class="form-input" placeholder="구체적인 모임 장소">
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">
                        <i class="fas fa-times"></i> 취소
                    </button>
                    <button type="button" class="btn btn-primary" onclick="submitEditForm()">
                        <i class="fas fa-check"></i> 수정 완료
                    </button>
                </div>
            </div>
        </div>

        <style>
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

        .edit-modal {
            max-width: 30vw;
            max-height: 90vh;
            overflow: scroll;
            scrollbar-width: none;
            background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            display: flex;
            flex-direction: column;
            padding: 10px;
        }

        .edit-modal .modal-header {
            background: linear-gradient(135deg, #8b7355 0%, #a0886b 100%);
            color: white;
            padding: 22px 30px;
            border-radius: 22px 22px 0 0;
            border-bottom: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .edit-modal .modal-header h3 {
            margin: 0;
            font-size: 1.5em;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .edit-modal .modal-close {
            background: transparent;
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 24px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .edit-modal .modal-close:hover {
            background: rgba(255,255,255,0.2);
        }

        .edit-modal .modal-body {
            padding: 0 30px;
            flex-grow: 1;
        }

        .form-row {
            display: flex;
            gap: 20px;
            margin: 10px 0;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            width: 100%;
        }

        .form-group.full-width {
            flex-basis: 100%;
        }

        .form-group.half-width {
            flex-basis: 50%;
        }

        .form-group label {
            font-weight: 600;
            color: #8b7355;
            margin-bottom: 10px;
            font-size: 1em;
        }

        .input-with-icon {
            position: relative;
        }

        .input-with-icon i {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: #b0a291;
            transition: color 0.3s ease;
        }

        .form-input, .form-textarea, .form-select {
            padding: 14px 15px 14px 45px;
            border: 2px solid #e0d6c8;
            border-radius: 12px;
            font-size: 15px;
            transition: all 0.3s ease;
            background: white;
            width: 100%;
            box-sizing: border-box;
        }

        .form-input:focus, .form-textarea:focus, .form-select:focus {
            outline: none;
            border-color: #8b7355;
            box-shadow: 0 0 10px rgba(139, 115, 85, 0.15);
        }

        .input-with-icon:focus-within i {
            color: #8b7355;
        }

        .form-textarea {
            resize: vertical;
            min-height: 100px;
        }
        
        .form-select {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%238B7355%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
            background-repeat: no-repeat;
            background-position: right 15px top 50%;
            background-size: .65em auto;
            padding-right: 40px;
        }

        .edit-modal .modal-footer {
            padding: 10px;
            background: #f8f6f3;
            border-radius: 0 0 22px 22px;
            display: flex;
            gap: 15px;
            justify-content: flex-end;
            border-top: 1px solid #e0d6c8;
        }

        .edit-modal .btn {
            padding: 14px 28px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: none;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .edit-modal .btn-secondary {
            background: #6c757d;
            color: white;
        }

        .edit-modal .btn-secondary:hover {
            background: #5a6268;
            transform: translateY(-3px);
            box-shadow: 0 6px 15px rgba(108, 117, 125, 0.3);
        }

        .edit-modal .btn-primary {
            background: linear-gradient(135deg, #8b7355 0%, #a0886b 100%);
            color: white;
        }

        .edit-modal .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 15px rgba(139, 115, 85, 0.3);
        }

        @media (max-width: 768px) {
            .edit-modal {
                max-width: 95%;
                margin: 20px auto;
            }
            
            .form-row {
                flex-direction: column;
                gap: 0;
                margin-bottom: 0;
            }
            
            .form-group {
                margin-bottom: 20px;
            }

            .form-group.half-width {
                flex-basis: 100%;
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

    if (meeting.meetingTime) {
        const meetingDate = new Date(meeting.meetingTime);
        const localDateTime = new Date(meetingDate.getTime() - meetingDate.getTimezoneOffset() * 60000)
            .toISOString().slice(0, 16);
        document.getElementById('edit-meetingTime').value = localDateTime;
    }
}

/**
 * 수정 폼 제출
 */
async function submitEditForm() {
    const title = document.getElementById('edit-title').value.trim();
    if (!title) {
        alert('모임 제목을 입력해주세요.');
        return;
    }

    const updateData = {
        title: title,
        description: document.getElementById('edit-description').value.trim(),
        bookTitle: document.getElementById('edit-bookTitle').value.trim(),
        bookAuthor: document.getElementById('edit-bookAuthor').value.trim(),
        genre: document.getElementById('edit-genre').value,
        maxParticipants: parseInt(document.getElementById('edit-maxParticipants').value) || window.currentMeetingData.maxParticipants,
        meetingTime: document.getElementById('edit-meetingTime').value
    };

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
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        console.log('수정 응답 상태:', response.status);

        if (response.ok) {
            closeModal();
            await loadMeetingDetail();
        } else {
            const errorText = await response.text();
            console.error('서버 에러 응답:', errorText);
            throw new Error(`모임 수정에 실패했습니다 (${response.status}): ${errorText}`);
        }
    } catch (error) {
        console.error('모임 수정 실패:', error);
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
        return;
    }

    if (confirm('정말 로그아웃하시겠습니까?')) {
        apiRequest('/api/auth/logout', { method: 'POST' })
            .then(() => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userInfo');
                window.location.href = '/';
            })
            .catch(() => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userInfo');
                window.location.href = '/';
            });
    }
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeModal();
        }

        if (e.target.matches('.modal .btn-secondary') &&
            (e.target.textContent.includes('취소') || e.target.textContent.includes('닫기'))) {
            closeModal();
        }
    });

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
        const urlParams = new URLSearchParams(window.location.search);
        const pathParts = window.location.pathname.split('/');

        if (pathParts[1] === 'meetings' && pathParts[2]) {
            window.currentMeetingId = parseInt(pathParts[2]);
        } else {
            window.currentMeetingId = parseInt(urlParams.get('id')) || 1;
        }

        console.log('모임 ID:', window.currentMeetingId);

        setupEventListeners();

        await getCurrentUser();
        console.log('사용자 정보 로드 완료, 역할:', window.userRole);

        const promises = [
            loadMeetingDetail(),
            loadParticipants(),
            loadPosts()
        ];

        const results = await Promise.allSettled(promises);

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
    }
}

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    if (!checkLoginStatus()) {
        console.log('로그인되지 않은 사용자의 접근');
    }

    initializePage();
});

// 전역 함수로 내보내기
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
window.completeMeeting = completeMeeting;
window.reviewParticipant = reviewParticipant;

// 디버깅 함수
window.debugParticipantRole = function() {
    console.log('=== 참가자 역할 디버깅 ===');
    console.log('window.userRole:', window.userRole);
    console.log('window.currentUserId:', window.currentUserId);
    console.log('window.currentMeetingId:', window.currentMeetingId);
    console.log('모임 완료 상태:', window.currentMeetingData?.meetingStatus);

    const originalRole = window.userRole;
    console.log('participant로 강제 설정 테스트');
    window.userRole = 'participant';
    updateUIByUserRole();

    setTimeout(() => {
        loadParticipants().then(() => {
            console.log('참가자 목록 새로고침 완료');
        });
    }, 100);
};

window.testParticipantAPI = async function() {
    console.log('=== 참가자 API 직접 테스트 ===');
    try {
        const response = await fetch(`/api/meetings/${window.currentMeetingId}/participants`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        const data = await response.json();
        console.log('API 응답:', data);

        let participants;
        if (data.success && data.data) {
            participants = data.data;
        } else if (data.content) {
            participants = data.content;
        } else if (Array.isArray(data)) {
            participants = data;
        } else {
            participants = [];
        }

        console.log('추출된 참가자:', participants);
        const me = participants.find(p => p.id === window.currentUserId);
        console.log('내 정보:', me);

        if (me) {
            console.log('내 역할:', me.role);
            console.log('리뷰 수 필드들:', {
                reviewsCount: me.reviewsCount,
                reviewCount: me.reviewCount,
                isReviewedByCurrentUser: me.isReviewedByCurrentUser,
                isReviewed: me.isReviewed
            });
        }
    } catch (error) {
        console.error('API 테스트 실패:', error);
    }
};

console.log('✨ 북적북적 모임 상세 페이지 준비 완료!');