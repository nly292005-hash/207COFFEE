'use strict';

/* ============================================================
   REPORTS MODULE – Day Report, History
   ============================================================ */

const ReportsModule = {
  _rating: 4.5,
  _ingredients: [
    { name: 'Cà phê hạt', status: 'ok' },
    { name: 'Sữa đặc', status: 'ok' },
    { name: 'Đá viên', status: 'ok' },
    { name: 'Trà túi', status: 'ok' },
    { name: 'Đường', status: 'ok' },
    { name: 'Ly nhựa', status: 'ok' },
  ],
  
  // STATE LƯU TRỮ BỘ LỌC LỊCH SỬ
  _historyFilterType: 'this_month', 
  _historyFilterDate: '2026-06-08', 

  renderDayReport() {
    const todayRev = Utils.getTodayRevenue();
    const systemCash = todayRev.cash;
    const todayOrders = DB.orders.filter(order => order.date === '2026-06-08');

    return `
    <style>
      .star-btn { background: none; border: none; cursor: pointer; font-size: 28px; transition: transform 0.1s; }
      .star-btn:hover { transform: scale(1.2); }
    </style>

    <div class="page-header">
      <div>
        <h1 class="page-title">Báo cáo chốt ca</h1>
        <p class="text-muted fs-13 mt-1">${new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
      </div>
      <div class="page-header-right">
        <span class="badge badge-warning" style="padding:8px 14px;font-size:13px">
          <span class="material-icons" style="font-size:16px">radio_button_checked</span>
          Ca chưa chốt
        </span>
      </div>
    </div>

    <div class="mobile-responsive-grid">
      <div>
        <div class="card">
          <div class="card-header">
            <span class="card-title">
              <span class="material-icons" style="font-size:18px;vertical-align:-3px;color:var(--success)">check_circle</span>
              Dữ liệu hệ thống (tự động)
            </span>
          </div>
          <div class="card-body">
            <div class="report-summary-box">
              <div class="report-row">
                <span class="report-row-label">Tổng đơn hàng</span>
                <span class="report-row-value">${todayOrders.length} đơn</span>
              </div>
              <div class="report-row">
                <span class="report-row-label">Doanh thu hệ thống</span>
                <span class="report-row-value success">${Utils.formatCurrency(todayRev.total)}</span>
              </div>
              <div class="report-row">
                <span class="report-row-label">Tiền mặt hệ thống</span>
                <span class="report-row-value">${Utils.formatCurrency(systemCash)}</span>
              </div>
              <div class="report-row">
                <span class="report-row-label">Chuyển khoản</span>
                <span class="report-row-value">${Utils.formatCurrency(todayRev.transfer)}</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Tiền mặt thực tế (đếm tay) <span class="required">*</span></label>
              <input type="number" class="form-control" id="cash-actual"
                placeholder="Nhập số tiền mặt đếm được..."
                style="font-size:16px;font-weight:600">
            </div>

            <div id="diff-result" style="display:none">
              <div class="report-summary-box">
                <div class="report-row">
                  <span class="report-row-label" style="font-weight:600">Tiền chênh lệch</span>
                  <span class="report-row-value" id="diff-value" style="font-size:16px">0đ</span>
                </div>
              </div>

              <div id="diff-reason-group" style="display:none">
                <div class="form-group">
                  <label class="form-label">Lý do chênh lệch <span class="required">*</span></label>
                  <textarea class="form-control" id="diff-reason"
                    placeholder="Bắt buộc nhập khi có chênh lệch. VD: Thối nhầm khách đơn #1003..."></textarea>
                  <div class="form-error" id="err-diff-reason">Vui lòng nhập lý do chênh lệch</div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Ghi chú sự cố trong ca</label>
              <textarea class="form-control" id="shift-incidents"
                placeholder="Không có sự cố / Máy POS lỗi kết nối 10 phút lúc 20h..."></textarea>
            </div>
          </div>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card">
          <div class="card-header">
            <span class="card-title">Đánh giá khách hàng</span>
          </div>
          <div class="card-body">
            <div style="margin-bottom:12px">
              <label class="form-label">Điểm rating trung bình</label>
              <div style="display:flex;align-items:center;gap:12px;margin-top:8px">
                ${[1, 2, 3, 4, 5].map(star => `
                  <button class="star-btn js-star-btn" data-star="${star}" id="star-${star}">
                    <span id="star-icon-${star}" style="color:${star <= this._rating ? 'var(--warning)' : '#E0E0E0'}">★</span>
                  </button>
                `).join('')}
                <span id="rating-display" style="font-size:20px;font-weight:700;color:var(--text-primary)">${this._rating}</span>
              </div>
              <p class="form-hint">Nhập từ thẻ feedback hoặc hỏi miệng khách</p>
            </div>
            <div class="form-group">
              <label class="form-label">Ghi chú phản hồi</label>
              <textarea class="form-control" id="rating-note"
                placeholder="VD: Đa số hài lòng, 1 khách phàn nàn thời gian chờ lâu..."
                style="min-height:60px"></textarea>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">Kiểm tra tình trạng nguyên liệu</span>
          </div>
          <div class="card-body">
            ${this._ingredients.map((item, index) => `
            <div class="ingredient-item">
              <span>${item.name}</span>
              <select class="ingredient-status-select js-ingredient-select" data-index="${index}">
                <option value="ok" ${item.status === 'ok' ? 'selected' : ''}>✓ Đủ</option>
                <option value="low" ${item.status === 'low' ? 'selected' : ''}>⚠ Sắp hết</option>
                <option value="empty" ${item.status === 'empty' ? 'selected' : ''}>✗ Hết</option>
              </select>
            </div>
            `).join('')}
            <div class="form-group mt-3" style="margin-bottom:0">
              <input type="text" class="form-control" placeholder="Thêm nguyên liệu khác..."
                style="height:36px;font-size:12px">
            </div>
          </div>
        </div>

        <button class="btn btn-primary btn-block btn-lg" id="btn-submit-report">
          <span class="material-icons">lock</span>
          Chốt ca & Lưu báo cáo
        </button>

        <p class="hint text-center">
          Sau khi chốt, toàn bộ đơn hàng ca này sẽ bị khóa và thông báo sẽ được gửi đến CEO.
        </p>
      </div>
    </div>
    `;
  },

  bindDayReport() {
    const cashActualEl = document.getElementById('cash-actual');
    if (cashActualEl) {
      cashActualEl.addEventListener('input', () => this.calcDiff());
    }

    document.querySelectorAll('.js-star-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const star = parseInt(e.currentTarget.getAttribute('data-star'), 10);
        this.setRating(star);
      });
    });

    document.querySelectorAll('.js-ingredient-select').forEach(selectEl => {
      selectEl.addEventListener('change', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        this.setIngredient(index, e.target.value);
      });
    });

    const submitBtn = document.getElementById('btn-submit-report');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.submitReport());
    }
  },

  calcDiff() {
    const systemCash = Utils.getTodayRevenue().cash;
    const actualEl = document.getElementById('cash-actual');
    const actual = parseFloat(actualEl?.value) || 0;
    const diff = actual - systemCash;

    const resultEl = document.getElementById('diff-result');
    const diffValEl = document.getElementById('diff-value');
    const reasonGroup = document.getElementById('diff-reason-group');

    if (resultEl) resultEl.style.display = 'block';

    if (diffValEl) {
      diffValEl.textContent = (diff >= 0 ? '+' : '') + Utils.formatCurrency(diff);
      diffValEl.className = 'report-row-value ' + (diff > 0 ? 'success' : diff < 0 ? 'danger' : '');
    }

    if (reasonGroup) reasonGroup.style.display = diff !== 0 ? 'block' : 'none';
  },

  setRating(star) {
    this._rating = star;
    for (let i = 1; i <= 5; i++) {
      const icon = document.getElementById(`star-icon-${i}`);
      if (icon) icon.style.color = i <= star ? 'var(--warning)' : '#E0E0E0';
    }
    const display = document.getElementById('rating-display');
    if (display) display.textContent = star + '.0';
  },

  setIngredient(index, status) {
    this._ingredients[index].status = status;
  },

  submitReport() {
    const cashActual = parseFloat(document.getElementById('cash-actual')?.value);
    const systemCash = Utils.getTodayRevenue().cash;
    const diff = cashActual - systemCash;
    const diffReason = document.getElementById('diff-reason')?.value?.trim();
    const incidents = document.getElementById('shift-incidents')?.value?.trim() || '';
    const ratingNote = document.getElementById('rating-note')?.value?.trim() || '';

    if (isNaN(cashActual)) {
      Toast.show('Vui lòng nhập tiền mặt thực tế', 'danger');
      document.getElementById('cash-actual')?.classList.add('error');
      return;
    }

    if (diff !== 0 && !diffReason) {
      document.getElementById('err-diff-reason')?.classList.add('show');
      document.getElementById('diff-reason')?.classList.add('error');
      Toast.show('Vui lòng nhập lý do chênh lệch tiền mặt', 'danger');
      return;
    }

    const todayRev = Utils.getTodayRevenue();
    Modal.show(`
      <div class="modal-header">
        <h3 class="modal-title">Xác nhận chốt ca</h3>
        <button class="modal-close" id="btn-modal-close-x"><span class="material-icons">close</span></button>
      </div>
      <div class="modal-body">
        <div class="alert alert-warning">
          <span class="material-icons">warning</span>
          <span>Bạn có chắc chắn muốn chốt ca? Hệ thống sẽ <b>khóa toàn bộ dữ liệu đơn hàng</b> ca này và gửi thông báo đến CEO.</span>
        </div>
        <div class="report-summary-box">
          <div class="report-row"><span class="report-row-label">Tổng đơn</span><span class="report-row-value">${todayRev.count} đơn</span></div>
          <div class="report-row"><span class="report-row-label">Doanh thu</span><span class="report-row-value success">${Utils.formatCurrency(todayRev.total)}</span></div>
          <div class="report-row"><span class="report-row-label">Chênh lệch tiền mặt</span>
            <span class="report-row-value ${diff !== 0 ? 'danger' : 'success'}">${diff !== 0 ? Utils.formatCurrency(Math.abs(diff)) : 'Không chênh lệch'}</span>
          </div>
          <div class="report-row"><span class="report-row-label">Rating khách</span><span class="report-row-value">${this._rating} ★</span></div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="btn-modal-cancel">Hủy bỏ</button>
        <button class="btn btn-danger" id="btn-modal-confirm-submit">
          <span class="material-icons">lock</span> Đồng ý, chốt ca
        </button>
      </div>
    `);

    document.getElementById('btn-modal-close-x')?.addEventListener('click', () => Modal.close());
    document.getElementById('btn-modal-cancel')?.addEventListener('click', () => Modal.close());
    document.getElementById('btn-modal-confirm-submit')?.addEventListener('click', () => {
      this.confirmSubmit(cashActual, diff, diffReason, incidents, ratingNote);
    });
  },

  confirmSubmit(cashActual, diff, diffReason, incidents, ratingNote) {
    Modal.close();
    const todayRev = Utils.getTodayRevenue();

    DB.dayReports.unshift({
      id: DB.nextId(DB.dayReports),
      date: '2026-06-08',
      shiftId: 'T',
      leaderId: DB.session.id,
      totalOrders: todayRev.count,
      systemRevenue: todayRev.total,
      cashSystem: todayRev.cash,
      cashActual,
      cashDiff: diff,
      diffReason,
      rating: this._rating,
      ratingNote,
      incidents,
      ingredients: [...this._ingredients],
      status: 'locked',
      lockedAt: new Date().toLocaleString('vi-VN')
    });

    Toast.show('Ca đã được chốt! Thông báo đã gửi đến CEO.', 'success');
    
    if (typeof App !== 'undefined' && App.renderView) {
      setTimeout(() => App.renderView('report-history'), 1000);
    }
  },

  // ============================================================
  // CÁC HÀM XỬ LÝ LỌC LỊCH SỬ TỰ ĐỘNG CẬP NHẬT GIAO DIỆN
  // ============================================================
  setHistoryFilter(type) {
    this._historyFilterType = type;
    this.refreshHistoryList();
  },

  onDateChange(dateValue) {
    this._historyFilterType = 'date';
    this._historyFilterDate = dateValue;
    this.refreshHistoryList();
  },

  // Hàm tự động nhúng lại HTML vào khung mà không cần load trang
  refreshHistoryList() {
    const container = document.getElementById('report-history-container');
    if (container) {
      container.innerHTML = this.renderHistoryContent();
    } else if (typeof App !== 'undefined' && App.renderView) {
      App.renderView('report-history');
    }
  },

  // Hàm khởi tạo khung bên ngoài
  renderHistory() {
    return `
    <div class="page-header">
      <h1 class="page-title">Lịch sử báo cáo chốt ca</h1>
    </div>
    <div id="report-history-container">
      ${this.renderHistoryContent()}
    </div>
    `;
  },

  // Hàm in ra các nút và danh sách báo cáo
  renderHistoryContent() {
    const currentDate = new Date('2026-06-08'); 
    let filteredReports = DB.dayReports || [];

    // Lọc theo điều kiện
    if (this._historyFilterType === 'this_month') {
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      filteredReports = filteredReports.filter(r => {
        const d = new Date(r.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    } 
    else if (this._historyFilterType === 'last_month') {
      let lastMonth = currentDate.getMonth() - 1;
      let year = currentDate.getFullYear();
      if (lastMonth < 0) { lastMonth = 11; year--; }
      filteredReports = filteredReports.filter(r => {
        const d = new Date(r.date);
        return d.getMonth() === lastMonth && d.getFullYear() === year;
      });
    } 
    else if (this._historyFilterType === '3_months') {
      const threeMonthsAgo = new Date(currentDate);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      filteredReports = filteredReports.filter(r => {
        const d = new Date(r.date);
        return d >= threeMonthsAgo && d <= currentDate;
      });
    } 
    else if (this._historyFilterType === 'date' && this._historyFilterDate) {
      filteredReports = filteredReports.filter(r => r.date === this._historyFilterDate);
    }

    filteredReports.sort((a, b) => new Date(b.date) - new Date(a.date));

    return `
    <div class="filter-row mb-3" style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; padding-bottom: 12px;">
      <input type="date" class="form-control" style="width:140px; height: 38px;" 
             value="${this._historyFilterDate}" 
             onchange="ReportsModule.onDateChange(this.value)">
      
      <button class="btn ${this._historyFilterType === 'this_month' ? 'btn-primary' : 'btn-secondary'}" 
              onclick="ReportsModule.setHistoryFilter('this_month')">Tháng này</button>
      <button class="btn ${this._historyFilterType === 'last_month' ? 'btn-primary' : 'btn-secondary'}" 
              onclick="ReportsModule.setHistoryFilter('last_month')">Tháng trước</button>
      <button class="btn ${this._historyFilterType === '3_months' ? 'btn-primary' : 'btn-secondary'}" 
              onclick="ReportsModule.setHistoryFilter('3_months')">3 tháng trước</button>
      <button class="btn ${this._historyFilterType === 'all' ? 'btn-primary' : 'btn-secondary'}" 
              onclick="ReportsModule.setHistoryFilter('all')">Tất cả</button>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      ${filteredReports.map(report => {
        const leader = Utils.getUserById(report.leaderId);
        const lowIngredients = report.ingredients?.filter(ingredient => ingredient.status !== 'ok') || [];
        return `
        <div class="card">
          <div class="card-header">
            <div>
              <span style="font-weight:700;font-size:15px">${Utils.formatDate(report.date)}</span>
              <span class="badge badge-brown" style="margin-left:8px">${report.shiftId === 'S' ? 'Ca Sáng' : report.shiftId === 'C' ? 'Ca Chiều' : 'Ca Tối'}</span>
              <span class="badge badge-success" style="margin-left:4px">✓ Đã chốt</span>
            </div>
            <div style="text-align:right;font-size:12px;color:var(--text-muted)">
              Trưởng ca: <b>${leader?.name}</b><br>
              Chốt lúc: ${report.lockedAt}
            </div>
          </div>
          <div class="card-body">
            
            <div class="history-responsive-grid">
              <div>
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">Tổng đơn</div>
                <div style="font-weight:700;font-size:16px">${report.totalOrders}</div>
              </div>
              <div>
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">Doanh thu</div>
                <div style="font-weight:700;font-size:15px;color:var(--brown)">${Utils.formatCurrency(report.systemRevenue)}</div>
              </div>
              <div>
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">Chênh lệch tiền</div>
                <div style="font-weight:700;font-size:15px;color:${report.cashDiff === 0 ? 'var(--success)' : 'var(--danger)'}">
                  ${report.cashDiff === 0 ? 'Không chênh' : Utils.formatCurrency(Math.abs(report.cashDiff))}
                </div>
                ${report.cashDiff !== 0 && report.diffReason ? `<div style="font-size:11px;color:var(--text-muted)">${report.diffReason}</div>` : ''}
              </div>
              <div>
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">Đánh giá KH</div>
                <div style="font-weight:700;font-size:16px">${report.rating} <span style="color:var(--warning)">★</span></div>
                ${report.ratingNote ? `<div style="font-size:11px;color:var(--text-muted)">${report.ratingNote}</div>` : ''}
              </div>
              <div>
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">Nguyên liệu</div>
                ${lowIngredients.length === 0 ?
                  '<span class="badge badge-success">Đủ tất cả</span>' :
                  `<span class="badge badge-warning">⚠ ${lowIngredients.map(ingredient => ingredient.name).join(', ')}</span>`
                }
              </div>
            </div>

            ${report.incidents ? `
            <div class="alert alert-warning mt-3" style="margin-bottom:0;padding:8px 12px">
              <span class="material-icons" style="font-size:16px">report_problem</span>
              <span style="font-size:12px"><b>Sự cố:</b> ${report.incidents}</span>
            </div>
            ` : ''}
          </div>
        </div>
        `;
      }).join('')}

      ${filteredReports.length === 0 ? `
        <div style="text-align:center;padding:60px;color:var(--text-muted)">
          <span class="material-icons" style="font-size:48px;display:block;margin-bottom:12px">description</span>
          Không có báo cáo nào trong khoảng thời gian này
        </div>
      ` : ''}
    </div>
    `;
  }
};

window.ReportsModule = ReportsModule;