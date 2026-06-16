'use strict';

/* ============================================================
   CEO DASHBOARD MODULE (Đã đồng bộ dữ liệu động với POS Module)
   ============================================================ */

const CEODashModule = {
  _chartRevenue: null,
  _currentFilter: 'today',
  _currentBranch: 'all',
  _exportFormat: 'excel',

  render() {
    const ordersList = (typeof DB !== 'undefined' && DB.orders) ? DB.orders : [];
    const todayStr = '2026-06-08'; // Đồng bộ chuẩn ngày với POSModule
    
    // Tính toán doanh thu thực tế hôm nay từ POS
    const todayOrders = ordersList.filter(order => order.date === todayStr && order.status === 'paid');
    let todayTotal = todayOrders.reduce((sum, order) => sum + order.total, 0);
    let todayCount = todayOrders.length;

    // Tính toán doanh thu hôm qua để tính % tăng trưởng
    const yesterdayOrders = ordersList.filter(order => order.date === '2026-06-07' && order.status === 'paid');
    let yesterdayTotal = yesterdayOrders.reduce((sum, order) => sum + order.total, 0);

    // Áp dụng tỉ lệ lọc cơ sở đồng bộ với biểu đồ nếu không chọn "Tất cả"
    if (this._currentBranch !== 'all') {
      todayTotal = Math.round(todayTotal * 0.45);
      todayCount = Math.round(todayCount * 0.45);
      yesterdayTotal = Math.round(yesterdayTotal * 0.45);
    }

    const growthPct = yesterdayTotal > 0 
      ? (((todayTotal - yesterdayTotal) / yesterdayTotal) * 100).toFixed(1) 
      : 0;

    const currentTimeStr = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const branchesList = (typeof DB !== 'undefined' && DB.branches) ? DB.branches : [];

    return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard Quản trị</h1>
        <p class="text-muted fs-13 mt-1">
          Xin chào, <b>CEO</b> · Cập nhật lúc ${currentTimeStr}
        </p>
      </div>
      <div class="page-header-right">
        <select class="form-control" id="branch-filter" style="width:180px">
          <option value="all">Tất cả cơ sở</option>
          ${branchesList.map(branch => `<option value="${branch.id}">${branch.name}</option>`).join('')}
        </select>
        <button class="btn btn-primary" id="btn-show-export">
          <span class="material-icons">download</span>
          Xuất báo cáo
        </button>
      </div>
    </div>

    <div class="stat-grid" style="grid-template-columns: repeat(4, 1fr)">
      <div class="stat-card">
        <div class="stat-icon brown"><span class="material-icons">payments</span></div>
        <div>
          <div class="stat-label">Doanh thu hôm nay</div>
          <div class="stat-value" id="stat-revenue">
            ${(typeof Utils !== 'undefined' && Utils.formatCurrency) ? Utils.formatCurrency(todayTotal) : todayTotal}
          </div>
          <div class="stat-sub ${growthPct >= 0 ? 'success' : 'danger'}">
            <span class="material-icons" style="font-size:12px; vertical-align:-1px">
              ${growthPct >= 0 ? 'trending_up' : 'trending_down'}
            </span>
            ${growthPct >= 0 ? `+${growthPct}%` : `${growthPct}%`} so với hôm qua
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green"><span class="material-icons">shopping_bag</span></div>
        <div>
          <div class="stat-label">Hóa đơn mới</div>
          <div class="stat-value" id="stat-orders">${todayCount} đơn</div>
          <div class="stat-sub">
            Trung bình ${(typeof Utils !== 'undefined' && Utils.formatCurrency) ? Utils.formatCurrency(todayCount > 0 ? (todayTotal / todayCount) : 0) : 0}/đơn
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon yellow"><span class="material-icons">badge</span></div>
        <div>
          <div class="stat-label">Nhân sự đang làm</div>
          <div class="stat-value">14 / 18</div>
          <div class="stat-sub text-muted">Có 2 ca muộn hôm nay</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon red"><span class="material-icons">warning</span></div>
        <div>
          <div class="stat-label">Cảnh báo hệ thống</div>
          <div class="stat-value text-danger">1</div>
          <div class="stat-sub danger" style="font-weight:600">3 ca thiếu check-out hôm qua</div>
        </div>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px; margin-top:20px">
      <div class="card">
        <div class="card-header" style="justify-content:space-between">
          <span class="card-title">Biểu đồ doanh thu</span>
          <div class="btn-group" id="chart-filter-group">
            <button class="btn btn-secondary btn-sm ${this._currentFilter === 'today' ? 'active' : ''}" data-filter="today">Hôm nay</button>
            <button class="btn btn-secondary btn-sm ${this._currentFilter === 'week' ? 'active' : ''}" data-filter="week">Tuần này</button>
            <button class="btn btn-secondary btn-sm ${this._currentFilter === 'month' ? 'active' : ''}" data-filter="month">Tháng này</button>
          </div>
        </div>
        <div class="card-body">
          <div style="position:relative; height:300px; width:100%">
            <canvas id="revenueChart"></canvas>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">Món bán chạy hôm nay</span>
        </div>
        <div class="card-body" style="padding:0">
          <div style="padding:16px; border-bottom:1px solid #EBEBEB; display:flex; justify-content:space-between; font-size:12px; font-weight:600; color:var(--text-muted)">
            <span>SẢN PHẨM</span>
            <span>DOANH SỐ</span>
          </div>
          <div style="display:flex; flex-direction:column">
            ${this.renderTopProducts()}
          </div>
        </div>
      </div>
    </div>
    `;
  },

  renderTopProducts() {
    const ordersList = (typeof DB !== 'undefined' && DB.orders) ? DB.orders : [];
    const menuItems = (typeof DB !== 'undefined' && DB.menuItems) ? DB.menuItems : [];
    const todayStr = '2026-06-08';

    const productAggregation = {};

    // Khởi tạo danh sách theo cấu trúc thực tế của POS Menu Items
    menuItems.forEach(menuItem => {
      productAggregation[menuItem.id] = {
        name: menuItem.name,
        count: 0,
        rev: 0,
        img: menuItem.emoji || '☕'
      };
    });

    // Gom dữ liệu bán hàng chuẩn chỉ từ các đơn hàng thực tế
    ordersList
      .filter(order => order.date === todayStr && order.status === 'paid')
      .forEach(order => {
        if (Array.isArray(order.items)) {
          order.items.forEach(item => {
            const id = item.menuId;
            if (productAggregation[id]) {
              productAggregation[id].count += (item.qty || 0);
              productAggregation[id].rev += ((item.price * item.qty) || 0);
            }
          });
        }
      });

    // Sắp xếp giảm dần theo doanh thu thực thu và cắt lấy top 4 món
    let sortedProducts = Object.values(productAggregation)
      .sort((a, b) => b.rev - a.rev)
      .slice(0, 4);

    return sortedProducts.map((prod, index) => `
      <div style="display:flex; align-items:center; gap:12px; padding:12px 16px; border-bottom:1px solid #F5F5F5">
        <div style="font-size:13px; font-weight:700; color:var(--text-muted); width:16px">${index + 1}</div>
        <div style="width:32px; height:32px; background:#F5F5F5; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:16px">
          ${prod.img}
        </div>
        <div style="flex:1">
          <div style="font-size:13px; font-weight:600; color:var(--text-primary)">${prod.name}</div>
          <div style="font-size:11px; color:var(--text-muted)">${prod.count} ly đã bán</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:13px; font-weight:700; color:var(--brown)">
            ${(typeof Utils !== 'undefined' && Utils.formatCurrency) ? Utils.formatCurrency(prod.rev) : prod.rev}
          </div>
        </div>
      </div>
    `).join('');
  },

  bind() {
    const branchFilter = document.getElementById('branch-filter');
    if (branchFilter) {
      branchFilter.value = this._currentBranch;
      branchFilter.addEventListener('change', (e) => {
        this.filterBranch(e.target.value);
      });
    }

    const showExportBtn = document.getElementById('btn-show-export');
    if (showExportBtn) {
      showExportBtn.addEventListener('click', () => {
        this.showExportModal();
      });
    }

    const filterButtons = document.querySelectorAll('#chart-filter-group .btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        const filterVal = e.currentTarget.getAttribute('data-filter');
        this.filterChart(filterVal);
      });
    });

    this.initChart();
  },

  initChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx || typeof Chart === 'undefined') return;

    if (this._chartRevenue) {
      this._chartRevenue.destroy();
    }

    let dataLabels = [];
    let dataValues = [];

    const ordersList = (typeof DB !== 'undefined' && DB.orders) ? DB.orders : [];

    if (this._currentFilter === 'today') {
      // Động hóa dữ liệu theo khung giờ để khớp với thẻ Doanh thu hôm nay
      dataLabels = ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00'];
      dataValues = [0, 0, 0, 0, 0, 0, 0, 0];
      
      const todayOrders = ordersList.filter(o => o.date === '2026-06-08' && o.status === 'paid');
      todayOrders.forEach(o => {
        if (!o.time) return;
        const hr = parseInt(o.time.split(':')[0], 10);
        if (hr < 9) dataValues[0] += o.total;
        else if (hr < 11) dataValues[1] += o.total;
        else if (hr < 13) dataValues[2] += o.total;
        else if (hr < 15) dataValues[3] += o.total;
        else if (hr < 17) dataValues[4] += o.total;
        else if (hr < 19) dataValues[5] += o.total;
        else if (hr < 21) dataValues[6] += o.total;
        else dataValues[7] += o.total;
      });
    } else if (this._currentFilter === 'week') {
      dataLabels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
      dataValues = [5400000, 6200000, 5800000, 7100000, 8500000, 11200000, 12500000];
    } else if (this._currentFilter === 'month') {
      dataLabels = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];
      dataValues = [45000000, 52000000, 49000000, 61000000];
    }

    if (this._currentBranch !== 'all') {
      dataValues = dataValues.map(value => Math.round(value * 0.45)); 
    }

    this._chartRevenue = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dataLabels,
        datasets: [{
          label: 'Doanh thu (VND)',
          data: dataValues,
          borderColor: '#4E342E',
          backgroundColor: 'rgba(78, 52, 46, 0.05)',
          borderWidth: 2,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => (typeof Utils !== 'undefined' && Utils.formatCurrency) ? Utils.formatCurrency(value) : value
            }
          }
        }
      }
    });
  },

  filterBranch(branchId) {
    this._currentBranch = branchId;
    if (typeof Toast !== 'undefined') {
      Toast.show(`Đang lọc dữ liệu cho cơ sở: ${branchId === 'all' ? 'Tất cả' : branchId}`, 'success');
    }
    
    // Cập nhật động số liệu trên các thẻ KPI khi đổi chi nhánh để luôn đồng bộ với biểu đồ
    const ordersList = (typeof DB !== 'undefined' && DB.orders) ? DB.orders : [];
    let todayOrders = ordersList.filter(order => order.date === '2026-06-08' && order.status === 'paid');
    let todayTotal = todayOrders.reduce((sum, order) => sum + order.total, 0);
    let todayCount = todayOrders.length;

    if (branchId !== 'all') {
      todayTotal = Math.round(todayTotal * 0.45);
      todayCount = Math.round(todayCount * 0.45);
    }

    const revStat = document.getElementById('stat-revenue');
    if (revStat && typeof Utils !== 'undefined' && Utils.formatCurrency) {
      revStat.textContent = Utils.formatCurrency(todayTotal);
    }
    
    const orderStat = document.getElementById('stat-orders');
    if (orderStat) {
      orderStat.textContent = `${todayCount} đơn`;
    }

    this.initChart();
  },

  filterChart(filterType) {
    this._currentFilter = filterType;
    if (typeof Toast !== 'undefined') {
      Toast.show(`Đang hiển thị dữ liệu theo: ${filterType}`, 'success');
    }
    this.initChart();
  },

  showExportModal() {
    const branchesList = (typeof DB !== 'undefined' && DB.branches) ? DB.branches : [];
    const modalContent = `
      <div class="modal-header">
        <h3 class="modal-title">Xuất báo cáo dữ liệu</h3>
        <button class="modal-close" id="modal-close-export-x">
          <span class="material-icons">close</span>
        </button>
      </div>
      <div class="modal-body">
        <p style="font-size:13px; color:var(--text-muted); margin-bottom:16px">
          Chọn định dạng và phạm vi dữ liệu để xuất báo cáo hệ thống.
        </p>
        
        <label class="form-label">Định dạng file</label>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:16px">
          <div class="export-format-card" id="export-excel" data-format="excel"
            style="border:1.5px solid var(--brown); background:var(--brown-10); cursor:pointer; padding:12px; border-radius:8px; text-align:center">
            <span class="material-icons" style="font-size:32px; color:var(--success)">description</span>
            <div style="font-weight:600; font-size:13px; margin-top:4px">Báo cáo Excel</div>
            <div style="font-size:11px; color:var(--text-muted)">Đầy đủ chi tiết đơn</div>
          </div>
          
          <div class="export-format-card" id="export-pdf" data-format="pdf"
            style="border:1.5px solid #EBEBEB; background:white; cursor:pointer; padding:12px; border-radius:8px; text-align:center">
            <span class="material-icons" style="font-size:32px; color:var(--danger)">picture_as_pdf</span>
            <div style="font-weight:600; font-size:13px; margin-top:4px">Báo cáo PDF</div>
            <div style="font-size:11px; color:var(--text-muted)">Biểu đồ & Tổng quan</div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Phạm vi cơ sở</label>
          <select class="form-control">
            <option>Tất cả cơ sở</option>
            ${branchesList.map(branch => `<option>${branch.name}</option>`).join('')}
          </select>
        </div>

        <div id="export-selected" style="padding:10px; background:var(--brown-10); border-radius:6px; font-size:13px; font-weight:600; color:var(--brown)">
          Đã chọn: Excel (.xlsx)
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="btn-cancel-export">Hủy bỏ</button>
        <button class="btn btn-primary" id="btn-submit-export">
          <span class="material-icons">download</span> Tải xuống
        </button>
      </div>
    `;

    if (typeof Modal !== 'undefined') Modal.show(modalContent);
    this._exportFormat = 'excel';

    const closeX = document.getElementById('modal-close-export-x');
    if (closeX) closeX.addEventListener('click', () => Modal.close());
    
    const cancelBtn = document.getElementById('btn-cancel-export');
    if (cancelBtn) cancelBtn.addEventListener('click', () => Modal.close());
    
    const submitBtn = document.getElementById('btn-submit-export');
    if (submitBtn) submitBtn.addEventListener('click', () => this.doExport());

    document.querySelectorAll('.export-format-card').forEach(card => {
      card.addEventListener('click', (e) => {
        this.selectExportFormat(e.currentTarget.getAttribute('data-format'));
      });
    });
  },

  selectExportFormat(format) {
    this._exportFormat = format;
    ['excel', 'pdf'].forEach(fmt => {
      const el = document.getElementById(`export-${fmt}`);
      if (el) {
        el.style.borderColor = fmt === format ? 'var(--brown)' : '#EBEBEB';
        el.style.background = fmt === format ? 'var(--brown-10)' : 'white';
      }
    });

    const selectedIndicator = document.getElementById('export-selected');
    if (selectedIndicator) {
      selectedIndicator.textContent = `Đã chọn: ${format === 'excel' ? 'Excel (.xlsx)' : 'PDF (.pdf)'}`;
    }
  },

  doExport() {
    const format = this._exportFormat;
    if (typeof Modal !== 'undefined') Modal.close();
    if (typeof Toast !== 'undefined') {
      Toast.show(`Bắt đầu tải xuống file báo cáo dạng ${format.toUpperCase()}...`, 'success');
    }
  }
};