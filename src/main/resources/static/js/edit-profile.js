// 백엔드 API 서버의 기본 URL
const URL = 'api/mypage';

//=========== DOM ============//
const profileImage = document.getElementById('profileImage');
const username = document.getElementById('username');
const email = document.getElementById('email');
const introduction = document.getElementById('introduction');
const genres = document.querySelectorAll('input[name="genre"]');
const $removeImageBtn = document.querySelector('.remove-image-btn');
let selectedImageFile = null;

//=========== 렌더링 관련 함수 ============//
const renderMyProfile = (myInfo) => {

    // 초기화
    profileImage.innerHTML = ``;
    profileImage.style.backgroundColor= `#8b7355`;
    username.value = ``;
    email.value = ``;
    introduction.value = ``;

    const user = myInfo.data.profile;

    if (!user) {
        console.error('사용자 정보가 없습니다.');
        return;
    }

    profileImage.innerHTML = `
        <img src="${user.profileImage}" alt="프로필 이미지">
    `;
    profileImage.style.backgroundColor= ``;
    username.value = user.username;
    email.value = user.email;
    introduction.value = user.introduction || '';

    const preferredGenre = user.preferredGenre || '';
    genres.forEach(genre => {
        genre.checked = (genre.value === preferredGenre && preferredGenre !== null);
    });

}


//=========== 기타 함수 ============//
// 로컬 스토리지로부터 사용자 정보 가져오기
function getUserFromLocalStorage() {
    try {
        const user = localStorage.getItem('userInfo');
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error('사용자 정보 파싱 오류:', error);
        return null;
    }
}

// 로컬 스토리지에서 토큰 정보 가져오기
function getJwtTokenFromLocalStorage() {
    const token = localStorage.getItem('authToken');
    return token && token.trim() !== '' ? token : null;
}

// 토큰 존재로 로그인 여부 판단
function checkLoginStatus() {
    const token = getJwtTokenFromLocalStorage();
    return token !== null && token.trim() !== '';
}

// 프로필 이미지 업로드
function uploadImage(e) {
    const imagePreview = document.getElementById('profileImage');
    const imageError = document.getElementById('imageError');

    // 에러 메시지 숨기기
    if (imageError) {
        imageError.style.display = 'none';
        imageError.textContent = '';
    }

    // 기존 미리보기 초기화
    if (imagePreview) {
        imagePreview.innerHTML = '';
    }

    // 파일이 선택되지 않았으면 리턴
    if (!e.target.files || !e.target.files[0]) {
        selectedImageFile = null;
        return;
    }

    const file = e.target.files[0];

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
        showImageError('파일 크기는 10MB 이하여야 합니다.');
        e.target.value = '';
        selectedImageFile = null;
        return;
    }

    // 파일 타입 검증
    if (!isValidImageFile(file)) {
        showImageError('JPG, JPEG, PNG, GIF, BMP, WEBP 파일만 업로드 가능합니다.');
        e.target.value = '';
        selectedImageFile = null;
        return;
    }

    // 파일 저장
    selectedImageFile = file;
    console.log("파일 업로드 완료! 미리보기를 생성합니다.")

    // 미리보기 생성
    const reader = new FileReader();
    reader.onload = function(e) {
        if (imagePreview) {
            imagePreview.innerHTML = `
                    <img src="${e.target.result}" alt="미리보기">
            `;
        }
    };
    reader.readAsDataURL(file);

}

// 이미지 삭제
function removeImage() {
    const imageInput = document.getElementById('newImage');
    const imagePreview = document.getElementById('profileImage');
    const imageError = document.getElementById('imageError');

    // 파일 입력 초기화
    if (imageInput) {
        imageInput.value = '';
    }

    // 미리보기 초기화
    if (imagePreview) {
        imagePreview.innerHTML = `
            <img src="/images/defaultProfile.png" alt="프로필 이미지">
        `;
    }

    // 에러 메시지 숨기기
    if (imageError) {
        imageError.style.display = 'none';
        imageError.textContent = '';
    }

    // 전역 변수 초기화
    selectedImageFile = null;



    $removeImageBtn.style.display = 'none';

}

// 이미지 업로드 에러 메세지 처리
function showImageError(message) {
    const imageError = document.getElementById('imageError');
    if (imageError) {
        imageError.textContent = message;
        imageError.style.display = 'block';
    }
}


// 이미지 확장자 검사
function isValidImageFile(file) {
    // 파일 확장자 검사
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop();

    if (!allowedExtensions.includes(fileExtension)) {
        return false;
    }

    // MIME 타입 검사
    if (!file.type.startsWith('image/')) {
        return false;
    }

    return true;
}

// 폼 유효성 검증 (유저 네임 필수 입력 검증)
function validateForm() {
    const username = document.getElementById('username').value.trim();

    if (!username) {
        alert('사용자명을 입력해주세요.');
        return false;
    }

    return true;
}

// 폼 데이터 생성
function createFormData() {

    const genre = document.querySelector('input[name="genre"]:checked')
    const username = document.getElementById('username');
    const introduction = document.getElementById('introduction');

    const formData = new FormData();

    const updateData = {
        username: username.value.trim(),
        preferredGenre: genre ? genre.value : null,
        introduction: introduction.value.trim()
    }


    const profileBlob = new Blob([JSON.stringify(updateData)], {
        type: 'application/json'
    });
    formData.append('profile', profileBlob);

    // 이미지 파일 추가 (imageFile part)
    if (selectedImageFile) {
        formData.append('imageFile', selectedImageFile);
    }

    return formData;
}

// api 응답 에러 처리
async function handleErrorResponse(response) {
    try {
        const error = await response.json();

        // 상태 코드별 처리
        switch (response.status) {
            case 401:
                alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
                window.location.href = '/auth';
                break;
            case 403:
                alert('접근 권한이 없습니다.');
                break;
            case 400:
                if (error.code === 'FILE_SIZE_EXCEEDED') {
                    alert('파일 크기가 너무 큽니다. 10MB 이하의 파일을 업로드해주세요.');
                }
                break;
            default:
                alert(`프로필 정보 수정에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
        }
    } catch (parseError) {
        console.error('에러 응답 파싱 실패:', parseError);
        alert('프로필 정보 수정에 실패했습니다. 다시 시도해주세요.');
    }
}

//=========== 서버 데이터 요청/응답 관련 함수 ============//
const fetchGetMyPage = async () => {
    console.log("마이페이지 js");
    const token = getJwtTokenFromLocalStorage();
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
    renderMyProfile(result);
}

const updateMyProfile = async () => {

    try {

        // 폼 유효성 검증
        if (!validateForm()) {
            return;
        }

        const formData = createFormData();

        // JWT 토큰 가져오기
        const token = getJwtTokenFromLocalStorage();
        if (!token) {
            throw new Error('인증 토큰이 없습니다.');
        }

        const response = await fetch(`${URL}/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            alert('프로필 정보가 성공적으로 수정되었습니다.');

            // 마이페이지로 다시 이동
            // alert 후 약간의 지연을 두고 이동
            setTimeout(() => {
                goToMyPage();
                // window.location.href = '/mypage';
            }, 100);

        } else {
            // 에러 응답 처리
            await handleErrorResponse(response);
        }

    } catch (e) {
        console.error('프로필 정보 수정에 실패했습니다.:', e);

    } finally {

    }
}
function goToMyPage() {
    window.location.href = '/mypage';
}

//=========== 이벤트 핸들러 설정 ============//
const addEventListeners  = () => {
    const $uploadImageBtn = document.querySelector('.file-upload-btn');
    const $imageInput = document.getElementById('newImage');
    const $saveBtn = document.getElementById('submitBtn')
    const $cancelBtn = document.getElementById('cancelBtn');

    $uploadImageBtn.addEventListener('click', e => {
        $imageInput.click();
    })

    $imageInput.addEventListener('change', e => {
        uploadImage(e);
        // 삭제 버튼 보이게 하기
        $removeImageBtn.style.display = 'block';
    })

    $removeImageBtn.addEventListener('click', e => {
        removeImage();
    })

    // 수정 폼 제출
    $saveBtn.addEventListener('click', e => {
        e.preventDefault();
        updateMyProfile();
    })

    $cancelBtn.addEventListener('click', e => {
        e.preventDefault();
        goToMyPage();
    })

}

//=========== 메인 코드 실행 ============//
(function () {

    // 페이지가 처음 열렸을 때 로그인 상태를 확인
    // 로그인 상태 확인
    if (!checkLoginStatus()) {
        document.querySelector('.container').innerHTML = ``;
        alert('로그인이 필요한 서비스입니다.');
        window.location.href = '/auth';
        return;
    }

    // 초기 진입 시 정보 조회
    fetchGetMyPage();

    // 이벤트 핸들러들을 등록합니다.
    addEventListeners();

})();
