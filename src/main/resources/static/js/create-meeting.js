// 전역 변수
let selectedImageFile = null;

// 페이지 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

/**
 * 페이지 초기화
 */
function initializePage() {
    setMinDate();
    setupEventListeners();
    loadLocationData();
}

/**
 * 오늘 이후 날짜만 선택 가능하도록 설정
 */
function setMinDate() {
    const dateInput = document.getElementById('date');
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    dateInput.min = minDate;
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
    // 파일 드래그 앤 드롭 이벤트
    const uploadArea = document.querySelector('.file-upload-area');
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
}

/**
 * 지역 데이터 로드 (간소화된 버전)
 */
function loadLocationData() {
    // 실제 구현에서는 외부 API나 데이터베이스에서 로드
    const locationData = {
        '서울특별시': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구'],
        '부산광역시': ['해운대구', '수영구', '부산진구', '동래구', '남구', '북구', '사상구', '연제구'],
        '대구광역시': ['중구', '동구', '서구', '남구', '북구', '수성구', '달서구', '달성군'],
        '인천광역시': ['중구', '동구', '연수구', '남동구', '부평구', '계양구', '서구', '강화군'],
        '경기도': ['수원시', '성남시', '고양시', '용인시', '부천시', '안산시', '안양시', '남양주시']
    };

    window.locationData = locationData;
}

/**
 * 시/도 변경 시 시/군 업데이트
 */
function updateCities() {
    const province = document.getElementById('province').value;
    const citySelect = document.getElementById('city');
    const districtSelect = document.getElementById('district');

    // 시/군과 구 초기화
    citySelect.innerHTML = '<option value="">시/군 선택</option>';
    districtSelect.innerHTML = '<option value="">구 선택</option>';

    if (province && window.locationData && window.locationData[province]) {
        const cities = window.locationData[province];
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
}

/**
 * 시/군 변경 시 구 업데이트 (현재는 동일하게 처리)
 */
function updateDistricts() {
    const city = document.getElementById('city').value;
    const districtSelect = document.getElementById('district');

    // 구 초기화
    districtSelect.innerHTML = '<option value="">구 선택</option>';

    if (city) {
        // 실제로는 더 세분화된 데이터가 필요하지만,
        // 현재는 선택된 시/군을 구 옵션으로도 표시
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        districtSelect.appendChild(option);
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

    // 필수 필드 검사
    const requiredFields = [
        { id: 'title', name: '모임 제목' },
        { id: 'bookTitle', name: '책 제목' },
        { id: 'author', name: '저자' },
        { id: 'genre', name: '장르' },
        { id: 'date', name: '날짜' },
        { id: 'time', name: '시간' },
        { id: 'province', name: '시/도' },
        { id: 'city', name: '시/군' },
        { id: 'district', name: '구' },
        { id: 'maxCapacity', name: '최대 인원' }
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
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;

    if (date && time) {
        const selectedDateTime = new Date(date + 'T' + time);
        const now = new Date();

        if (selectedDateTime <= now) {
            showError('timeError', '모임 시간은 현재 시간 이후로 설정해야 합니다.');
            return false;
        }
    }

    clearError('dateError');
    clearError('timeError');
    return true;
}

/**
 * 최대 인원 유효성 검사
 */
function validateMaxCapacity() {
    const capacity = parseInt(document.getElementById('maxCapacity').value);

    if (capacity < 2 || capacity > 12) {
        showError('maxCapacityError', '최대 인원은 2명 이상 12명 이하로 설정해주세요.');
        return false;
    }

    clearError('maxCapacityError');
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
    // 폼 유효성 검사
    if (!validateForm()) {
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

        // 서버에 전송
        const response = await fetch('/api/meetings', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            alert('모임이 성공적으로 생성되었습니다!');
            // 모임 상세 페이지로 이동
            window.location.href = `/meetings/${result.meetingId}`;
        } else {
            const error = await response.json();
            alert(`모임 생성에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
        }
    } catch (error) {
        console.error('모임 생성 오류:', error);
        alert('모임 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        // 버튼 상태 복원
        submitBtn.disabled = false;
        submitText.textContent = '모임 만들기';
    }
}

/**
 * FormData 생성
 */
function createFormData() {
    const formData = new FormData();

    // 텍스트 데이터
    formData.append('title', document.getElementById('title').value.trim());
    formData.append('bookTitle', document.getElementById('bookTitle').value.trim());
    formData.append('bookAuthor', document.getElementById('author').value.trim());
    formData.append('genre', document.getElementById('genre').value);
    formData.append('region', document.getElementById('province').value);
    formData.append('city', document.getElementById('city').value);
    formData.append('maxParticipants', document.getElementById('maxCapacity').value);

    // 선택적 필드
    const detailAddress = document.getElementById('detailAddress').value.trim();
    if (detailAddress) {
        formData.append('detailAddress', detailAddress);
    }

    // 날짜/시간 조합
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const meetingTime = date + 'T' + time;
    formData.append('meetingTime', meetingTime);

    // 이미지 파일
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