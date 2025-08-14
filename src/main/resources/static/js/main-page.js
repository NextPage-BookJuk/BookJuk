// ===== 지역 데이터 (2단계: 시/도 → 구/군) =====
const regionData = {
  "서울특별시": ["종로구","중구","용산구","성동구","광진구","동대문구","중랑구","성북구","강북구","도봉구","노원구","은평구","서대문구","마포구","양천구","강서구","구로구","금천구","영등포구","동작구","관악구","서초구","강남구","송파구","강동구"],
  "부산광역시": ["중구","서구","동구","영도구","부산진구","동래구","남구","북구","해운대구","사하구","금정구","강서구","연제구","수영구","사상구","기장군"],
  "대구광역시": ["중구","동구","서구","남구","북구","수성구","달서구","달성군"],
  "인천광역시": ["중구","동구","미추홀구","연수구","남동구","부평구","계양구","서구","강화군","옹진군"],
  "광주광역시": ["동구","서구","남구","북구","광산구"],
  "대전광역시": ["동구","중구","서구","유성구","대덕구"],
  "울산광역시": ["중구","남구","동구","북구","울주군"],
  "세종특별자치시": ["세종시"],
  "경기도": ["수원시","성남시","안양시","안산시","용인시","고양시","부천시","광명시","평택시","과천시","오산시","시흥시","군포시","의왕시","하남시","이천시","안성시","김포시","화성시","광주시","여주시","구리시","남양주시","동두천시","양주시","의정부시","파주시","연천군","가평군","포천시","양평군"],
  "강원도": ["춘천시","원주시","강릉시","동해시","태백시","속초시","삼척시","홍천군","횡성군","영월군","평창군","정선군","철원군","화천군","양구군","인제군","고성군","양양군"],
  "충청북도": ["청주시","충주시","제천시","보은군","옥천군","영동군","증평군","진천군","괴산군","음성군","단양군"],
  "충청남도": ["천안시","공주시","보령시","아산시","서산시","논산시","계룡시","당진시","금산군","부여군","서천군","청양군","홍성군","예산군","태안군"],
  "전라북도": ["전주시","군산시","익산시","정읍시","남원시","김제시","완주군","진안군","무주군","장수군","임실군","순창군","고창군","부안군"],
  "전라남도": ["목포시","여수시","순천시","나주시","광양시","담양군","곡성군","구례군","고흥군","보성군","화순군","장흥군","강진군","해남군","영암군","무안군","함평군","영광군","장성군","완도군","진도군","신안군"],
  "경상북도": ["포항시","경주시","김천시","안동시","구미시","영주시","영천시","상주시","문경시","경산시","군위군","의성군","청송군","영양군","영덕군","청도군","고령군","성주군","칠곡군","예천군","봉화군","울진군","울릉군"],
  "경상남도": ["창원시","진주시","통영시","사천시","김해시","밀양시","거제시","양산시","의령군","함안군","창녕군","고성군","남해군","하동군","산청군","함양군","거창군","합천군"],
  "제주특별자치도": ["제주시","서귀포시"]
};

// ===== 공통 드롭다운 초기화 (장르/상태/지역/정렬 공통) =====
function initDropdowns() {
  const dropdowns = document.querySelectorAll('.filter-dropdown');

  dropdowns.forEach(dropdown => {
    const labelEl = dropdown.querySelector('.dropdown-label');
    const menuEl  = dropdown.querySelector('.dropdown-menu');
    if (!labelEl || !menuEl) return;

    dropdown.addEventListener('click', (e) => {
      if (dropdown.classList.contains('disabled')) return;
      if (e.target.closest('.dropdown-menu li')) return;
      document.querySelectorAll('.dropdown-menu.active').forEach(m => { if (m !== menuEl) m.classList.remove('active'); });
      menuEl.classList.toggle('active');
    });

    dropdown.addEventListener('keydown', (e) => {
      if (dropdown.classList.contains('disabled')) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); menuEl.classList.toggle('active'); }
      else if (e.key === 'Escape') { menuEl.classList.remove('active'); }
    });

    menuEl.addEventListener('click', (e) => {
      const item = e.target.closest('li');
      if (!item) return;
      const code = item.getAttribute('data-value') || item.textContent.trim();
      const icon = labelEl.querySelector('.icon')?.textContent ?? '';
      labelEl.innerHTML = `<span class="icon">${icon}</span>${item.textContent.trim()}`;
      dropdown.setAttribute('data-value', code);
      menuEl.classList.remove('active');
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.filter-dropdown')) {
      document.querySelectorAll('.dropdown-menu.active').forEach(m => m.classList.remove('active'));
    }
  });
}

// ===== 지역(시/도 -> 구/군) 메뉴 동적 생성 =====
function initRegionMenus() {
  const region1Filter = document.querySelector('.region1-filter');
  const region2Filter = document.querySelector('.region2-filter');
  const region1Menu   = document.getElementById('region1-menu');
  const region2Menu   = document.getElementById('region2-menu');

  if (!region1Filter || !region2Filter || !region1Menu || !region2Menu) return;

  // 시/도 목록 구성
  Object.keys(regionData).forEach(siDo => {
    const li = document.createElement('li');
    li.textContent = siDo;
    li.dataset.value = siDo;
    region1Menu.appendChild(li);
  });

  // 시/도 선택 → 구/군 목록 갱신 & 활성화
  region1Menu.addEventListener('click', (e) => {
    const item = e.target.closest('li');
    if (!item) return;

    const siDo = item.dataset.value;
    region1Filter.setAttribute('data-value', siDo);
    region1Filter.querySelector('.dropdown-label').innerHTML = `<span class="icon">📍</span>${siDo}`;

    region2Menu.innerHTML = '';
    (regionData[siDo] || []).forEach(guGun => {
      const subLi = document.createElement('li');
      subLi.textContent = guGun;
      subLi.dataset.value = guGun;
      region2Menu.appendChild(subLi);
    });

    region2Filter.setAttribute('data-value', '');
    region2Filter.querySelector('.dropdown-label').innerHTML = `<span class="icon">📍</span>구 / 군`;
    region2Filter.classList.remove('disabled');
  });

  // 구/군 선택 (라벨/값 동기화는 공통 핸들러가 처리)
  region2Menu.addEventListener('click', (e) => {
    const item = e.target.closest('li');
    if (!item) return;
    region2Filter.setAttribute('data-value', item.dataset.value);
  });
}

// ===== 검색 버튼 액션 =====
function initActions() {
  document.querySelectorAll('.meeting-card').forEach(card => {
    card.addEventListener('click', () => {
      alert('모임 상세 페이지로 이동합니다.');
      // location.href = 'meeting-detail.html?id=123';
    });
  });

  document.querySelector('.start-btn')?.addEventListener('click', () => alert('회원가입 페이지로 이동합니다.'));
  document.querySelector('.login-btn')?.addEventListener('click', () => alert('로그인 페이지로 이동합니다.'));
  document.querySelector('.signup-btn')?.addEventListener('click', () => alert('회원가입 페이지로 이동합니다.'));

  document.querySelector('.search-btn')?.addEventListener('click', () => {
    const siDo   = document.querySelector('.region1-filter')?.getAttribute('data-value') || '';
    const guGun  = document.querySelector('.region2-filter')?.getAttribute('data-value') || '';
    const genre  = document.querySelector('.genre-filter')?.getAttribute('data-value')  || '';
    const status = document.querySelector('.status-filter')?.getAttribute('data-value') || '';
    const sortUi = document.querySelector('.sort-filter')?.getAttribute('data-value')  || 'latest';

    // 🔁 UI -> API 매핑 (필요 시 여기만 DTO/컨트롤러 규칙에 맞게 수정)
    // 예시 A) 문자열 사용: latest | deadline | popular
    // 예시 B) Enum 사용: LATEST | DEADLINE | POPULAR
    const SORT_MAP = {
      latest:   'latest',   // 또는 'LATEST'
      deadline: 'deadline', // 또는 'DEADLINE'
      popular:  'popular'   // 또는 'POPULAR'
    };
    const sort = SORT_MAP[sortUi] || 'latest';

    const params = new URLSearchParams({
      region1: siDo,
      region2: guGun,
      genre,
      status,
      sort
    });

    console.log('[검색 파라미터]', params.toString());
    alert(
      `검색 파라미터\n- 시/도: ${siDo}\n- 구/군: ${guGun}\n- 장르: ${genre}\n- 상태: ${status}\n- 정렬: ${sort}`
    );

    // 실제 호출 예)
    // location.href = `/api/meetings?${params.toString()}`;
  });
}

// ===== 페이지 로드 =====
document.addEventListener('DOMContentLoaded', () => {
  initDropdowns();    // 공통 드롭다운
  initRegionMenus();  // 지역(시/도→구/군)
  initActions();      // 버튼/카드
});
