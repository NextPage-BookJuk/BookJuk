let emailChecked = false;

        function showLogin() {
            document.getElementById('loginForm').classList.remove('hidden');
            document.getElementById('signupForm').classList.add('hidden');
            document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
            event.target.classList.add('active');
        }

        function showSignup() {
            document.getElementById('loginForm').classList.add('hidden');
            document.getElementById('signupForm').classList.remove('hidden');
            document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
            event.target.classList.add('active');
        }

        function goHome() {
            alert('메인 페이지로 이동합니다.');
        }

        function validateEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        function validatePassword(password) {
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/;
            return passwordRegex.test(password);
        }

        function checkEmail() {
            const email = document.getElementById('email').value;
            const errorEl = document.getElementById('emailError');
            const successEl = document.getElementById('emailSuccess');
            const emailInput = document.getElementById('email');

            if (!email) {
                showError('emailError', '이메일을 입력해주세요.');
                return;
            }

            if (!validateEmail(email)) {
                showError('emailError', '올바른 이메일 형식이 아닙니다.');
                return;
            }

            // 중복 확인 시뮬레이션
            setTimeout(() => {
                if (email === 'test@example.com') {
                    showError('emailError', '이미 사용 중인 이메일입니다.');
                    emailInput.classList.add('error');
                    emailInput.classList.remove('success');
                    emailChecked = false;
                } else {
                    hideError('emailError');
                    showSuccess('emailSuccess', '사용 가능한 이메일입니다.');
                    emailInput.classList.remove('error');
                    emailInput.classList.add('success');
                    emailChecked = true;
                }
            }, 500);
        }

        function previewImage(input) {
            const preview = document.getElementById('imagePreview');
            const errorEl = document.getElementById('imageError');

            if (input.files && input.files[0]) {
                const file = input.files[0];
                
                // 파일 크기 확인 (10MB)
                if (file.size > 10 * 1024 * 1024) {
                    showError('imageError', '파일 크기는 10MB 이하여야 합니다.');
                    input.value = '';
                    preview.innerHTML = '';
                    return;
                }

                // 파일 형식 확인
                if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
                    showError('imageError', 'JPG, JPEG, PNG 파일만 업로드 가능합니다.');
                    input.value = '';
                    preview.innerHTML = '';
                    return;
                }

                hideError('imageError');
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.innerHTML = `<img src="${e.target.result}" alt="프로필 미리보기">`;
                }
                reader.readAsDataURL(file);
            }
        }

        function showError(id, message) {
            const errorEl = document.getElementById(id);
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }

        function hideError(id) {
            const errorEl = document.getElementById(id);
            errorEl.style.display = 'none';
        }

        function showSuccess(id, message) {
            const successEl = document.getElementById(id);
            successEl.textContent = message;
            successEl.style.display = 'block';
        }

        function handleLogin() {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            // 입력값 검증
            let hasError = false;

            if (!email) {
                showError('loginEmailError', '이메일을 입력해주세요.');
                hasError = true;
            } else if (!validateEmail(email)) {
                showError('loginEmailError', '올바른 이메일 형식이 아닙니다.');
                hasError = true;
            } else {
                hideError('loginEmailError');
            }

            if (!password) {
                showError('loginPasswordError', '비밀번호를 입력해주세요.');
                hasError = true;
            } else {
                hideError('loginPasswordError');
            }

            if (!hasError) {
                // 로그인 처리 시뮬레이션
                if (email === 'user@example.com' && password === 'password123') {
                    alert('로그인 성공!');
                    // 메인 페이지로 이동
                } else {
                    showError('loginPasswordError', '이메일 또는 비밀번호가 일치하지 않습니다.');
                }
            }
        }

        function handleSignup() {
            const nickname = document.getElementById('nickname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const passwordConfirm = document.getElementById('passwordConfirm').value;

            let hasError = false;

            // 닉네임 검증
            if (!nickname.trim()) {
                showError('passwordError', '닉네임을 입력해주세요.');
                hasError = true;
            }

            // 이메일 검증
            if (!emailChecked) {
                showError('emailError', '이메일 중복확인을 해주세요.');
                hasError = true;
            }

            // 비밀번호 검증
            if (!password) {
                showError('passwordError', '비밀번호를 입력해주세요.');
                hasError = true;
            } else if (!validatePassword(password)) {
                showError('passwordError', '영문 + 숫자 포함 6~20자로 입력해주세요.');
                hasError = true;
            } else {
                hideError('passwordError');
            }

            // 비밀번호 확인 검증
            if (!passwordConfirm) {
                showError('passwordConfirmError', '비밀번호 확인을 입력해주세요.');
                hasError = true;
            } else if (password !== passwordConfirm) {
                showError('passwordConfirmError', '비밀번호가 일치하지 않습니다.');
                hasError = true;
            } else {
                hideError('passwordConfirmError');
            }

            if (!hasError) {
                // 선호 장르 수집
                const genres = [];
                document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
                    genres.push(cb.value);
                });

                const formData = {
                    nickname,
                    email,
                    password,
                    genres,
                    introduction: document.getElementById('introduction').value,
                    profileImage: document.getElementById('profileImage').files[0]
                };

                console.log('회원가입 데이터:', formData);
                alert('회원가입이 완료되었습니다!');
                
                // 로그인 폼으로 전환
                showLogin();
            }
        }

        // 이메일 입력 시 중복확인 상태 초기화
        document.getElementById('email').addEventListener('input', function() {
            emailChecked = false;
            this.classList.remove('success', 'error');
            hideError('emailError');
            hideError('emailSuccess');
        });
