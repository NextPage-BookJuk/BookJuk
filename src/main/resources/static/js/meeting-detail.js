// 전역 변수 및 설정
window.API_BASE = '';  // 백엔드가 같은 도메인에서 실행되므로 빈 문자열
window.currentMeetingId = null;
window.currentUserId = null;
window.userRole = 'guest';
window.currentPostId = null;
window.isInitialized = false;
window.currentUser = null;

// 앱 설정
const APP_CONFIG = {
    RETRY_ATTEMPTS: 2,
    RETRY_DELAY: 1000,
    DEBOUNCE_DELAY: 300,
    POLLING_INTERVAL: 30000,
    MAX_TITLE_LENGTH: 100,
    MAX_CONTENT_LENGTH: 1000,
    ENABLE_REAL_TIME: true
};

// 인증 헬퍼 (실제 백엔드 구조에 맞춤)
const authHelper = {
    getToken() {
        return localStorage.getItem('authToken');
    },

    getUser() {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    },

    isLoggedIn() {
        return !!this.getToken() && !!this.getUser();
    },

    getUserId() {
        const user = this.getUser();
        return user ? user.id : null;
    },

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        window.currentUserId = null;
        window.userRole = 'guest';
        window.currentUser = null;
        this.updateAuthState();
    },

    updateAuthState() {
        getCurrentUser();
        updateUIByUserRole();
    },

    // 실제 백엔드 API로 현재 사용자 정보 조회
    async fetchCurrentUser() {
        try {
            const response = await apiRequest('/api/auth/me');
            if (response.ok) {
                const userData = await response.json();

                // 백엔드 응답 구조에 맞춰 저장
                localStorage.setItem('userInfo', JSON.stringify(userData));
                return userData;
            }
            return null;
        } catch (error) {
            console.error('사용자 정보 조회 실패:', error);
            return null;
        }
    }
};

// 유틸리티 함수들
const utils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
    },

    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return '방금 전';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
        return date.toLocaleDateString();
    },

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// 로딩 상태 관리
const loadingManager = {
    activeRequests: new Set(),

    start(key) {
        this.activeRequests.add(key);
        this.updateGlobalLoading();
    },

    end(key) {
        this.activeRequests.delete(key);
        this.updateGlobalLoading();
    },

    updateGlobalLoading() {
        const isLoading = this.activeRequests.size > 0;
        document.body.classList.toggle('loading', isLoading);
    },

    showElementLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.opacity = '0.6';
            element.style.pointerEvents = 'none';
        }
    },

    hideElementLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.opacity = '1';
            element.style.pointerEvents = 'auto';
        }
    }
};

// 알림 시스템
const notificationManager = {
    show(message, type = 'info', duration = 3000) {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${utils.escapeHtml(message)}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };

        notification.style.backgroundColor = colors[type] || colors.info;
        document.body.appendChild(notification);

        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.style.animation = 'slideOut 0.3s ease-in';
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);
        }
    },

    success(message) { this.show(message, 'success'); },
    error(message) { this.show(message, 'error', 5000); },
    warning(message) { this.show(message, 'warning', 4000); },
    info(message) { this.show(message, 'info'); }
};

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .loading { cursor: wait; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .fade-in { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    .modal-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.5);
        z-index: 1000;
    }
    .modal-overlay.show {
        display: block;
    }
`;
document.head.appendChild(style);

// 향상된 API 요청 함수 (실제 백엔드 구조에 맞춤)
async function apiRequest(endpoint, options = {}) {
    const requestKey = `${options.method || 'GET'}-${endpoint}`;
    loadingManager.start(requestKey);

    try {
        const token = authHelper.getToken();

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

        // 재시도 로직
        let lastError;
        for (let attempt = 1; attempt <= APP_CONFIG.RETRY_ATTEMPTS; attempt++) {
            try {
                const response = await fetch(endpoint, config);

                // 인증 오류 처리 (401)
                if (response.status === 401) {
                    authHelper.logout();
                    notificationManager.error('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
                    setTimeout(() => window.location.href = '/auth', 1500);
                    throw new Error('Unauthorized');
                }

                // 권한 오류 처리 (403)
                if (response.status === 403) {
                    notificationManager.error('이 작업을 수행할 권한이 없습니다.');
                    throw new Error('Forbidden');
                }

                // 404 오류 처리
                if (response.status === 404) {
                    console.log(`리소스를 찾을 수 없습니다: ${endpoint}`);
                    throw new Error('Not Found');
                }

                // 서버 오류 처리 (500)
                if (response.status >= 500) {
                    if (attempt === APP_CONFIG.RETRY_ATTEMPTS) {
                        notificationManager.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
                        throw new Error('Server Error');
                    }
                    await new Promise(resolve => setTimeout(resolve, APP_CONFIG.RETRY_DELAY * attempt));
                    continue;
                }

                // 클라이언트 오류 처리 (400번대)
                if (response.status >= 400) {
                    const errorText = await response.text();
                    console.error(`클라이언트 오류 ${response.status}:`, errorText);
                    throw new Error(`Client Error: ${response.status}`);
                }

                return response;

            } catch (error) {
                lastError = error;
                if (error.name === 'TypeError' && attempt < APP_CONFIG.RETRY_ATTEMPTS) {
                    await new Promise(resolve => setTimeout(resolve, APP_CONFIG.RETRY_DELAY * attempt));
                    continue;
                }
                throw error;
            }
        }

        throw lastError;

    } finally {
        loadingManager.end(requestKey);
    }
}

// 사용자 상태 관리
async function getCurrentUser() {
    try {
        const token = authHelper.getToken();

        if (token) {
            // 실제 백엔드에서 현재 사용자 정보 조회
            const user = await authHelper.fetchCurrentUser();

            if (user) {
                window.currentUserId = user.id;
                window.userRole = user.role || 'member';
                window.currentUser = user;

                console.log('사용자 로그인 상태:', {
                    userId: window.currentUserId,
                    username: user.username,
                    role: window.userRole
                });

                return user;
            }
        }

        // 로그인되지 않은 상태
        window.currentUserId = null;
        window.userRole = 'guest';
        window.currentUser = null;
        return null;

    } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
        window.currentUserId = null;
        window.userRole = 'guest';
        window.currentUser = null;
        return null;
    }
}

// 로그인 필요 여부 체크
function requireLogin(action) {
    if (!authHelper.isLoggedIn()) {
        const result = confirm(`${action}을 위해서는 로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?`);
        if (result) {
            window.location.href = '/auth';
        }
        return false;
    }
    return true;
}

// 모임 상세 정보 로드 (실제 백엔드 API 구조에 맞춤)
async function loadMeetingDetail() {
    try {
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

            return meeting;
        }

    } catch (error) {
        console.error('모임 정보 로드 실패:', error);
        notificationManager.error('모임 정보를 불러오는데 실패했습니다.');
        // 테스트 데이터로 폴백
        loadTestMeetingData();
    }
}

// 참여 상태 확인 (참가자 목록에서 현재 사용자 찾기)
async function checkParticipationStatus() {
    if (!window.currentUserId || window.userRole === 'host') return;

    try {
        // 모든 참가자 목록 조회
        const response = await apiRequest(`/api/meetings/${window.currentMeetingId}/participants`);

        if (response.ok) {
            const participants = await response.json();

            // 현재 사용자의 참여 상태 찾기
            const myParticipation = participants.find(p => p.userId === window.currentUserId);

            if (myParticipation) {
                updateParticipationUI(myParticipation.status);
            }
        }

    } catch (error) {
        console.log('참여 상태 확인 실패:', error.message);
    }
}

// 참여 상태에 따른 UI 업데이트
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
            break;

        case 'REJECTED':
            applyBtn.innerHTML = '<span>❌</span> 참여 거절됨';
            applyBtn.disabled = true;
            applyBtn.className = 'btn btn-danger btn-full';
            break;

        default:
            applyBtn.innerHTML = '<span>📝</span> 모임 신청';
            applyBtn.disabled = false;
            applyBtn.className = 'btn btn-primary btn-full';
    }
}

// 사용자 역할 확인 및 설정
function checkUserRole(meeting) {
    if (window.currentUserId === meeting.hostId) {
        window.userRole = 'host';
    } else if (window.currentUserId) {
        window.userRole = 'member';
    } else {
        window.userRole = 'guest';
    }

    updateUIByUserRole();
}

// 역할별 UI 업데이트
function updateUIByUserRole() {
    const isHost = window.userRole === 'host';
    const isParticipant = window.userRole === 'participant';
    const isGuest = window.userRole === 'guest';
    const isMember = window.userRole === 'member';

    // 버튼 요소들
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
        if (editBtn) {
            editBtn.style.display = 'inline-flex';
            editBtn.onclick = editMeeting;
        }
        if (cancelBtn) {
            cancelBtn.style.display = 'inline-flex';
            cancelBtn.onclick = () => showCancelMeetingModal();
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
        if (writeBtn) {
            writeBtn.style.display = 'inline-flex';
            writeBtn.onclick = openWriteModal;
        }
    } else if (isGuest) {
        if (applyBtn) {
            applyBtn.style.display = 'inline-flex';
            applyBtn.innerHTML = '<span>📝</span> 모임 신청';
            applyBtn.onclick = () => showApplyModal();
        }
    } else if (isMember) {
        if (writeBtn) {
            writeBtn.style.display = 'inline-flex';
            writeBtn.onclick = openWriteModal;
        }
        if (applyBtn) {
            applyBtn.style.display = 'inline-flex';
            applyBtn.innerHTML = '<span>📝</span> 모임 신청';
            applyBtn.onclick = () => showApplyModal();
        }
    }

    updateNavigationHeader();
}

// 모달 시스템
const modalManager = {
    show(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error('모달을 찾을 수 없습니다:', modalId);
            return;
        }

        modal.style.display = 'block';
        modal.classList.add('show', 'fade-in');

        // ESC 키로 닫기
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.hide(modalId);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    },

    hide(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show', 'fade-in');
        }
    },

    hideAll() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.style.display = 'none';
            modal.classList.remove('show', 'fade-in');
        });
    }
};

// 모임 신청 모달 표시
function showApplyModal() {
    if (!requireLogin('모임 신청')) return;
    modalManager.show('apply-modal');
}

// 모임 신청 확인 (실제 백엔드 API에 맞춤)
async function confirmApply() {
    const applyBtn = document.getElementById('applyBtn');

    try {
        if (applyBtn) {
            applyBtn.disabled = true;
            applyBtn.innerHTML = '<span>⏳</span> 신청 중...';
        }

        const response = await apiRequest(`/api/meetings/${window.currentMeetingId}/apply`, {
            method: 'POST'
        });

        if (response.ok) {
            notificationManager.success('모임 신청이 완료되었습니다! 호스트의 승인을 기다려주세요.');
            modalManager.hide('apply-modal');
            updateParticipationUI('PENDING');
        } else {
            throw new Error('신청 처리에 실패했습니다.');
        }

    } catch (error) {
        console.error('모임 신청 실패:', error);
        notificationManager.error('모임 신청에 실패했습니다. 다시 시도해주세요.');

        if (applyBtn) {
            applyBtn.disabled = false;
            applyBtn.innerHTML = '<span>📝</span> 모임 신청';
        }
    }
}

// 글쓰기 모달 열기
function openWriteModal() {
    if (!requireLogin('글 작성')) return;

    if (window.userRole === 'guest') {
        notificationManager.warning('모임 참여자만 글을 작성할 수 있습니다.');
        return;
    }

    // 폼 초기화
    const titleInput = document.getElementById('postTitle');
    const contentInput = document.getElementById('postContent');

    if (titleInput) titleInput.value = '';
    if (contentInput) contentInput.value = '';

    modalManager.show('write-modal');
}

// 게시글 작성 (실제 백엔드 API에 맞춤)
async function submitPost() {
    const titleElement = document.getElementById('postTitle');
    const contentElement = document.getElementById('postContent');
    const submitBtn = document.querySelector('#write-modal .btn-primary');

    if (!titleElement || !contentElement) {
        notificationManager.error('입력 필드를 찾을 수 없습니다.');
        return;
    }

    const title = titleElement.value.trim();
    const content = contentElement.value.trim();

    // 유효성 검사
    if (!title) {
        notificationManager.warning('제목을 입력해주세요.');
        titleElement.focus();
        return;
    }

    if (!content) {
        notificationManager.warning('내용을 입력해주세요.');
        contentElement.focus();
        return;
    }

    if (title.length > APP_CONFIG.MAX_TITLE_LENGTH) {
        notificationManager.warning(`제목은 ${APP_CONFIG.MAX_TITLE_LENGTH}자 이내로 입력해주세요.`);
        return;
    }

    if (content.length > APP_CONFIG.MAX_CONTENT_LENGTH) {
        notificationManager.warning(`내용은 ${APP_CONFIG.MAX_CONTENT_LENGTH}자 이내로 입력해주세요.`);
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
            notificationManager.success('게시글이 작성되었습니다.');
            modalManager.hide('write-modal');
            loadPosts(); // 게시글 목록 새로고침
        } else {
            throw new Error('게시글 작성에 실패했습니다.');
        }

    } catch (error) {
        console.error('게시글 작성 실패:', error);
        notificationManager.error('게시글 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '게시';
        }
    }
}

// 대기 중인 참가신청 로드 (실제 백엔드 API에 맞춤)
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

// 대기 아이템 생성
function createPendingItem(participant) {
    const item = document.createElement('div');
    item.className = 'pending-item';
    item.style.animation = 'fadeIn 0.3s ease-in';

    item.innerHTML = `
        <div class="pending-info">
            <div class="pending-avatar">${participant.username.charAt(0)}</div>
            <div class="pending-name">${utils.escapeHtml(participant.username)}</div>
        </div>
        <div class="pending-actions">
            <button class="btn btn-success btn-sm" onclick="approveParticipant(${participant.userId})" title="승인">
                ✓
            </button>
            <button class="btn btn-danger btn-sm" onclick="rejectParticipant(${participant.userId})" title="거절">
                ✗
            </button>
        </div>
    `;

    return item;
}

// 참가자 승인 (실제 백엔드 API에 맞춤)
async function approveParticipant(userId) {
    try {
        const response = await apiRequest(`/api/meetings/${window.currentMeetingId}/participants/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify({ action: 'APPROVE' })
        });

        if (response.ok) {
            notificationManager.success('참가자를 승인했습니다.');

            // 해당 아이템 즉시 제거
            const pendingItem = event.target.closest('.pending-item');
            if (pendingItem) {
                pendingItem.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => pendingItem.remove(), 300);
            }

            // 목록 새로고침
            setTimeout(() => {
                loadPendingRequests();
                loadParticipants();
            }, 500);

        } else {
            throw new Error('승인 처리에 실패했습니다.');
        }

    } catch (error) {
        console.error('승인 실패:', error);
        notificationManager.error('승인 처리에 실패했습니다. 다시 시도해주세요.');
    }
}

// 참가자 거절 (실제 백엔드 API에 맞춤)
async function rejectParticipant(userId) {
    if (!confirm('정말로 이 참가신청을 거절하시겠습니까?')) return;

    try {
        const response = await apiRequest(`/api/meetings/${window.currentMeetingId}/participants/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify({ action: 'REJECT' })
        });

        if (response.ok) {
            notificationManager.info('참가신청을 거절했습니다.');

            // 해당 아이템 즉시 제거
            const pendingItem = event.target.closest('.pending-item');
            if (pendingItem) {
                pendingItem.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => pendingItem.remove(), 300);
            }

            // 목록 새로고침
            setTimeout(() => {
                loadPendingRequests();
            }, 500);

        } else {
            throw new Error('거절 처리에 실패했습니다.');
        }

    } catch (error) {
        console.error('거절 실패:', error);
        notificationManager.error('거절 처리에 실패했습니다. 다시 시도해주세요.');
    }
}

// 참가자 목록 로드 (실제 백엔드 API에 맞춤)
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

            // 참여자 수 업데이트
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

        // 테스트 데이터로 폴백
        loadTestParticipants();
    } finally {
        if (loadingElement) loadingElement.style.display = 'none';
    }
}

// 참여자 수 업데이트
function updateParticipantCount(count) {
    const countElement = document.getElementById('participants-count');
    const remainingElement = document.getElementById('remaining-slots');

    // 현재 모임 정보에서 최대 참여자 수 가져오기
    const maxParticipants = parseInt(document.querySelector('[data-max-participants]')?.textContent) || 8;

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
            applyBtn.innerHTML = '<span>❌</span> 모집 마감';
            applyBtn.className = 'btn btn-secondary btn-full';
        }
    }
}

// 참가자 아이템 생성
function createParticipantItem(participant) {
    const item = document.createElement('div');
    item.className = 'participant-mini-item';
    item.style.animation = 'fadeIn 0.3s ease-in';

    const roleText = participant.role === 'HOST' ? '호스트' : '참여자';
    const roleClass = participant.role === 'HOST' ? 'host' : 'participant';

    item.innerHTML = `
        <div class="participant-mini-avatar ${roleClass}">${participant.username.charAt(0)}</div>
        <div class="participant-mini-info">
            <div class="participant-mini-name">${utils.escapeHtml(participant.username)}</div>
            <div class="participant-mini-status">${roleText}</div>
        </div>
    `;

    return item;
}

// 게시글 목록 로드 (실제 백엔드 API에 맞춤)
async function loadPosts() {
    const loadingElement = document.getElementById('posts-loading');
    const listElement = document.getElementById('posts-list');
    const statsElement = document.getElementById('board-stats');

    try {
        if (loadingElement) loadingElement.style.display = 'block';
        if (listElement) listElement.innerHTML = '';

        // 백엔드 API: page는 1부터 시작, size=10
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

        // 테스트 데이터로 폴백
        loadTestPosts();
    } finally {
        if (loadingElement) loadingElement.style.display = 'none';
    }
}

// 게시글 아이템 생성
function createPostItem(post) {
    const item = document.createElement('div');
    item.className = 'post-item';
    item.style.animation = 'fadeIn 0.3s ease-in';
    item.onclick = () => viewPostDetail(post);

    const timeAgo = utils.getTimeAgo(new Date(post.createdAt));
    const truncatedContent = utils.truncateText(post.content, 100);

    item.innerHTML = `
        <div class="post-header">
            <div>
                <div class="post-title">${utils.escapeHtml(post.title)}</div>
                <div class="post-meta">
                    <div class="post-author">
                        <div class="author-avatar">${post.authorName.charAt(0)}</div>
                        <span>${utils.escapeHtml(post.authorName)}</span>
                    </div>
                    <span>•</span>
                    <span>${timeAgo}</span>
                </div>
            </div>
        </div>
        <div class="post-content">${utils.escapeHtml(truncatedContent)}</div>
        <div class="post-stats">
            <div class="post-stat-item">
                <span>💬</span>
                <span>댓글 ${post.commentCount || 0}</span>
            </div>
        </div>
    `;

    return item;
}

// 게시글 상세 보기 (실제 백엔드 API에 맞춤)
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

// 게시글 상세 모달 표시
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
        metaElement.innerHTML = `
            <div class="post-author">
                <div class="author-avatar">${post.authorName.charAt(0)}</div>
                <span>${utils.escapeHtml(post.authorName)}</span>
            </div>
            <span>•</span>
            <span>${utils.formatDate(post.createdAt)}</span>
        `;
    }

    // 댓글 로드
    loadPostComments(post);

    // 현재 게시글 ID 설정
    window.currentPostId = post.postId;

    modalManager.show('post-detail-modal');
}

// 게시글 댓글 로드
function loadPostComments(post) {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;

    try {
        // 백엔드 API 응답에 댓글이 포함되어 있는 경우
        if (post.comments && Array.isArray(post.comments)) {
            displayComments(post.comments);
        } else {
            commentsList.innerHTML = '<div style="text-align: center; color: #777; padding: 20px;">아직 댓글이 없습니다.</div>';
        }

    } catch (error) {
        console.error('댓글 로드 실패:', error);
        commentsList.innerHTML = '<div style="text-align: center; color: #777; padding: 20px;">댓글을 불러오는데 실패했습니다.</div>';
    }
}

// 댓글 표시
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
            animation: fadeIn 0.3s ease-in;
        `;

        commentItem.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <div style="width: 24px; height: 24px; background-color: #8b7355; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; color: white; margin-right: 8px;">
                    ${comment.authorName.charAt(0)}
                </div>
                <span style="font-weight: 500; margin-right: 10px;">${utils.escapeHtml(comment.authorName)}</span>
                <span style="font-size: 12px; color: #777;">${utils.getTimeAgo(new Date(comment.createdAt))}</span>
            </div>
            <div style="font-size: 14px; line-height: 1.4; margin-left: 32px;">${utils.escapeHtml(comment.content)}</div>
        `;

        commentsList.appendChild(commentItem);
    });
}

// 댓글 작성 (실제 백엔드 API에 맞춤)
async function addComment() {
    if (!requireLogin('댓글 작성')) return;

    const commentInput = document.getElementById('newComment');
    const submitBtn = document.querySelector('#comment-form button');

    if (!commentInput) return;

    const content = commentInput.value.trim();
    if (!content) {
        notificationManager.warning('댓글 내용을 입력해주세요.');
        commentInput.focus();
        return;
    }

    if (content.length > 500) {
        notificationManager.warning('댓글은 500자 이내로 입력해주세요.');
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
            notificationManager.success('댓글이 작성되었습니다.');
            commentInput.value = '';

            // 게시글 다시 로드하여 댓글 새로고침
            const currentPost = { postId: window.currentPostId };
            viewPostDetail(currentPost);
        } else {
            throw new Error('댓글 작성에 실패했습니다.');
        }

    } catch (error) {
        console.error('댓글 작성 실패:', error);
        notificationManager.error('댓글 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '댓글 작성';
        }
    }
}

// 모임 정보 UI 업데이트 (실제 백엔드 응답 구조에 맞춤)
function updateMeetingInfo(meeting) {
    const updateElement = (id, content) => {
        const element = document.getElementById(id);
        if (element) element.textContent = content;
    };

    const updateAttribute = (id, attr, value) => {
        const element = document.getElementById(id);
        if (element) element.setAttribute(attr, value);
    };

    updateElement('breadcrumb-title', meeting.title);
    updateElement('meeting-title', meeting.title);
    updateElement('book-title', meeting.bookTitle);
    updateElement('book-author', meeting.bookAuthor);
    updateElement('meeting-date', utils.formatDate(meeting.meetingDateTime));
    updateElement('meeting-location', `${meeting.region} ${meeting.city} ${meeting.district}`);
    updateElement('meeting-genre', `장르: ${meeting.genre}`);
    updateElement('meeting-address', meeting.detailedAddress || '상세주소 미제공');

    // 호스트 정보 (백엔드 응답 구조에 맞춤)
    if (meeting.host) {
        updateElement('host-avatar', meeting.host.username.charAt(0));
        updateElement('host-name', `${meeting.host.username} (호스트)`);
        updateElement('host-stats', `받은 좋아요 ${meeting.host.likesCount || 0}개 · 주최 모임 ${meeting.host.hostedMeetingsCount || 0}회`);
    }

    // 상태 정보
    updateElement('status-value', getStatusText(meeting.status));
    updateElement('remaining-slots', `${meeting.maxParticipants - meeting.currentParticipants}자리`);

    // 최대 참여자 수 저장
    updateAttribute('participants-count', 'data-max-participants', meeting.maxParticipants);

    // 마감일 설정 (모임 시간 1시간 전)
    const deadline = new Date(meeting.meetingDateTime);
    deadline.setHours(deadline.getHours() - 1);
    updateElement('deadline', utils.formatDate(deadline));

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
    document.title = `${meeting.title} - 북적북적`;
}

// 상태 배지 업데이트
function updateStatusBadges(meeting) {
    const badgesContainer = document.getElementById('status-badges');
    if (!badgesContainer) return;

    badgesContainer.innerHTML = '';

    // 모집 상태 배지
    const statusBadge = document.createElement('span');
    statusBadge.className = `status-tag status-${meeting.status.toLowerCase()}`;
    statusBadge.textContent = getStatusText(meeting.status);
    badgesContainer.appendChild(statusBadge);

    // 장르 배지
    const genreBadge = document.createElement('span');
    genreBadge.className = 'status-tag genre-tag';
    genreBadge.textContent = meeting.genre;
    badgesContainer.appendChild(genreBadge);

    // 마감 임박 배지 (24시간 이내)
    const meetingTime = new Date(meeting.meetingDateTime);
    const now = new Date();
    const hoursDiff = (meetingTime - now) / (1000 * 60 * 60);

    if (hoursDiff > 0 && hoursDiff < 24 && meeting.status === 'RECRUITING') {
        const urgentBadge = document.createElement('span');
        urgentBadge.className = 'status-tag status-urgent';
        urgentBadge.textContent = '마감 임박';
        urgentBadge.style.backgroundColor = '#ff6b6b';
        badgesContainer.appendChild(urgentBadge);
    }
}

// 상태 텍스트 변환
function getStatusText(status) {
    const statusMap = {
        'RECRUITING': '모집 중',
        'FULL': '모집 마감',
        'COMPLETED': '종료',
        'CANCELLED': '취소됨'
    };
    return statusMap[status] || status;
}

// 네비게이션 헤더 업데이트
function updateNavigationHeader() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    const isLoggedIn = authHelper.isLoggedIn();
    const user = authHelper.getUser();

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
            <span style="color: #555; margin-right: 10px;">안녕하세요, ${utils.escapeHtml(username)}님!</span>
            <a href="#" onclick="logout()">로그아웃</a>
        `;
    }
}

// 네비게이션 함수들
function goHome() {
    window.location.href = '/';
}

function goToLogin() {
    window.location.href = '/auth';
}

function goMyPage() {
    if (!authHelper.isLoggedIn()) {
        notificationManager.warning('로그인이 필요한 서비스입니다.');
        window.location.href = '/auth';
        return;
    }
    window.location.href = '/mypage';
}

function createMeeting() {
    if (!authHelper.isLoggedIn()) {
        notificationManager.warning('로그인이 필요한 서비스입니다.');
        window.location.href = '/auth';
        return;
    }
    window.location.href = '/createMeeting';
}

function editMeeting() {
    if (!requireLogin('모임 수정')) return;
    if (window.userRole !== 'host') {
        notificationManager.error('모임 수정은 호스트만 가능합니다.');
        return;
    }
    window.location.href = `/createMeeting?edit=true&id=${window.currentMeetingId}`;
}

function logout() {
    if (!authHelper.isLoggedIn()) {
        notificationManager.info('이미 로그아웃 상태입니다.');
        return;
    }

    if (confirm('정말 로그아웃하시겠습니까?')) {
        // 백엔드 로그아웃 API 호출
        apiRequest('/api/auth/logout', { method: 'POST' })
            .then(() => {
                authHelper.logout();
                notificationManager.success('로그아웃되었습니다.');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            })
            .catch(() => {
                // 백엔드 오류가 있어도 클라이언트에서 로그아웃 처리
                authHelper.logout();
                notificationManager.success('로그아웃되었습니다.');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            });
    }
}

// 실시간 업데이트 (폴링)
let pollingInterval;

function startPolling() {
    if (!APP_CONFIG.ENABLE_REAL_TIME) return;

    pollingInterval = setInterval(async () => {
        try {
            if (window.userRole === 'host') {
                await loadPendingRequests();
            }
            await loadParticipants();
        } catch (error) {
            console.log('폴링 업데이트 실패:', error.message);
        }
    }, APP_CONFIG.POLLING_INTERVAL);
}

function stopPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
}

// 테스트 데이터 (폴백용)
function loadTestMeetingData() {
    const testMeeting = {
        meetingId: 1,
        title: "따뜻한 겨울 소설 읽기",
        description: "겨울에 어울리는 따뜻한 소설을 함께 읽어요",
        bookTitle: "논픽션",
        bookAuthor: "김영하 지음",
        genre: "소설",
        meetingDateTime: "2025-08-25T19:00:00",
        region: "서울",
        city: "강남구",
        district: "역삼동",
        detailedAddress: "강남역 2번 출구 앞 카페",
        maxParticipants: 8,
        status: "RECRUITING",
        imageUrl: null,
        hostId: 1,
        host: {
            id: 1,
            username: "도도롱",
            likesCount: 23,
            hostedMeetingsCount: 8
        },
        currentParticipants: 5
    };

    updateMeetingInfo(testMeeting);
    checkUserRole(testMeeting);
}

function loadTestParticipants() {
    const testParticipants = [
        { userId: 1, username: "도도롱", role: "HOST", status: "APPROVED" },
        { userId: 2, username: "책벌레123", role: "PARTICIPANT", status: "APPROVED" },
        { userId: 3, username: "소설마니아", role: "PARTICIPANT", status: "APPROVED" }
    ];

    const listElement = document.getElementById('participants-list');
    if (!listElement) return;

    listElement.innerHTML = '';
    testParticipants.forEach(participant => {
        const item = createParticipantItem(participant);
        listElement.appendChild(item);
    });

    updateParticipantCount(testParticipants.length);
}

function loadTestPosts() {
    const testPosts = [
        {
            postId: 1,
            title: "책 읽은 소감 미리 공유해요!",
            content: "김영하 작가의 '논픽션' 정말 재미있게 읽고 있어요. 특히 3장이 인상깊었는데, 여러분은 어떤 부분이 가장 기억에 남으시나요?",
            authorName: "도도롱",
            createdAt: "2025-08-17T10:00:00",
            commentCount: 2,
            comments: [
                {
                    commentId: 1,
                    content: "저도 3장이 좋았어요! 특히 마지막 장면이 인상적이었습니다.",
                    authorName: "책벌레123",
                    createdAt: "2025-08-17T11:00:00"
                }
            ]
        }
    ];

    const listElement = document.getElementById('posts-list');
    const statsElement = document.getElementById('board-stats');

    if (listElement) {
        listElement.innerHTML = '';
        testPosts.forEach(post => {
            const item = createPostItem(post);
            listElement.appendChild(item);
        });
    }

    if (statsElement) {
        statsElement.textContent = `총 ${testPosts.length}개의 게시글`;
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 모달 관련 이벤트
    document.addEventListener('click', (e) => {
        // 모달 배경 클릭 시 닫기
        if (e.target.classList.contains('modal-overlay')) {
            modalManager.hideAll();
        }

        // 모달 닫기 버튼
        if (e.target.matches('.modal .btn-secondary') &&
            (e.target.textContent.includes('취소') || e.target.textContent.includes('닫기'))) {
            modalManager.hideAll();
        }
    });

    // 키보드 이벤트
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modalManager.hideAll();
        }
    });

    // 폼 검증 이벤트
    const titleInput = document.getElementById('postTitle');
    const contentInput = document.getElementById('postContent');

    if (titleInput) {
        titleInput.addEventListener('input', utils.debounce((e) => {
            const length = e.target.value.length;
            if (length > APP_CONFIG.MAX_TITLE_LENGTH) {
                notificationManager.warning(`제목은 ${APP_CONFIG.MAX_TITLE_LENGTH}자 이내로 입력해주세요.`);
            }
        }, APP_CONFIG.DEBOUNCE_DELAY));
    }

    if (contentInput) {
        contentInput.addEventListener('input', utils.debounce((e) => {
            const length = e.target.value.length;
            if (length > APP_CONFIG.MAX_CONTENT_LENGTH) {
                notificationManager.warning(`내용은 ${APP_CONFIG.MAX_CONTENT_LENGTH}자 이내로 입력해주세요.`);
            }
        }, APP_CONFIG.DEBOUNCE_DELAY));
    }

    // 페이지 가시성 변경 이벤트
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopPolling();
        } else if (window.isInitialized) {
            startPolling();
            utils.debounce(() => {
                getCurrentUser();
                if (window.userRole === 'host') {
                    loadPendingRequests();
                }
                loadParticipants();
            }, 1000)();
        }
    });

    // 브라우저 뒤로가기/앞으로가기
    window.addEventListener('popstate', () => {
        getCurrentUser();
    });
}

// 페이지 초기화
async function initializePage() {
    if (window.isInitialized) return;

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

        // 초기 로딩 표시
        loadingManager.start('initial-load');

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

        // 실시간 업데이트 시작
        startPolling();

        // 초기화 완료
        window.isInitialized = true;
        console.log('페이지 초기화 완료');

        // 성공 알림
        if (results.some(r => r.status === 'fulfilled')) {
            notificationManager.success('페이지가 로드되었습니다.', 2000);
        }

    } catch (error) {
        console.error('페이지 초기화 실패:', error);
        notificationManager.error('페이지 로드 중 오류가 발생했습니다.');
    } finally {
        loadingManager.end('initial-load');
    }
}

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', initializePage);

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    stopPolling();
});

// 오류 처리
window.addEventListener('error', (e) => {
    console.error('전역 오류:', e.error);
    notificationManager.error('예상치 못한 오류가 발생했습니다.');
});

// 네트워크 상태 감지
window.addEventListener('online', () => {
    notificationManager.success('네트워크가 연결되었습니다.');
    if (window.isInitialized) {
        setTimeout(() => {
            loadMeetingDetail();
            loadParticipants();
            loadPosts();
        }, 1000);
    }
});

window.addEventListener('offline', () => {
    notificationManager.warning('네트워크 연결이 끊어졌습니다. 일부 기능이 제한될 수 있습니다.');
    stopPolling();
});

// 개발자 도구 (실제 백엔드와 연동된 버전)
window.debugMeeting = {
    // 현재 상태 확인
    getState() {
        return {
            meetingId: window.currentMeetingId,
            currentUserId: window.currentUserId,
            userRole: window.userRole,
            isInitialized: window.isInitialized,
            isLoggedIn: authHelper.isLoggedIn(),
            user: authHelper.getUser(),
            polling: !!pollingInterval,
            currentUser: window.currentUser
        };
    },

    // 강제 데이터 새로고침
    async refresh() {
        console.log('강제 새로고침 시작');
        await Promise.all([
            loadMeetingDetail(),
            loadParticipants(),
            loadPosts(),
            window.userRole === 'host' ? loadPendingRequests() : Promise.resolve()
        ]);
        console.log('새로고침 완료');
    },

    // 실제 백엔드 로그인 테스트
    async testLogin(email = 'test@example.com', password = 'password') {
        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const authData = await response.json();
                localStorage.setItem('authToken', authData.token);
                localStorage.setItem('userInfo', JSON.stringify(authData.user));

                authHelper.updateAuthState();
                console.log('로그인 성공:', authData.user);
                notificationManager.success('로그인 성공!');
            } else {
                console.error('로그인 실패:', response.status);
                notificationManager.error('로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            notificationManager.error('로그인 중 오류가 발생했습니다.');
        }
    },

    // 알림 테스트
    testNotifications() {
        notificationManager.success('성공 알림 테스트');
        setTimeout(() => notificationManager.error('오류 알림 테스트'), 1000);
        setTimeout(() => notificationManager.warning('경고 알림 테스트'), 2000);
        setTimeout(() => notificationManager.info('정보 알림 테스트'), 3000);
    },

    // 모달 테스트
    testModals() {
        setTimeout(() => modalManager.show('apply-modal'), 500);
        setTimeout(() => {
            modalManager.hideAll();
            modalManager.show('write-modal');
        }, 2500);
        setTimeout(() => modalManager.hideAll(), 4500);
    },

    // API 엔드포인트 테스트
    async testAPI() {
        const endpoints = [
            `/api/meetings/${window.currentMeetingId}`,
            `/api/meetings/${window.currentMeetingId}/participants`,
            `/api/meetings/${window.currentMeetingId}/posts`,
            '/api/auth/me'
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await apiRequest(endpoint);
                console.log(`✅ ${endpoint}: ${response.status}`);
            } catch (error) {
                console.log(`❌ ${endpoint}: ${error.message}`);
            }
        }
    },

    // 성능 정보
    getPerformance() {
        return {
            loadTime: performance.now(),
            memory: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB'
            } : 'N/A',
            navigation: performance.getEntriesByType('navigation')[0]
        };
    },

    // 백엔드 연결 상태 확인
    async checkBackend() {
        console.log('백엔드 연결 상태 확인 중...');

        const checks = [
            { name: '서버 상태', endpoint: '/api/auth/me' },
            { name: '모임 API', endpoint: `/api/meetings/${window.currentMeetingId}` },
            { name: '게시글 API', endpoint: `/api/meetings/${window.currentMeetingId}/posts` }
        ];

        for (const check of checks) {
            try {
                const response = await fetch(check.endpoint, {
                    headers: authHelper.getToken() ? {
                        'Authorization': `Bearer ${authHelper.getToken()}`
                    } : {}
                });

                console.log(`✅ ${check.name}: ${response.status} ${response.statusText}`);
            } catch (error) {
                console.log(`❌ ${check.name}: ${error.message}`);
            }
        }
    },

    // 실제 기능 테스트
    async testFeatures() {
        console.log('실제 기능 테스트 시작...');

        if (!authHelper.isLoggedIn()) {
            console.log('로그인이 필요합니다.');
            return;
        }

        // 1. 게시글 작성 테스트
        try {
            const testPost = {
                title: '테스트 게시글 ' + Date.now(),
                content: '이것은 테스트 게시글입니다.'
            };

            const response = await apiRequest(`/api/meetings/${window.currentMeetingId}/posts`, {
                method: 'POST',
                body: JSON.stringify(testPost)
            });

            if (response.ok) {
                console.log('✅ 게시글 작성 테스트 성공');
                loadPosts(); // 새로고침
            }
        } catch (error) {
            console.log('❌ 게시글 작성 테스트 실패:', error.message);
        }

        // 2. 모임 신청 테스트 (멤버인 경우)
        if (window.userRole === 'member') {
            try {
                const response = await apiRequest(`/api/meetings/${window.currentMeetingId}/apply`, {
                    method: 'POST'
                });

                if (response.ok) {
                    console.log('✅ 모임 신청 테스트 성공');
                    checkParticipationStatus();
                }
            } catch (error) {
                console.log('❌ 모임 신청 테스트 실패:', error.message);
            }
        }

        console.log('기능 테스트 완료');
    }
};

// 개발 환경에서만 디버그 정보 출력
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🚀 북적북적 모임 상세 페이지 (실제 백엔드 연동 버전)');
    console.log('디버그 명령어:');
    console.log('- debugMeeting.getState() : 현재 상태 확인');
    console.log('- debugMeeting.refresh() : 데이터 새로고침');
    console.log('- debugMeeting.testLogin(email, password) : 실제 로그인 테스트');
    console.log('- debugMeeting.testNotifications() : 알림 테스트');
    console.log('- debugMeeting.testModals() : 모달 테스트');
    console.log('- debugMeeting.testAPI() : API 연결 테스트');
    console.log('- debugMeeting.checkBackend() : 백엔드 연결 상태 확인');
    console.log('- debugMeeting.testFeatures() : 실제 기능 테스트');
    console.log('- debugMeeting.getPerformance() : 성능 정보');
}

// 접근성 향상
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
});

// 스크롤 위치 복원
const saveScrollPosition = utils.debounce(() => {
    sessionStorage.setItem('scrollPosition', window.pageYOffset);
}, 100);

const restoreScrollPosition = () => {
    const savedPosition = sessionStorage.getItem('scrollPosition');
    if (savedPosition) {
        window.scrollTo(0, parseInt(savedPosition));
        sessionStorage.removeItem('scrollPosition');
    }
};

window.addEventListener('scroll', saveScrollPosition);
window.addEventListener('beforeunload', saveScrollPosition);

// 초기화 완료 후 스크롤 위치 복원
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(restoreScrollPosition, 100);
});

// 터치 기기 지원 개선
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', e => {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', e => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // 위로 스와이프 - 새로고침
            if (window.pageYOffset === 0) {
                utils.debounce(() => {
                    notificationManager.info('새로고침 중...');
                    window.debugMeeting?.refresh();
                }, 500)();
            }
        }
    }
}

// 전역 오류 핸들러 개선
const originalConsoleError = console.error;
console.error = function(...args) {
    const errorMessage = args.join(' ');

    // 중요한 오류만 사용자에게 알림
    if (errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('Network Error') ||
        errorMessage.includes('500') ||
        errorMessage.includes('401') ||
        errorMessage.includes('403')) {

        if (!errorMessage.includes('테스트')) { // 테스트 중인 오류는 제외
            notificationManager.error('서버와의 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.');
        }
    }

    // 원래 console.error 호출
    originalConsoleError.apply(console, args);
};

// 마지막 체크: 핵심 함수들이 전역에서 접근 가능한지 확인
window.showApplyModal = showApplyModal;
window.confirmApply = confirmApply;
window.openWriteModal = openWriteModal;
window.submitPost = submitPost;
window.addComment = addComment;
window.approveParticipant = approveParticipant;
window.rejectParticipant = rejectParticipant;
window.goHome = goHome;
window.goToLogin = goToLogin;
window.goMyPage = goMyPage;
window.createMeeting = createMeeting;
window.editMeeting = editMeeting;
window.logout = logout;

console.log('✨ 북적북적 모임 상세 페이지 (실제 백엔드 연동) 준비 완료!');