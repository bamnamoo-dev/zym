document.addEventListener('DOMContentLoaded', () => {
    // State
    const state = {
        mode: 'short', 
        rates: {
            sports: { small: 15000, medium: 20000, large: 25000 },
            event: { small: 40000, medium: 50000, large: 60000 }
        },
        lightRate: 5000,
        size: 'medium',
        duration: 2,
        category: 'none',
        startDate: '',
        endDate: '',
        selectedDays: [],
        excludeHolidays: false,
        baseExcludeDates: '',
        baseAdjDays: 0,
        
        // Facilities State
        useLighting: false,
        lightStart: '',
        lightEnd: '',
        lightHours: 2,
        lightExcludeDates: '',
        lightAdjDays: 0,

        useCooling: false,
        coolingStart: '',
        coolingEnd: '',
        coolingHours: 2,
        coolingExcludeDates: '',
        coolingAdjDays: 0,

        useHeating: false,
        heatingStart: '',
        heatingEnd: '',
        heatingHours: 2,
        heatingExcludeDates: '',
        heatingAdjDays: 0,

        theme: 'dark'
    };

    const HOLIDAYS_2026 = [
        '2026-01-01', '2026-02-16', '2026-02-17', '2026-02-18', '2026-03-01', '2026-03-02',
        '2026-05-05', '2026-05-24', '2026-05-25', '2026-06-03', '2026-06-06', '2026-07-17',
        '2026-08-15', '2026-08-17', '2026-09-24', '2026-09-25', '2026-09-26', '2026-10-03',
        '2026-10-05', '2026-10-09', '2026-12-25'
    ];

    const $ = (id) => document.getElementById(id);

    // DOM Elements
    const btnShort = $('mode-short');
    const btnLong = $('mode-long');
    const weekdayContainer = $('weekday-selection-container');
    const dateLabel = $('date-label');
    const startDateInput = $('start-date');
    const endDateInput = $('end-date');
    const weekdayChecks = document.querySelectorAll('.day-check input');
    const excludeHolidaysCheck = $('exclude-holidays');
    const baseExcludeDatesInput = $('base-exclude-dates');
    const baseAdjDaysInput = $('base-adj-days');
    const gymSizeSelect = $('gym-size');
    const durationInput = $('duration');
    const durationVal = $('duration-val');
    const categorySelect = $('category');

    // Facilities DOM
    const useLightingCheck = $('use-lighting');
    const lightingDetails = $('lighting-details');
    const lightStartInput = $('light-start');
    const lightEndInput = $('light-end');
    const lightHoursInput = $('light-hours');
    const lightExcludeDatesInput = $('light-exclude-dates');
    const lightAdjDaysInput = $('light-adj-days');

    const useCoolingCheck = $('use-cooling');
    const coolingDetails = $('cooling-details');
    const coolingStartInput = $('cooling-start');
    const coolingEndInput = $('cooling-end');
    const coolingHoursInput = $('cooling-hours');
    const coolingExcludeDatesInput = $('cooling-exclude-dates');
    const coolingAdjDaysInput = $('cooling-adj-days');

    const useHeatingCheck = $('use-heating');
    const heatingDetails = $('heating-details');
    const heatingStartInput = $('heating-start');
    const heatingEndInput = $('heating-end');
    const heatingHoursInput = $('heating-hours');
    const heatingExcludeDatesInput = $('heating-exclude-dates');
    const heatingAdjDaysInput = $('heating-adj-days');

    // Result DOM
    const resSessionCount = $('res-session-count');
    const resTotalHours = $('res-total-hours');
    const resBase = $('res-base');
    const baseMath = $('base-math');
    
    const lightingRow = $('lighting-row');
    const resLighting = $('res-lighting');
    const lightMath = $('light-math');
    
    const coolingRow = $('cooling-row');
    const resCooling = $('res-cooling');
    const coolingMath = $('cooling-math');
    
    const heatingRow = $('heating-row');
    const resHeating = $('res-heating');
    const heatingMath = $('heating-math');

    const resSubtotal = $('res-subtotal');
    const resDiscountLabel = $('res-discount-label');
    const resDiscount = $('res-discount');
    const resTotal = $('res-total');
    
    const themeToggle = $('theme-toggle');
    const modal = $('settings-modal');
    const btnSettings = $('btn-settings');
    const btnCloseModal = document.querySelector('.close-modal');
    const btnSaveSettings = $('btn-save-settings');
    const btnPrint = $('btn-print');

    // Initialization
    initDates();
    loadSettings();
    applyTheme();
    updateUI();

    function initDates() {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        state.startDate = dateStr;
        state.endDate = dateStr;
        if (startDateInput) startDateInput.value = dateStr;
        if (endDateInput) endDateInput.value = dateStr;

        ['light', 'cooling', 'heating'].forEach(key => {
            state[`${key}Start`] = dateStr;
            state[`${key}End`] = dateStr;
            const sIn = $(`${key}-start`);
            const eIn = $(`${key}-end`);
            if (sIn) sIn.value = dateStr;
            if (eIn) eIn.value = dateStr;
        });

        state.selectedDays = [2, 4];
        weekdayChecks.forEach(check => {
            if (state.selectedDays.includes(parseInt(check.value))) check.checked = true;
        });
    }

    // Theme Logic
    if (themeToggle) themeToggle.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme();
        saveSettings();
    });

    function applyTheme() {
        document.body.setAttribute('data-theme', state.theme);
        const icon = themeToggle.querySelector('i');
        if (state.theme === 'light') {
            icon.className = 'fas fa-sun';
            themeToggle.title = '다크 모드로 변경';
        } else {
            icon.className = 'fas fa-moon';
            themeToggle.title = '라이트 모드로 변경';
        }
    }

    // Event Listeners
    if (btnShort) btnShort.addEventListener('click', () => {
        state.mode = 'short';
        btnShort.classList.add('active');
        if (btnLong) btnLong.classList.remove('active');
        if (weekdayContainer) weekdayContainer.classList.add('hidden');
        updateUI();
    });

    if (btnLong) btnLong.addEventListener('click', () => {
        state.mode = 'long';
        btnLong.classList.add('active');
        if (btnShort) btnShort.classList.remove('active');
        if (weekdayContainer) weekdayContainer.classList.remove('hidden');
        if (state.category === 'none') {
            state.category = 'resident-long';
            if (categorySelect) categorySelect.value = 'resident-long';
        }
        updateUI();
    });

    if (startDateInput) startDateInput.addEventListener('change', (e) => { state.startDate = e.target.value; updateUI(); });
    if (endDateInput) endDateInput.addEventListener('change', (e) => { state.endDate = e.target.value; updateUI(); });
    if (excludeHolidaysCheck) excludeHolidaysCheck.addEventListener('change', (e) => { state.excludeHolidays = e.target.checked; updateUI(); });
    if (baseExcludeDatesInput) baseExcludeDatesInput.addEventListener('input', (e) => { state.baseExcludeDates = e.target.value; updateUI(); });
    if (baseAdjDaysInput) baseAdjDaysInput.addEventListener('input', (e) => { state.baseAdjDays = parseInt(e.target.value) || 0; updateUI(); });

    weekdayChecks.forEach(check => {
        check.addEventListener('change', () => {
            state.selectedDays = Array.from(weekdayChecks).filter(c => c.checked).map(c => parseInt(c.value));
            updateUI();
        });
    });

    const setupFacility = (key, checkEl, detailsEl, startEl, endEl, hoursEl, excludeEl, adjEl) => {
        if (checkEl) checkEl.addEventListener('change', (e) => {
            state[`use${key.charAt(0).toUpperCase() + key.slice(1)}`] = e.target.checked;
            if (detailsEl) detailsEl.classList.toggle('hidden', !e.target.checked);
            updateUI();
        });
        if (startEl) startEl.addEventListener('change', (e) => { state[`${key}Start`] = e.target.value; updateUI(); });
        if (endEl) endEl.addEventListener('change', (e) => { state[`${key}End`] = e.target.value; updateUI(); });
        if (hoursEl) hoursEl.addEventListener('input', (e) => { state[`${key}Hours`] = parseInt(e.target.value) || 0; updateUI(); });
        if (excludeEl) excludeEl.addEventListener('input', (e) => { state[`${key}ExcludeDates`] = e.target.value; updateUI(); });
        if (adjEl) adjEl.addEventListener('input', (e) => { state[`${key}AdjDays`] = parseInt(e.target.value) || 0; updateUI(); });
    };

    setupFacility('light', useLightingCheck, lightingDetails, lightStartInput, lightEndInput, lightHoursInput, lightExcludeDatesInput, lightAdjDaysInput);
    setupFacility('cooling', useCoolingCheck, coolingDetails, coolingStartInput, coolingEndInput, coolingHoursInput, coolingExcludeDatesInput, coolingAdjDaysInput);
    setupFacility('heating', useHeatingCheck, heatingDetails, heatingStartInput, heatingEndInput, heatingHoursInput, heatingExcludeDatesInput, heatingAdjDaysInput);

    if (gymSizeSelect) gymSizeSelect.addEventListener('change', (e) => { state.size = e.target.value; updateUI(); });
    if (durationInput) durationInput.addEventListener('input', (e) => {
        state.duration = parseInt(e.target.value);
        if (durationVal) durationVal.textContent = `${state.duration}시간`;
        updateUI();
    });
    if (categorySelect) categorySelect.addEventListener('change', (e) => { state.category = e.target.value; updateUI(); });

    if (btnSettings) btnSettings.addEventListener('click', () => {
        if ($('set-rate-small')) $('set-rate-small').value = state.rates.sports.small;
        if ($('set-rate-medium')) $('set-rate-medium').value = state.rates.sports.medium;
        if ($('set-rate-large')) $('set-rate-large').value = state.rates.sports.large;
        if ($('set-light-rate')) $('set-light-rate').value = state.lightRate;
        if (modal) modal.classList.add('active');
    });

    if (btnCloseModal) btnCloseModal.addEventListener('click', () => modal && modal.classList.remove('active'));
    if (btnSaveSettings) btnSaveSettings.addEventListener('click', () => {
        state.rates.sports.small = parseInt($('set-rate-small').value) || 0;
        state.rates.sports.medium = parseInt($('set-rate-medium').value) || 0;
        state.rates.sports.large = parseInt($('set-rate-large').value) || 0;
        state.lightRate = parseInt($('set-light-rate').value) || 0;
        saveSettings(); updateUI(); if (modal) modal.classList.remove('active');
    });

    if (btnPrint) btnPrint.addEventListener('click', () => { window.print(); });

    function updateUI() {
        const isEvent = state.category === 'none';
        const rateSet = isEvent ? state.rates.event : state.rates.sports;
        const baseRate = rateSet[state.size];
        
        const allowedDays = state.mode === 'long' ? state.selectedDays : [0,1,2,3,4,5,6];
        const rawSessionDates = getSessionDates(state.startDate, state.endDate, allowedDays, state.excludeHolidays);
        
        const parseExcluded = (str) => str.split(',').map(s => s.trim()).filter(s => s.length > 0);
        
        const baseExcludes = parseExcluded(state.baseExcludeDates);
        const sessionDates = rawSessionDates.filter(d => !baseExcludes.includes(d));
        const totalSessions = Math.max(0, sessionDates.length + state.baseAdjDays);
        
        const calcFacSessions = (use, start, end, excludeStr, adjDays) => {
            if (!use) return 0;
            const excludes = parseExcluded(excludeStr);
            const count = sessionDates.filter(d => isWithinRange(d, start, end) && !excludes.includes(d)).length;
            return Math.max(0, count + adjDays);
        };

        const lightSessions = calcFacSessions(state.useLighting, state.lightStart, state.lightEnd, state.lightExcludeDates, state.lightAdjDays);
        const coolingSessions = calcFacSessions(state.useCooling, state.coolingStart, state.coolingEnd, state.coolingExcludeDates, state.coolingAdjDays);
        const heatingSessions = calcFacSessions(state.useHeating, state.heatingStart, state.heatingEnd, state.heatingExcludeDates, state.heatingAdjDays);

        const hvacSurchargeRate = baseRate * 0.2;

        const totalHours = totalSessions * state.duration;
        const baseAmount = totalSessions * state.duration * baseRate;
        const lightingAmount = lightSessions * state.lightHours * state.lightRate;
        const coolingAmount = coolingSessions * state.coolingHours * hvacSurchargeRate;
        const heatingAmount = heatingSessions * state.heatingHours * hvacSurchargeRate;
        
        const subtotal = baseAmount + lightingAmount + coolingAmount + heatingAmount;
        const discountRate = getDiscountRate(state.category);
        const discountAmount = Math.floor(baseAmount * discountRate);
        const total = (baseAmount - discountAmount) + lightingAmount + coolingAmount + heatingAmount;

        setText(resSessionCount, `${totalSessions}${state.mode === 'long' ? '회' : '일'}`);
        setText(resTotalHours, `${formatNumber(totalHours)}시간`);
        
        setText(resBase, `${formatNumber(baseAmount)}원`);
        setText(baseMath, `단가 ${formatNumber(baseRate)}원 × ${state.duration}시간 × ${totalSessions}${state.mode === 'long' ? '회' : '일'}`);

        const updateFacRow = (use, row, resEl, mathEl, val, mathText) => {
            updateVisibility(use, row);
            updateVisibility(use, mathEl);
            if (use) {
                setText(resEl, `${formatNumber(val)}원`);
                setText(mathEl, mathText);
            }
        };

        const sessText = state.mode === 'long' ? '회' : '일';
        updateFacRow(state.useLighting, lightingRow, resLighting, lightMath, lightingAmount, `단가 ${formatNumber(state.lightRate)}원 × ${state.lightHours}시간 × ${lightSessions}${sessText}`);
        updateFacRow(state.useCooling, coolingRow, resCooling, coolingMath, coolingAmount, `기본료 20%(${formatNumber(hvacSurchargeRate)}원) × ${state.coolingHours}시간 × ${coolingSessions}${sessText}`);
        updateFacRow(state.useHeating, heatingRow, resHeating, heatingMath, heatingAmount, `기본료 20%(${formatNumber(hvacSurchargeRate)}원) × ${state.heatingHours}시간 × ${heatingSessions}${sessText}`);

        setText(resSubtotal, `${formatNumber(subtotal)}원`);
        setText(resDiscountLabel, `${Math.round(discountRate * 100)}%`);
        setText(resDiscount, `-${formatNumber(discountAmount)}원`);
        animateNumber(resTotal, total);
        
        const resultBody = document.querySelector('.result-card .card-body');
        if (resultBody) {
            const now = new Date();
            resultBody.setAttribute('data-date', `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`);
        }
    }

    function setText(el, val) { if (el) el.textContent = val; }
    function getSessionDates(start, end, allowedDays, skipHolidays) {
        if (!start || !end || allowedDays.length === 0) return [];
        const dates = [];
        const cur = new Date(start);
        const last = new Date(end);
        while (cur <= last) {
            const dateStr = cur.toISOString().split('T')[0];
            const isAllowedDay = allowedDays.includes(cur.getDay());
            const isHoliday = HOLIDAYS_2026.includes(dateStr);
            if (isAllowedDay && !(skipHolidays && isHoliday)) dates.push(dateStr);
            cur.setDate(cur.getDate() + 1);
        }
        return dates;
    }
    function isWithinRange(dateStr, start, end) { return start && end && dateStr >= start && dateStr <= end; }
    function updateVisibility(isActive, element) { if (element) element.classList.toggle('hidden', !isActive); }
    function animateNumber(element, target) {
        if (!element) return;
        const current = parseInt(element.textContent.replace(/,/g, '')) || 0;
        const duration = 500;
        const start = performance.now();
        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            element.textContent = formatNumber(Math.floor(progress * (target - current) + current));
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }
    function getDiscountRate(category) {
        switch (category) {
            case 'resident-long': return 0.6;
            case 'vulnerable': return 0.5;
            case 'worker-long': return 0.4;
            case 'official': return 1.0;
            default: return 0;
        }
    }
    function formatNumber(num) { return num.toLocaleString(); }
    function saveSettings() { localStorage.setItem('school-gym-rates-v5', JSON.stringify({ rates: state.rates, lightRate: state.lightRate, theme: state.theme })); }
    function loadSettings() {
        const saved = localStorage.getItem('school-gym-rates-v5');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.rates) state.rates = data.rates;
            state.lightRate = data.lightRate;
            state.theme = data.theme || 'dark';
        }
    }
});
