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

// ===== 전역 상태 =====
const PAGE_SIZE = 6;
let currentPage = 0;
let lastQuery = null;

// ===== 공통 드롭다운 초기화 =====
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

  // 시/도 목록
  Object.keys(regionData).forEach(siDo => {
    const li = document.createElement('li');
    li.textContent = siDo;
    li.dataset.value = siDo;
    region1Menu.appendChild(li);
  });

  // 시/도 선택 → 구/군 갱신
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

  region2Menu.addEventListener('click', (e) => {
    const item = e.target.closest('li');
    if (!item) return;
    region2Filter.setAttribute('data-value', item.dataset.value);
  });
}

// ===== 유틸: 상태/텍스트/클래스 매핑 =====
function mapStatusToTextKorean(status) {
  switch (status) {
    case 'RECRUITING': return '모집중';
    case 'COMPLETED':  return '종료';
    case 'CANCELLED':  return '취소';
    default:           return status || '';
  }
}
function mapStatusToClass(status) {
  switch (status) {
    case 'RECRUITING': return 'ongoing';
    case 'COMPLETED':  return 'closed';
    case 'CANCELLED':  return 'cancelled';
    default:           return '';
  }
}
function formatDateTime(dtStr) {
  if (!dtStr) return '';
  const d = new Date(dtStr);
  if (isNaN(d)) return dtStr; // 백엔드 포맷 그대로
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  const hh = String(d.getHours()).padStart(2,'0');
  const mm = String(d.getMinutes()).padStart(2,'0');
  return `${y}.${m}.${day} ${hh}:${mm}`;
}
function escapeHtml(str) {
  if (typeof str !== 'string') return str ?? '';
  return str.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
}

// ===== ✅ 스크롤-프리즈(Delta 보정) 유틸 =====
function withScrollFreeze(targetEl, mutateDom) {
  if (!targetEl || typeof mutateDom !== 'function') return mutateDom?.();

  const beforeTop = targetEl.getBoundingClientRect().top;
  // DOM 갱신 수행
  mutateDom();
  // 다음 페인트 타이밍에 상대 위치만큼 보정
  requestAnimationFrame(() => {
    const afterTop = targetEl.getBoundingClientRect().top;
    const delta = afterTop - beforeTop;
    if (delta !== 0) {
      window.scrollBy({ top: delta, left: 0, behavior: 'auto' });
    }
  });
}

// 🔸 새로 추가: 목록 높이 잠금
function lockListHeight(listEl) {
  if (!listEl) return () => {};
  const prevH = listEl.offsetHeight;
  // 이전 렌더 높이가 0이면(초기 상태) 잠금 생략
  if (!prevH) return () => {};
  const prevMin = listEl.style.minHeight;
  listEl.style.minHeight = `${prevH}px`;
  return () => { listEl.style.minHeight = prevMin || ''; };
}

// ===== API 호출 (빈 값은 파라미터에서 제외, sortBy 사용) =====
async function fetchMeetings(query, page=0, size=PAGE_SIZE) {
  const params = new URLSearchParams();
  if (query.region) params.set('region', query.region);
  if (query.city)   params.set('city', query.city);
  if (query.genre)  params.set('genre', query.genre);
  if (query.status) params.set('status', query.status);
  if (query.sortBy) params.set('sortBy', query.sortBy);
  params.set('page', page);
  params.set('size', size);

  const url = `/api/meetings?${params.toString()}`;
  const res = await fetch(url, { headers: { 'Accept':'application/json' } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`목록 조회 실패 (${res.status})\n${text}`);
  }
  return res.json();
}

// ===== 렌더링 =====
function renderMeetings(data) {
  const listEl = document.querySelector('.meeting-list');
  const pagerEl = document.querySelector('.pagination');
  if (!listEl) return;

  const items = data?.content ?? [];
  const total = data?.totalElements ?? items.length;
  const page  = data?.page ?? currentPage;
  const size  = data?.size ?? PAGE_SIZE;
  currentPage = page;

  // 🔒 목록 DOM 교체: 스크롤-프리즈로 감싸기
  withScrollFreeze(listEl, () => {
    if (items.length === 0) {
      // 현재 필터 요약용 chip 텍스트 만들기
      const q = lastQuery || {};
      const chips = [
        q.region ? `시/도: ${q.region}` : null,
        q.city   ? `구/군: ${q.city}`   : null,
        q.genre  ? `장르: ${q.genre}`   : null,
        q.status ? `상태: ${q.status}`  : null,
        `정렬: ${q.sortBy === 'latest' ? '최신순' : q.sortBy === 'deadline' ? '마감임박순' : '인기순'}`
      ].filter(Boolean);

      listEl.innerHTML = `
        <div class="empty-state" role="status" aria-live="polite">
          <div class="icon" aria-hidden="true">📭</div>
          <h3>조건에 맞는 모임이 없어요</h3>
          <p class="hint">필터를 조금 완화하거나 다른 정렬을 시도해보세요.</p>
          <div class="chips">
            ${chips.map(c => `<span class="chip">${c}</span>`).join('')}
          </div>
          <div class="empty-actions">
            <button class="btn primary reset-filters">필터 초기화</button>
            <button class="btn outline reload">최신 모임 보기</button>
          </div>
          <p class="sub">Tip: 지역을 넓히거나 장르 선택을 해제하면 결과가 늘어날 수 있어요.</p>
        </div>
      `;
    } else {
      listEl.innerHTML = items.map(it => {
        const id   = it.meetingId ?? it.id;
        const img  = it.imageUrl ?? '';
        const status = it.status ?? '';
        const genre  = it.genre ?? '';
        const title  = it.title ?? '';
        const desc   = it.description ?? '';
        const when   = it.meetingTime ?? '';
        const city   = it.city ?? it.region ?? '';
        const curr   = it.currentParticipants ?? it.currParticipants ?? it.participantsCount ?? 0;
        const max    = it.maxParticipants ?? it.capacity ?? it.limit ?? 0;
        const host   = (it.host && (it.host.username || it.host.name)) || it.hostUsername || '';

        const statusText = mapStatusToTextKorean(status);
        const statusClass = mapStatusToClass(status);

        return `
        <div class="meeting-card" data-id="${id ?? ''}" role="button" tabindex="0">
          <div class="card-image" style="${img ? `background-image:url('${img}');` : ''}">
            <span class="status-tag ${statusClass}">${statusText}</span>
            <span class="genre-tag">${genre ?? ''}</span>
          </div>
          <div class="card-content">
            <h3 class="card-title">${escapeHtml(title)}</h3>
            <p class="card-info"><span>📖</span><span>${escapeHtml(desc)}</span></p>
            <p class="card-date"><span>🗓️</span><span>${formatDateTime(when)}</span></p>
            <p class="card-location"><span>📍</span><span>${escapeHtml(city)} · ${curr}/${max}명</span></p>
            <p class="card-author"><span>🙋‍♂️</span><span>${escapeHtml(host)}</span></p>
          </div>
        </div>`;
      }).join('');
    }
  });

  // 🔒 페이지네이션 DOM 교체도(선택) 프리즈 적용
  if (pagerEl) {
    const totalPages = Math.max(1, Math.ceil(total / size));
    const prevDisabled = page <= 0 ? 'disabled' : '';
    const nextDisabled = page >= totalPages - 1 ? 'disabled' : '';

    const start = Math.max(0, page - 2);
    const end   = Math.min(totalPages - 1, page + 2);
    const buttons = [];
    for (let p = start; p <= end; p++) {
      buttons.push(`<button class="page-btn ${p===page?'active':''}" data-page="${p}">${p+1}</button>`);
    }

    withScrollFreeze(pagerEl, () => {
      pagerEl.innerHTML = `
        <button class="prev-btn" data-page="${page-1}" ${prevDisabled}>이전</button>
        ${start > 0 ? `<button class="page-btn" data-page="0">1</button><span class="gap">…</span>` : ''}
        ${buttons.join('')}
        ${end < totalPages-1 ? `<span class="gap">…</span><button class="page-btn" data-page="${totalPages-1}">${totalPages}</button>` : ''}
        <button class="next-btn" data-page="${page+1}" ${nextDisabled}>다음</button>
      `;
    });

    pagerEl.querySelectorAll('button[data-page]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const target = Number(btn.getAttribute('data-page'));
        if (isNaN(target) || target === page) return;
        runSearch(target).catch(console.error);
      });
    });
  }

  // === Empty State 액션 바인딩 ===
  const resetBtn = document.querySelector('.reset-filters');
  const reloadBtn = document.querySelector('.reload');
  resetBtn?.addEventListener('click', () => {
    clearFilters();
    runSearch(0).catch(console.error);
  });
  reloadBtn?.addEventListener('click', () => {
    // ✅ 모든 필터 초기화 + 최신순으로 재검색
    clearFilters();
    document.querySelector('.sort-filter')?.setAttribute('data-value', 'latest');
    const sortLabel = document.querySelector('.sort-filter .dropdown-label');
    if (sortLabel) sortLabel.innerHTML = `<span class="icon">↕️</span>최신순`;
    runSearch(0).catch(console.error);
  });
}

// ===== 검색 실행 =====
async function runSearch(page = 0) {
  const siDo   = document.querySelector('.region1-filter')?.getAttribute('data-value') || '';
  const guGun  = document.querySelector('.region2-filter')?.getAttribute('data-value') || '';
  const genre  = document.querySelector('.genre-filter')?.getAttribute('data-value')  || '';
  const status = document.querySelector('.status-filter')?.getAttribute('data-value') || '';
  const sortUi = document.querySelector('.sort-filter')?.getAttribute('data-value')  || 'latest';

  const SORT_MAP = { latest: 'latest', deadline: 'deadline', popular: 'popular' };
  const sortBy = SORT_MAP[sortUi] || 'latest';

  const query = { region: siDo, city: guGun, genre, status, sortBy };
  lastQuery = query;

  const listEl = document.querySelector('.meeting-list');
  // 🔒 높이 잠금 + 로딩 표시도 프리즈로 교체
  let unlock = () => {};
  if (listEl) {
    unlock = lockListHeight(listEl);
    withScrollFreeze(listEl, () => {
      listEl.innerHTML = `<p class="loading">불러오는 중…</p>`;
    });
  }

  try {
    const data = await fetchMeetings(query, page, PAGE_SIZE);
    renderMeetings(data);
  } catch (e) {
    console.error(e);
    if (listEl) {
      withScrollFreeze(listEl, () => {
        listEl.innerHTML = `<p class="error">목록을 불러오지 못했습니다.<br/>${escapeHtml(e.message)}</p>`;
      });
    }
  } finally {
    // 렌더가 끝난 다음 프레임에서 높이 잠금 해제 (두 프레임 뒤에 풀면 더 안전)
    requestAnimationFrame(() => requestAnimationFrame(() => unlock()));
  }
}

// ===== 기타 UI 액션 =====
function initActions() {
  document.querySelector('.start-btn')?.addEventListener('click', () => alert('회원가입 페이지로 이동합니다.'));
  document.querySelector('.login-btn')?.addEventListener('click', () => alert('로그인 페이지로 이동합니다.'));
  document.querySelector('.signup-btn')?.addEventListener('click', () => alert('회원가입 페이지로 이동합니다.'));
  document.querySelector('.search-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    runSearch(0).catch(console.error);
  });
}

// ===== 필터 초기화 =====
function clearFilters() {
  // 시/도
  const r1 = document.querySelector('.region1-filter');
  if (r1) {
    r1.setAttribute('data-value', '');
    const l = r1.querySelector('.dropdown-label');
    if (l) l.innerHTML = `<span class="icon">📍</span>시 / 도`;
  }
  // 구/군
  const r2 = document.querySelector('.region2-filter');
  if (r2) {
    r2.setAttribute('data-value', '');
    r2.classList.add('disabled');
    const l = r2.querySelector('.dropdown-label');
    if (l) l.innerHTML = `<span class="icon">📍</span>구 / 군`;
    // 목록도 비워줌
    const m = document.getElementById('region2-menu');
    if (m) m.innerHTML = '';
  }
  // 장르
  const g = document.querySelector('.genre-filter');
  if (g) {
    g.setAttribute('data-value', '');
    const l = g.querySelector('.dropdown-label');
    if (l) l.innerHTML = `<span class="icon">📚</span>장르 선택`;
  }
  // 상태
  const s = document.querySelector('.status-filter');
  if (s) {
    s.setAttribute('data-value', '');
    const l = s.querySelector('.dropdown-label');
    if (l) l.innerHTML = `<span class="icon">📖</span>상태 선택`;
  }
  // 정렬(최신)
  const sort = document.querySelector('.sort-filter');
  if (sort) {
    sort.setAttribute('data-value', 'latest');
    const l = sort.querySelector('.dropdown-label');
    if (l) l.innerHTML = `<span class="icon">↕️</span>최신순`;
  }
}

// ===== 페이지 로드 =====
document.addEventListener('DOMContentLoaded', () => {
  initDropdowns();
  initRegionMenus();
  initActions();

  // 페이지 로드 시 최신순, page=0, size=6 기준으로 바로 불러오기
  runSearch(0).catch(console.error);
});
