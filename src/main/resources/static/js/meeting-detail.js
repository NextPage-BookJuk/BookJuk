// 현재 사용자 상태 (예: 'guest', 'member', 'host', 'participant')
        let userRole = 'guest'; // 실제로는 서버에서 받아온 값
        let currentParticipantToReject = '';

        // 페이지 로드 시 사용자 권한에 따른 UI 표시
        document.addEventListener('DOMContentLoaded', () => {
            updateUIByUserRole();
        });

        function updateUIByUserRole() {
            const isHost = userRole === 'host';
            const isParticipant = userRole === 'participant';
            const isGuest = userRole === 'guest';

            // 호스트 전용 버튼 표시
            const editBtn = document.getElementById('editBtn');
            const cancelBtn = document.getElementById('cancelBtn');
            const applyBtn = document.getElementById('applyBtn');
            const writeBtn = document.getElementById('writeBtn');
            const attendanceTab = document.getElementById('attendanceTab');
            
            if (isHost) {
                editBtn.style.display = 'inline-flex';
                cancelBtn.style.display = 'inline-flex';
                applyBtn.style.display = 'none';
                writeBtn.style.display = 'inline-flex';
                attendanceTab.style.display = 'block';
                
                // 참여자 관리 버튼들 표시
                document.querySelectorAll('.host-only').forEach(btn => {
                    btn.style.display = 'inline-flex';
                });
            } else if (isParticipant) {
                applyBtn.style.display = 'none';
                writeBtn.style.display = 'inline-flex';
                attendanceTab.style.display = 'block';
                
                // 신청 완료 상태 표시
                applyBtn.innerHTML = '<span>✓</span> 참여 확정';
                applyBtn.disabled = true;
            } else if (isGuest) {
                writeBtn.style.display = 'none';
            }
        }

        function showTab(tabName) {
            // 모든 탭 버튼과 컨텐츠 비활성화
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            // 선택된 탭 활성화
            event.target.classList.add('active');
            document.getElementById(tabName + '-tab').classList.add('active');
        }

        function applyToMeeting() {
            if (userRole === 'guest') {
                alert('로그인이 필요한 서비스입니다.');
                window.location.href = 'login.html';
                return;
            }
            document.getElementById('apply-modal').style.display = 'block';
        }

        function confirmApply() {
            alert('모임 신청이 완료되었습니다. 호스트의 승인을 기다려주세요.');
            closeModal();
            
            // UI 업데이트
            userRole = 'pending';
            const applyBtn = document.getElementById('applyBtn');
            applyBtn.innerHTML = '<span>⏰</span> 신청 대기 중';
            applyBtn.disabled = true;
        }

        function approveParticipant(username) {
            alert(`${username}님의 참여를 승인했습니다.`);
            location.reload();
        }

        function rejectParticipant(username) {
            if (confirm(`${username}님의 참여를 거절하시겠습니까?`)) {
                alert(`${username}님의 참여를 거절했습니다.`);
                location.reload();
            }
        }

        function removeParticipant(username) {
            if (confirm(`${username}님을 모임에서 제외하시겠습니까?`)) {
                alert(`${username}님이 모임에서 제외되었습니다.`);
                location.reload();
            }
        }

        function editMeeting() {
            window.location.href = 'create-meeting.html?edit=true&id=123';
        }

        function cancelMeeting() {
            if (confirm('정말로 모임을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                alert('모임이 취소되었습니다.');
                location.reload();
            }
        }

        function markAttendance(isAttending) {
            const action = isAttending ? '참여' : '불참';
            if (confirm(`출석을 '${action}'으로 표시하시겠습니까?`)) {
                alert(`출석이 '${action}'으로 표시되었습니다.`);
            }
        }

        function openWriteModal() {
            if (userRole === 'guest') {
                alert('참여자만 글을 작성할 수 있습니다.');
                return;
            }
            document.getElementById('write-modal').style.display = 'block';
        }

        function submitPost() {
            const title = document.getElementById('postTitle').value.trim();
            const content = document.getElementById('postContent').value.trim();

            if (!title || !content) {
                alert('제목과 내용을 모두 입력해주세요.');
                return;
            }

            alert('게시글이 작성되었습니다.');
            closeModal();
            location.reload();
        }

        function viewPost(postId) {
            // 실제로는 서버에서 게시글 데이터를 가져옴
            const postData = {
                1: {
                    title: '책 읽은 소감 미리 공유해요!',
                    author: '도도뇽',
                    avatar: '도',
                    date: '2시간 전',
                    content: '김영하 작가의 \'논픽션\' 정말 재미있게 읽고 있어요. 현실과 허구 사이의 경계에 대한 이야기가 인상 깊네요. 다들 어떻게 생각하시나요?',
                    comments: 2,
                    likes: 5
                },
                2: {
                    title: '모임 장소 안내',
                    author: '도도뇽',
                    avatar: '도',
                    date: '1일 전',
                    content: '안녕하세요! 모임 장소는 강남역 근처 조용한 카페로 정했습니다. 자세한 주소는 개별 메시지로 보내드릴게요.',
                    comments: 8,
                    likes: 3
                },
                3: {
                    title: '처음 참여합니다!',
                    author: '책벌레123',
                    avatar: '책',
                    date: '3일 전',
                    content: '독서모임 처음 참여하는데 떨리네요! 잘 부탁드려요 😊',
                    comments: 5,
                    likes: 7
                }
            };

            const post = postData[postId];
            if (post) {
                document.getElementById('postDetailTitle').textContent = post.title;
                document.getElementById('postDetailMeta').innerHTML = `
                    <div class="post-author">
                        <div class="author-avatar">${post.avatar}</div>
                        <span>${post.author}</span>
                    </div>
                    <span>•</span>
                    <span>${post.date}</span>
                `;
                document.getElementById('postDetailContent').textContent = post.content;
                document.getElementById('postDetailStats').innerHTML = `
                    <div class="post-stat-item">
                        <span>💬</span>
                        <span>댓글 ${post.comments}</span>
                    </div>
                    <div class="post-stat-item">
                        <span>👍</span>
                        <span>좋아요 ${post.likes}</span>
                    </div>
                `;
                
                // 댓글 목록 (예시)
                document.getElementById('commentsList').innerHTML = `
                    <div style="padding: 10px; background-color: #f8f6f3; border-radius: 8px; margin-bottom: 10px;">
                        <div style="font-weight: 500; margin-bottom: 5px;">책벌레123</div>
                        <div style="font-size: 14px;">정말 공감되는 부분이에요!</div>
                    </div>
                `;
                
                document.getElementById('post-detail-modal').style.display = 'block';
            }
        }

        function addComment() {
            const comment = document.getElementById('newComment').value.trim();
            if (!comment) {
                alert('댓글 내용을 입력해주세요.');
                return;
            }
            
            alert('댓글이 작성되었습니다.');
            document.getElementById('newComment').value = '';
        }

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
            window.location.href = 'index.html';
        }

        function goMyPage() {
            window.location.href = 'mypage.html';
        }

        function createMeeting() {
            window.location.href = 'create-meeting.html';
        }

        function logout() {
            if (confirm('정말 로그아웃하시겠습니까?')) {
                alert('로그아웃되었습니다.');
                window.location.href = 'index.html';
            }
        }

        // 모달 외부 클릭 시 닫기
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-overlay')) {
                closeModal();
            }
        });
