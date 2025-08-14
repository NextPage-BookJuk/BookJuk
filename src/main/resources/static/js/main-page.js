
// 지역 데이터 (2단계 구조: 시/도 → 시/군) - 전국 완전 데이터
const regionData = {
  "서울특별시": [
    "종로구", "중구", "용산구", "성동구", "광진구", "동대문구", "중랑구",
    "성북구", "강북구", "도봉구", "노원구", "은평구", "서대문구", "마포구",
    "양천구", "강서구", "구로구", "금천구", "영등포구", "동작구", "관악구",
    "서초구", "강남구", "송파구", "강동구"
  ],
  "부산광역시": [
    "중구", "서구", "동구", "영도구", "부산진구", "동래구", "남구",
    "북구", "해운대구", "사하구", "금정구", "강서구", "연제구", "수영구",
    "사상구", "기장군"
  ],
  "대구광역시": [
    "중구", "동구", "서구", "남구", "북구", "수성구", "달서구", "달성군"
  ],
  "인천광역시": [
    "중구", "동구", "미추홀구", "연수구", "남동구", "부평구", "계양구",
    "서구", "강화군", "옹진군"
  ],
  "광주광역시": [
    "동구", "서구", "남구", "북구", "광산구"
  ],
  "대전광역시": [
    "동구", "중구", "서구", "유성구", "대덕구"
  ],
  "울산광역시": [
    "중구", "남구", "동구", "북구", "울주군"
  ],
  "세종특별자치시": [
    "세종시"
  ],
  "경기도": [
    "수원시", "성남시", "안양시", "안산시", "용인시", "고양시", "부천시",
    "광명시", "평택시", "과천시", "오산시", "시흥시", "군포시", "의왕시",
    "하남시", "이천시", "안성시", "김포시", "화성시", "광주시", "여주시",
    "구리시", "남양주시", "동두천시", "양주시", "의정부시", "파주시",
    "연천군", "가평군", "포천시", "양평군"
  ],
  "강원도": [
    "춘천시", "원주시", "강릉시", "동해시", "태백시", "속초시", "삼척시",
    "홍천군", "횡성군", "영월군", "평창군", "정선군", "철원군", "화천군",
    "양구군", "인제군", "고성군", "양양군"
  ],
  "충청북도": [
    "청주시", "충주시", "제천시", "보은군", "옥천군", "영동군", "증평군",
    "진천군", "괴산군", "음성군", "단양군"
  ],
  "충청남도": [
    "천안시", "공주시", "보령시", "아산시", "서산시", "논산시", "계룡시",
    "당진시", "금산군", "부여군", "서천군", "청양군", "홍성군", "예산군",
    "태안군"
  ],
  "전라북도": [
    "전주시", "군산시", "익산시", "정읍시", "남원시", "김제시", "완주군",
    "진안군", "무주군", "장수군", "임실군", "순창군", "고창군", "부안군"
  ],
  "전라남도": [
    "목포시", "여수시", "순천시", "나주시", "광양시", "담양군", "곡성군",
    "구례군", "고흥군", "보성군", "화순군", "장흥군", "강진군", "해남군",
    "영암군", "무안군", "함평군", "영광군", "장성군", "완도군", "진도군",
    "신안군"
  ],
  "경상북도": [
    "포항시", "경주시", "김천시", "안동시", "구미시", "영주시", "영천시",
    "상주시", "문경시", "경산시", "군위군", "의성군", "청송군", "영양군",
    "영덕군", "청도군", "고령군", "성주군", "칠곡군", "예천군", "봉화군",
    "울진군", "울릉군"
  ],
  "경상남도": [
    "창원시", "진주시", "통영시", "사천시", "김해시", "밀양시", "거제시",
    "양산시", "의령군", "함안군", "창녕군", "고성군", "남해군", "하동군",
    "산청군", "함양군", "거창군", "합천군"
  ],
  "제주특별자치도": [
    "제주시", "서귀포시"
  ]
};

const initializePage = () => {
  // 필터 드롭다운 기능
  const dropdowns = document.querySelectorAll('.filter-dropdown');
  dropdowns.forEach(dropdown => {
    // const dropdownLabel = dropdown.querySelector('.dropdown-label');
    const dropdownMenu = dropdown.querySelector('.dropdown-menu');

    dropdown.addEventListener('click', (e) => {
      // 메뉴 항목(li)을 클릭한 경우는 여기서 처리하지 않음 (아래 li 핸들러가 처리)
      if (e.target.closest('.dropdown-menu li')) return;

      // 다른 드롭다운 닫기
      dropdowns.forEach(other => {
        if (other !== dropdown) {
          other.querySelector('.dropdown-menu').classList.remove('active');
        }
      });

      // 현재 드롭다운 열고/닫기
      dropdownMenu.classList.toggle('active');
    });

    // 드롭다운 메뉴 항목 선택 시 (기존 그대로 유지)
    const menuItems = dropdownMenu.querySelectorAll('li');
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        // 선택한 항목의 텍스트를 라벨로 업데이트
        dropdownLabel.innerHTML = `
                            <span class="icon">${dropdownLabel.querySelector('.icon').textContent}</span>
                            ${item.textContent}
                        `;
        // 메뉴 닫기
        dropdownMenu.classList.remove('active');
      });
    });
  });

  // 외부 클릭 시 드롭다운 닫기
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.filter-dropdown')) {
      dropdowns.forEach(dropdown => {
        dropdown.querySelector('.dropdown-menu').classList.remove('active');
      });
    }
  });

  // 모임 카드 클릭 이벤트
  const meetingCards = document.querySelectorAll('.meeting-card');
  meetingCards.forEach(card => {
    card.addEventListener('click', () => {
      alert('모임 상세 페이지로 이동합니다.');
      // 실제로는 location.href = 'meeting-detail.html?id=123';
    });
  });

  // 버튼 클릭 이벤트
  document.querySelector('.start-btn').addEventListener('click', () => {
    alert('회원가입 페이지로 이동합니다.');
  });

  document.querySelector('.search-btn').addEventListener('click', () => {
    alert('검색 결과를 표시합니다.');
  });

  document.querySelector('.login-btn').addEventListener('click', () => {
    alert('로그인 페이지로 이동합니다.');
  });

  document.querySelector('.signup-btn').addEventListener('click', () => {
    alert('회원가입 페이지로 이동합니다.');
  });
};

// 페이지 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  initializePage();
});