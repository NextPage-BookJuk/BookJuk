// 전역 변수
let selectedImageFile = null;

// 지역 데이터 (3단계 구조: 시/도 → 시/군 → 구/군) - 전국 완전 데이터
const regionData = {
    "서울특별시": {
        "종로구": ["종로구"],
        "중구": ["중구"],
        "용산구": ["용산구"],
        "성동구": ["성동구"],
        "광진구": ["광진구"],
        "동대문구": ["동대문구"],
        "중랑구": ["중랑구"],
        "성북구": ["성북구"],
        "강북구": ["강북구"],
        "도봉구": ["도봉구"],
        "노원구": ["노원구"],
        "은평구": ["은평구"],
        "서대문구": ["서대문구"],
        "마포구": ["마포구"],
        "양천구": ["양천구"],
        "강서구": ["강서구"],
        "구로구": ["구로구"],
        "금천구": ["금천구"],
        "영등포구": ["영등포구"],
        "동작구": ["동작구"],
        "관악구": ["관악구"],
        "서초구": ["서초구"],
        "강남구": ["강남구"],
        "송파구": ["송파구"],
        "강동구": ["강동구"]
    },
    "부산광역시": {
        "중구": ["중구"],
        "서구": ["서구"],
        "동구": ["동구"],
        "영도구": ["영도구"],
        "부산진구": ["부산진구"],
        "동래구": ["동래구"],
        "남구": ["남구"],
        "북구": ["북구"],
        "해운대구": ["해운대구"],
        "사하구": ["사하구"],
        "금정구": ["금정구"],
        "강서구": ["강서구"],
        "연제구": ["연제구"],
        "수영구": ["수영구"],
        "사상구": ["사상구"],
        "기장군": ["기장군"]
    },
    "대구광역시": {
        "중구": ["중구"],
        "동구": ["동구"],
        "서구": ["서구"],
        "남구": ["남구"],
        "북구": ["북구"],
        "수성구": ["수성구"],
        "달서구": ["달서구"],
        "달성군": ["달성군"]
    },
    "인천광역시": {
        "중구": ["중구"],
        "동구": ["동구"],
        "미추홀구": ["미추홀구"],
        "연수구": ["연수구"],
        "남동구": ["남동구"],
        "부평구": ["부평구"],
        "계양구": ["계양구"],
        "서구": ["서구"],
        "강화군": ["강화군"],
        "옹진군": ["옹진군"]
    },
    "광주광역시": {
        "동구": ["동구"],
        "서구": ["서구"],
        "남구": ["남구"],
        "북구": ["북구"],
        "광산구": ["광산구"]
    },
    "대전광역시": {
        "동구": ["동구"],
        "중구": ["중구"],
        "서구": ["서구"],
        "유성구": ["유성구"],
        "대덕구": ["대덕구"]
    },
    "울산광역시": {
        "중구": ["중구"],
        "남구": ["남구"],
        "동구": ["동구"],
        "북구": ["북구"],
        "울주군": ["울주군"]
    },
    "세종특별자치시": {
        "세종시": ["세종시"]
    },
    "경기도": {
        "수원시": ["영통구", "장안구", "팔달구", "연무구"],
        "성남시": ["수정구", "중원구", "분당구"],
        "안양시": ["만안구", "동안구"],
        "안산시": ["상록구", "단원구"],
        "용인시": ["처인구", "기흥구", "수지구"],
        "고양시": ["덕양구", "일산동구", "일산서구"],
        "부천시": ["원미구", "소사구", "오정구"],
        "광명시": ["광명시"],
        "평택시": ["평택시"],
        "과천시": ["과천시"],
        "오산시": ["오산시"],
        "시흥시": ["시흥시"],
        "군포시": ["군포시"],
        "의왕시": ["의왕시"],
        "하남시": ["하남시"],
        "이천시": ["이천시"],
        "안성시": ["안성시"],
        "김포시": ["김포시"],
        "화성시": ["화성시"],
        "광주시": ["광주시"],
        "여주시": ["여주시"],
        "구리시": ["구리시"],
        "남양주시": ["남양주시"],
        "동두천시": ["동두천시"],
        "양주시": ["양주시"],
        "의정부시": ["의정부시"],
        "파주시": ["파주시"],
        "연천군": ["연천군"],
        "가평군": ["가평군"],
        "포천시": ["포천시"],
        "양평군": ["양평군"]
    },
    "강원도": {
        "춘천시": ["춘천시"],
        "원주시": ["원주시"],
        "강릉시": ["강릉시"],
        "동해시": ["동해시"],
        "태백시": ["태백시"],
        "속초시": ["속초시"],
        "삼척시": ["삼척시"],
        "홍천군": ["홍천군"],
        "횡성군": ["횡성군"],
        "영월군": ["영월군"],
        "평창군": ["평창군"],
        "정선군": ["정선군"],
        "철원군": ["철원군"],
        "화천군": ["화천군"],
        "양구군": ["양구군"],
        "인제군": ["인제군"],
        "고성군": ["고성군"],
        "양양군": ["양양군"]
    },
    "충청북도": {
        "청주시": ["상당구", "서원구", "흥덕구", "청원구"],
        "충주시": ["충주시"],
        "제천시": ["제천시"],
        "보은군": ["보은군"],
        "옥천군": ["옥천군"],
        "영동군": ["영동군"],
        "증평군": ["증평군"],
        "진천군": ["진천군"],
        "괴산군": ["괴산군"],
        "음성군": ["음성군"],
        "단양군": ["단양군"]
    },
    "충청남도": {
        "천안시": ["동남구", "서북구"],
        "공주시": ["공주시"],
        "보령시": ["보령시"],
        "아산시": ["아산시"],
        "서산시": ["서산시"],
        "논산시": ["논산시"],
        "계룡시": ["계룡시"],
        "당진시": ["당진시"],
        "금산군": ["금산군"],
        "부여군": ["부여군"],
        "서천군": ["서천군"],
        "청양군": ["청양군"],
        "홍성군": ["홍성군"],
        "예산군": ["예산군"],
        "태안군": ["태안군"]
    },
    "전라북도": {
        "전주시": ["완산구", "덕진구"],
        "군산시": ["군산시"],
        "익산시": ["익산시"],
        "정읍시": ["정읍시"],
        "남원시": ["남원시"],
        "김제시": ["김제시"],
        "완주군": ["완주군"],
        "진안군": ["진안군"],
        "무주군": ["무주군"],
        "장수군": ["장수군"],
        "임실군": ["임실군"],
        "순창군": ["순창군"],
        "고창군": ["고창군"],
        "부안군": ["부안군"]
    },
    "전라남도": {
        "목포시": ["목포시"],
        "여수시": ["여수시"],
        "순천시": ["순천시"],
        "나주시": ["나주시"],
        "광양시": ["광양시"],
        "담양군": ["담양군"],
        "곡성군": ["곡성군"],
        "구례군": ["구례군"],
        "고흥군": ["고흥군"],
        "보성군": ["보성군"],
        "화순군": ["화순군"],
        "장흥군": ["장흥군"],
        "강진군": ["강진군"],
        "해남군": ["해남군"],
        "영암군": ["영암군"],
        "무안군": ["무안군"],
        "함평군": ["함평군"],
        "영광군": ["영광군"],
        "장성군": ["장성군"],
        "완도군": ["완도군"],
        "진도군": ["진도군"],
        "신안군": ["신안군"]
    },
    "경상북도": {
        "포항시": ["남구", "북구"],
        "경주시": ["경주시"],
        "김천시": ["김천시"],
        "안동시": ["안동시"],
        "구미시": ["구미시"],
        "영주시": ["영주시"],
        "영천시": ["영천시"],
        "상주시": ["상주시"],
        "문경시": ["문경시"],
        "경산시": ["경산시"],
        "군위군": ["군위군"],
        "의성군": ["의성군"],
        "청송군": ["청송군"],
        "영양군": ["영양군"],
        "영덕군": ["영덕군"],
        "청도군": ["청도군"],
        "고령군": ["고령군"],
        "성주군": ["성주군"],
        "칠곡군": ["칠곡군"],
        "예천군": ["예천군"],
        "봉화군": ["봉화군"],
        "울진군": ["울진군"],
        "울릉군": ["울릉군"]
    },
    "경상남도": {
        "창원시": ["의창구", "성산구", "마산합포구", "마산회원구", "진해구"],
        "진주시": ["진주시"],
        "통영시": ["통영시"],
        "사천시": ["사천시"],
        "김해시": ["김해시"],
        "밀양시": ["밀양시"],
        "거제시": ["거제시"],
        "양산시": ["양산시"],
        "의령군": ["의령군"],
        "함안군": ["함안군"],
        "창녕군": ["창녕군"],
        "고성군": ["고성군"],
        "남해군": ["남해군"],
        "하동군": ["하동군"],
        "산청군": ["산청군"],
        "함양군": ["함양군"],
        "거창군": ["거창군"],
        "합천군": ["합천군"]
    },
    "제주특별자치도": {
        "제주시": ["제주시"],
        "서귀포시": ["서귀포시"]
    }
};

// 페이지 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 상태 확인
    if (!checkLoginStatus()) {
        alert('로그인이 필요한 서비스입니다.');
        window.location.href = '/login';
        return;
    }
    
    initializePage();
});

/**
 * 로그인 상태 확인
 * @returns {boolean} 로그인 여부
 */
function checkLoginStatus() {
    const token = getJwtTokenFromCookie();
    return token !== null && token.trim() !== '';
}

/**
 * 쿠키에서 JWT 토큰 추출
 * @returns {string|null} JWT 토큰 또는 null
 */
function getJwtTokenFromCookie() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'jwt' || name === 'token' || name === 'authToken') {
            return value;
        }
    }
    return null;
}

/**
 * 페이지 초기화
 */
function initializePage() {
    setMinDate();
    setupEventListeners();
    initializeSelects();
}

/**
 * 오늘 이후 날짜만 선택 가능하도록 설정
 */
function setMinDate() {
    const dateInput = document.getElementById('meetingDate');
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    dateInput.min = minDate;
}

/**
 * 선택박스들을 초기 비활성화 상태로 설정
 */
function initializeSelects() {
    const citySelect = document.getElementById('city');
    const districtSelect = document.getElementById('district');

    citySelect.disabled = true;
    districtSelect.disabled = true;
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
    // 파일 드래그 앤 드롭 이벤트
    const uploadArea = document.querySelector('.file-upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
    }
}

/**
 * 시/도 변경 시 시/군 업데이트
 */
function updateCities() {
    console.log('updateCities 함수 호출됨');

    const regionSelect = document.getElementById('region');
    const citySelect = document.getElementById('city');
    const districtSelect = document.getElementById('district');
    const selectedRegion = regionSelect.value;

    console.log('선택된 지역:', selectedRegion);

    // 시/군과 구/군 초기화
    citySelect.innerHTML = '<option value="">시/군 선택</option>';
    districtSelect.innerHTML = '<option value="">구/군 선택</option>';
    districtSelect.disabled = true;

    if (selectedRegion && regionData[selectedRegion]) {
        console.log('지역 데이터 발견:', regionData[selectedRegion]);

        // 선택된 시/도에 해당하는 시/군 목록 추가
        Object.keys(regionData[selectedRegion]).forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });

        // 시/군 선택 활성화
        citySelect.disabled = false;
        console.log('시/군 선택 활성화됨');
    } else {
        // 시/도가 선택되지 않은 경우 비활성화
        citySelect.disabled = true;
        citySelect.innerHTML = '<option value="">시/도를 먼저 선택해주세요</option>';
        console.log('시/군 선택 비활성화됨');
    }
}

/**
 * 시/군 변경 시 구/군 업데이트
 */
function updateDistricts() {
    console.log('updateDistricts 함수 호출됨');

    const regionSelect = document.getElementById('region');
    const citySelect = document.getElementById('city');
    const districtSelect = document.getElementById('district');
    const selectedRegion = regionSelect.value;
    const selectedCity = citySelect.value;

    console.log('선택된 시/군:', selectedCity);

    // 구/군 초기화
    districtSelect.innerHTML = '<option value="">구/군 선택</option>';

    if (selectedRegion && selectedCity && regionData[selectedRegion] && regionData[selectedRegion][selectedCity]) {
        console.log('구/군 데이터 발견:', regionData[selectedRegion][selectedCity]);

        // 선택된 시/군에 해당하는 구/군 목록 추가
        regionData[selectedRegion][selectedCity].forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });

        // 구/군 선택 활성화
        districtSelect.disabled = false;
        console.log('구/군 선택 활성화됨');
    } else {
        // 시/군이 선택되지 않은 경우 비활성화
        districtSelect.disabled = true;
        districtSelect.innerHTML = '<option value="">시/군을 먼저 선택해주세요</option>';
        console.log('구/군 선택 비활성화됨');
    }
}

/**
 * 이미지 미리보기
 */
function previewImage(input) {
    const file = input.files[0];
    if (file) {
        if (validateImageFile(file)) {
            selectedImageFile = file;
            showImagePreview(file);
            clearError('imageError');
        } else {
            input.value = '';
            selectedImageFile = null;
        }
    }
}

/**
 * 이미지 파일 유효성 검사
 */
function validateImageFile(file) {
    // 파일 크기 검사 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        showError('imageError', '이미지 크기는 10MB를 초과할 수 없습니다.');
        return false;
    }

    // 파일 형식 검사
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
        showError('imageError', 'JPG, PNG 형식의 이미지만 업로드할 수 있습니다.');
        return false;
    }

    return true;
}

/**
 * 이미지 미리보기 표시
 */
function showImagePreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewDiv = document.getElementById('imagePreview');
        previewDiv.innerHTML = `
            <img src="${e.target.result}" class="preview-image" alt="미리보기">
            <button type="button" class="remove-image" onclick="removeImage()">이미지 제거</button>
        `;
    };
    reader.readAsDataURL(file);
}

/**
 * 이미지 제거
 */
function removeImage() {
    document.getElementById('meetingImage').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    selectedImageFile = null;
    clearError('imageError');
}

/**
 * 드래그 오버 이벤트
 */
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

/**
 * 드래그 리브 이벤트
 */
function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

/**
 * 드롭 이벤트
 */
function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (validateImageFile(file)) {
            selectedImageFile = file;
            showImagePreview(file);
            clearError('imageError');
        }
    }
}

/**
 * 폼 유효성 검사
 */
function validateForm() {
    let isValid = true;

    // 필수 필드 검사 (3단계 지역 구조 포함)
    const requiredFields = [
        { id: 'title', name: '모임 제목' },
        { id: 'bookTitle', name: '책 제목' },
        { id: 'bookAuthor', name: '저자' },
        { id: 'genre', name: '장르' },
        { id: 'meetingDate', name: '날짜' },
        { id: 'meetingTime', name: '시간' },
        { id: 'region', name: '시/도' },
        { id: 'city', name: '시/군' },
        { id: 'district', name: '구/군' },
        { id: 'maxParticipants', name: '최대 인원' }
    ];

    requiredFields.forEach(field => {
        const element = document.getElementById(field.id);
        const value = element.value.trim();

        if (!value) {
            showError(field.id + 'Error', `${field.name}을(를) 입력해주세요.`);
            isValid = false;
        } else {
            clearError(field.id + 'Error');
        }
    });

    // 날짜/시간 검사
    if (isValid && !validateDateTime()) {
        isValid = false;
    }

    // 최대 인원 검사
    if (isValid && !validateMaxCapacity()) {
        isValid = false;
    }

    return isValid;
}

/**
 * 날짜/시간 유효성 검사
 */
function validateDateTime() {
    const date = document.getElementById('meetingDate').value;
    const time = document.getElementById('meetingTime').value;

    if (date && time) {
        const selectedDateTime = new Date(date + 'T' + time);
        const now = new Date();

        if (selectedDateTime <= now) {
            showError('meetingTimeError', '모임 시간은 현재 시간 이후로 설정해야 합니다.');
            return false;
        }
    }

    clearError('meetingDateError');
    clearError('meetingTimeError');
    return true;
}

/**
 * 최대 인원 유효성 검사
 */
function validateMaxCapacity() {
    const capacity = parseInt(document.getElementById('maxParticipants').value);

    if (capacity < 2 || capacity > 10) {
        showError('maxParticipantsError', '최대 인원은 2명 이상 10명 이하로 설정해주세요.');
        return false;
    }

    clearError('maxParticipantsError');
    return true;
}

/**
 * 에러 메시지 표시
 */
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // 해당 입력 필드에 에러 스타일 추가
        const inputElement = document.getElementById(elementId.replace('Error', ''));
        if (inputElement) {
            inputElement.classList.add('error');
        }
    }
}

/**
 * 에러 메시지 지우기
 */
function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.style.display = 'none';
        errorElement.textContent = '';

        // 해당 입력 필드의 에러 스타일 제거
        const inputElement = document.getElementById(elementId.replace('Error', ''));
        if (inputElement) {
            inputElement.classList.remove('error');
        }
    }
}

/**
 * 모임 저장 (메인 함수)
 */
async function saveMeeting() {
    // 로그인 상태 재확인
    if (!checkLoginStatus()) {
        alert('로그인이 필요한 서비스입니다.');
        window.location.href = '/login';
        return;
    }

    // 폼 유효성 검사
    if (!validateForm()) {
        return;
    }

    // 이미지 파일 크기 검증 (10MB)
    if (selectedImageFile && selectedImageFile.size > 10 * 1024 * 1024) {
        alert('이미지 파일 크기는 10MB를 초과할 수 없습니다.');
        return;
    }

    // 이미지 파일 타입 검증
    if (selectedImageFile && !isValidImageFile(selectedImageFile)) {
        alert('jpg, jpeg, png, gif, bmp, webp 형식의 이미지 파일만 업로드 가능합니다.');
        return;
    }

    // 버튼 비활성화 및 로딩 표시
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    submitBtn.disabled = true;
    submitText.textContent = '생성 중...';

    try {
        // FormData 생성
        const formData = createFormData();

        // JWT 토큰 가져오기
        const token = getJwtTokenFromCookie();
        if (!token) {
            throw new Error('인증 토큰이 없습니다.');
        }

        // 서버에 전송
        const response = await fetch('/api/meetings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            alert('모임이 성공적으로 생성되었습니다!');
            // 모임 상세 페이지로 이동
            window.location.href = `/meetings/${result.meetingId}`;
        } else {
            // 에러 응답 처리
            await handleErrorResponse(response);
        }
    } catch (error) {
        console.error('모임 생성 오류:', error);
        if (error.message.includes('인증') || error.message.includes('로그인')) {
            alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
            window.location.href = '/login';
        } else {
            alert('모임 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    } finally {
        // 버튼 상태 복원
        submitBtn.disabled = false;
        submitText.textContent = '모임 만들기';
    }
}

/**
 * 에러 응답 처리
 * @param {Response} response - fetch 응답 객체
 */
async function handleErrorResponse(response) {
    try {
        const error = await response.json();
        
        // 상태 코드별 처리
        switch (response.status) {
            case 401:
                alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
                window.location.href = '/login';
                break;
            case 403:
                alert('접근 권한이 없습니다.');
                break;
            case 400:
                if (error.code === 'FILE_SIZE_EXCEEDED') {
                    alert('파일 크기가 너무 큽니다. 10MB 이하의 파일을 업로드해주세요.');
                } else if (error.code === 'INVALID_INPUT') {
                    alert('입력값이 올바르지 않습니다. 이미지 파일인지 확인해주세요.');
                } else {
                    alert(`입력 오류: ${error.message || '올바르지 않은 입력값입니다.'}`);
                }
                break;
            case 409:
                alert('이미 존재하는 데이터입니다.');
                break;
            case 500:
                alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
                break;
            default:
                alert(`모임 생성에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
        }
    } catch (parseError) {
        console.error('에러 응답 파싱 실패:', parseError);
        alert('모임 생성에 실패했습니다. 다시 시도해주세요.');
    }
}

/**
 * 이미지 파일 유효성 검사
 * @param {File} file - 검사할 파일
 * @returns {boolean} 유효한 이미지 파일 여부
 */
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

/**
 * FormData 생성 (3단계 지역 포함)
 */
function createFormData() {
    const formData = new FormData();

    // 텍스트 데이터
    formData.append('title', document.getElementById('title').value.trim());
    formData.append('bookTitle', document.getElementById('bookTitle').value.trim());
    formData.append('bookAuthor', document.getElementById('bookAuthor').value.trim());
    formData.append('genre', document.getElementById('genre').value);
    formData.append('region', document.getElementById('region').value);
    formData.append('city', document.getElementById('city').value);
    formData.append('district', document.getElementById('district').value);
    formData.append('maxParticipants', document.getElementById('maxParticipants').value);

    // description 필드 추가
    const description = document.getElementById('description').value.trim();
    if (description) {
        formData.append('description', description);
    }

    // 선택적 필드
    const detailAddress = document.getElementById('detailAddress').value.trim();
    if (detailAddress) {
        formData.append('detailAddress', detailAddress);
    }

    // 날짜/시간 조합
    const date = document.getElementById('meetingDate').value;
    const time = document.getElementById('meetingTime').value;
    const meetingTime = date + 'T' + time;
    formData.append('meetingTime', meetingTime);

    // 이미지 파일 (imageFile로 변경하여 백엔드와 일치시킴)
    if (selectedImageFile) {
        formData.append('imageFile', selectedImageFile);
    }

    return formData;
}

/**
 * 뒤로가기
 */
function goBack() {
    if (confirm('작성 중인 내용이 사라집니다. 정말 나가시겠습니까?')) {
        history.back();
    }
}

/**
 * 홈으로 이동
 */
function goHome() {
    window.location.href = '/';
}

/**
 * 마이페이지로 이동
 */
function goMyPage() {
    window.location.href = '/mypage';
}