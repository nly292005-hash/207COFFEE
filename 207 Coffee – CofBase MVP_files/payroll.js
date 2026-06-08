'use strict';

/* ============================================================
   PAYROLL MODULE – Salary Setup & Payroll Calculation
   ============================================================ */

const PayrollModule = {
  _salaryWarningShown: false,
  _exportFmt: 'excel',

  // ============================================================
  // 1. THIẾT LẬP MỨC LƯƠNG
  // ============================================================
  renderSalarySetup() {
    const employees = DB.users.filter(user => user.role !== 'ceo');

    return `
    <div class="page-header">
      <h1 class="page-title">Thiết lập mức lương</h1>
      <p class="text-muted fs-13 mt-1">Mức tối đa: 25.000đ/h. Cập nhật lần cuối: ${new Date().toLocaleDateString('vi-VN')}</p>
    </div>

    <div class="filter-row">
      <div class="search-box" style="flex:1;max-width:300px">
        <span class="material-icons">search</span>
        <input type="text" class="form-control" id="salary-search" placeholder="Tìm theo tên nhân viên...">
      </div>
      <select class="form-control" style="width:160px" id="filter-role">
        <option value="">Tất cả chức vụ</option>
        <option value="employee">Nhân viên</option>
        <option value="leader">Trưởng ca</option>
        <option value="accountant">Kế toán</option>
      </select>
      <select class="form-control" style="width:160px">
        <option value="all">Tất cả cơ sở</option>
        ${DB.branches.map(branch => `<option value="${branch.id}">${branch.name}</option>`).join('')}
      </select>
    </div>

    <div class="table-wrapper" id="salary-table">
      <table>
        <thead>
          <tr>
            <th>Họ và tên</th>
            <th>Chức vụ</th>
            <th>Cơ sở</th>
            <th style="width:200px">Lương/giờ (VNĐ) <span class="required">*</span></th>
            <th>Cập nhật lần cuối</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody id="salary-tbody">
          ${employees.map(employee => this.renderSalaryRow(employee)).join('')}
        </tbody>
      </table>
    </div>

    <div class="alert alert-info mt-3">
      <span class="material-icons">info</span>
      <span>Mức lương được tính theo giờ. Tối đa <b>25.000đ/giờ</b>. Khi nhập vượt mức, hệ thống sẽ cảnh báo nhưng vẫn cho lưu nếu CEO xác nhận.</span>
    </div>
    `;
  },

  renderSalaryRow(employee) {
    const positionLabel = { employee: 'Nhân viên', leader: 'Trưởng ca', accountant: 'Kế toán', ceo: 'CEO' };
    return `
    <tr id="salary-row-${employee.id}">
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:32px;height:32px;border-radius:50%;background:${Utils.avatarColor(employee.id)};display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:700;flex-shrink:0">
            ${Utils.getInitials(employee.name)}
          </div>
          <span class="table-name">${employee.name}</span>
        </div>
      </td>
      <td>${positionLabel[employee.role] || employee.role}</td>
      <td>${employee.branch === 'all' ? 'Tất cả' : employee.branch}</td>
      <td>
        <div>
          <div style="display:flex;align-items:center;gap:6px">
            <input type="number"
              class="form-control input-rate"
              id="rate-${employee.id}"
              data-id="${employee.id}"
              value="${employee.hourlyRate}"
              min="0" max="30000" step="1000"
              style="width:130px"
              ${employee.role === 'ceo' ? 'disabled' : ''}>
            <span style="font-size:13px;color:var(--text-muted)">đ/h</span>
          </div>
          <div id="salary-warning-${employee.id}" class="salary-warning">
            <span class="material-icons" style="font-size:16px;color:var(--warning)">warning</span>
            Mức lương vượt quá khung quy định của quán (25.000đ/h)
          </div>
        </div>
      </td>
      <td style="font-size:12px;color:var(--text-muted)">${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}</td>
      <td>
        ${employee.role !== 'ceo' ? `
        <div class="btn-group">
          <button class="btn btn-secondary btn-sm btn-cancel-edit" data-id="${employee.id}">Hủy</button>
          <button class="btn btn-primary btn-sm btn-save-rate" data-id="${employee.id}">
            <span class="material-icons">save</span> Lưu
          </button>
        </div>
        ` : '<span class="text-muted fs-12">—</span>'}
      </td>
    </tr>
    `;
  },

  bindSalarySetup() {
    const searchInput = document.getElementById('salary-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.filterEmployees(e.target.value));
    }

    const roleSelect = document.getElementById('filter-role');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => this.filterRole(e.target.value));
    }

    document.querySelectorAll('.input-rate').forEach(input => {
      input.addEventListener('input', (e) => {
        const userId = e.currentTarget.getAttribute('data-id');
        this.checkRate(userId, e.target.value);
      });
    });

    document.querySelectorAll('.btn-save-rate').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const userId = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        this.saveRate(userId);
      });
    });

    document.querySelectorAll('.btn-cancel-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const userId = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        this.cancelEdit(userId);
      });
    });
  },

  checkRate(userId, value) {
    const warning = document.getElementById(`salary-warning-${userId}`);
    const input = document.getElementById(`rate-${userId}`);
    const num = parseFloat(value);

    if (num > 25000) {
      if (warning) warning.classList.add('show');
      if (input) input.classList.add('error');
    } else {
      if (warning) warning.classList.remove('show');
      if (input) input.classList.remove('error');
    }
  },

  saveRate(userId) {
    const input = document.getElementById(`rate-${userId}`);
    const value = parseFloat(input.value);
    const user = DB.users.find(u => u.id === userId);

    if (value > 25000) {
      Modal.confirm(
        'Cảnh báo: Vượt khung lương',
        `Mức lương <b>${value.toLocaleString('vi-VN')}đ/h</b> vượt quá khung quy định 25.000đ/h.<br><br>CEO có chắc chắn muốn lưu mức lương này không?`,
        () => {
          if (user) user.hourlyRate = value;
          Toast.show(`Đã cập nhật lương của ${user?.name}: ${value.toLocaleString('vi-VN')}đ/h`, 'success');
          document.getElementById(`salary-warning-${userId}`)?.classList.remove('show');
          document.getElementById(`rate-${userId}`)?.classList.remove('error');
        },
        null, 'Xác nhận lưu', 'btn-warning'
      );
    } else {
      if (user) user.hourlyRate = value;
      Toast.show(`Đã cập nhật lương của ${user?.name}: ${value.toLocaleString('vi-VN')}đ/h`, 'success');
    }
  },

  cancelEdit(userId) {
    const user = DB.users.find(u => u.id === userId);
    const input = document.getElementById(`rate-${userId}`);
    if (user && input) input.value = user.hourlyRate;
    document.getElementById(`salary-warning-${userId}`)?.classList.remove('show');
    input?.classList.remove('error');
  },

  filterEmployees(query) {
    const rows = document.querySelectorAll('#salary-tbody tr');
    rows.forEach(row => {
      const name = row.querySelector('.table-name')?.textContent?.toLowerCase() || '';
      row.style.display = name.includes(query.toLowerCase()) ? '' : 'none';
    });
  },

  filterRole(role) {
    Toast.show(role ? `Lọc theo: ${role}` : 'Hiển thị tất cả', 'success');
  },

  // ============================================================
  // 2. TÍNH TOÁN BẢNG LƯƠNG
  // ============================================================
  renderPayroll() {
    const data = DB.payrollMonth;
    const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];

    return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Bảng lương tháng ${data.month}/${data.year}</h1>
        <p class="text-muted fs-13 mt-1">Kế toán tổng hợp · Chờ Quản lý duyệt</p>
      </div>
      <div class="page-header-right">
        <div class="payroll-period">
          <span class="material-icons" style="font-size:16px">calendar_month</span>
          ${data.startDate} → ${data.endDate}
        </div>
      </div>
    </div>

    <div class="payroll-controls">
      <div style="display:flex;align-items:center;gap:8px">
        <label class="form-label" style="margin:0;white-space:nowrap">Kỳ lương:</label>
        <select class="form-control" style="width:100px" id="pay-month">
          ${months.map((monthItem, index) => `<option value="${index + 1}" ${index + 1 === data.month ? 'selected' : ''}>${monthItem}</option>`).join('')}
        </select>
        <span>/</span>
        <select class="form-control" style="width:80px">
          <option>2026</option>
          <option>2025</option>
        </select>
        <span style="font-size:13px;color:var(--text-muted)">(${data.startDate} – ${data.endDate})</span>
      </div>
      <div class="btn-group">
        <button class="btn btn-ghost btn-sm" id="btn-export-payroll">
          <span class="material-icons">download</span> Xuất Excel
        </button>
        <button class="btn btn-primary" id="btn-submit-manager" ${data.submittedToManager ? 'disabled' : ''}>
          <span class="material-icons">send</span>
          ${data.submittedToManager ? 'Đã gửi lên Quản lý' : 'Gửi lên Quản lý duyệt'}
        </button>
      </div>
    </div>

    ${data.approved ? `
    <div class="alert alert-success">
      <span class="material-icons">verified</span>
      <span>Bảng lương tháng ${data.month} đã được <b>Quản lý duyệt</b>. Sẵn sàng xuất.</span>
    </div>
    ` : data.submittedToManager ? `
    <div class="alert alert-warning">
      <span class="material-icons">pending</span>
      <span>Bảng lương đã gửi lên Quản lý. Đang chờ duyệt...</span>
    </div>
    ` : ''}

    <div class="stat-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:16px">
      <div class="stat-card">
        <div class="stat-icon brown"><span class="material-icons">people</span></div>
        <div><div class="stat-label">Số nhân viên</div><div class="stat-value">${data.employees.length}</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><span class="material-icons">payments</span></div>
        <div>
          <div class="stat-label">Tổng quỹ lương</div>
          <div class="stat-value" style="font-size:18px">${Utils.formatCurrency(data.employees.reduce((sum, employee) => sum + employee.netSalary, 0))}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red"><span class="material-icons">timer_off</span></div>
        <div>
          <div class="stat-label">Tổng tiền phạt</div>
          <div class="stat-value">${Utils.formatCurrency(data.employees.reduce((sum, employee) => sum + employee.penalty, 0))}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon yellow"><span class="material-icons">card_giftcard</span></div>
        <div>
          <div class="stat-label">Tổng thưởng</div>
          <div class="stat-value">${Utils.formatCurrency(data.employees.reduce((sum, employee) => sum + employee.bonus, 0))}</div>
        </div>
      </div>
    </div>

    <div class="alert alert-info mb-3">
      <span class="material-icons">info</span>
      <div>
        <div style="font-weight:600">Quy tắc tính phạt đi muộn:</div>
        <div style="font-size:12px;margin-top:4px">• 1–14 phút: Ghi nhận vào điểm KPI, <b>không trừ tiền lương</b><br>
        • Từ 15 phút trở lên: Trừ <b>1 giờ lương</b> (công thức: số lần đủ 15' × lương/h)</div>
      </div>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Họ và tên</th>
            <th>Chức vụ</th>
            <th style="text-align:right">Giờ chuẩn</th>
            <th style="text-align:right">Giờ thực làm</th>
            <th style="text-align:center">Số lần muộn</th>
            <th style="text-align:center">Tổng phút muộn</th>
            <th style="text-align:right">Tiền phạt</th>
            <th style="text-align:right">Thưởng/PC</th>
            <th style="text-align:right">Lương cơ bản</th>
            <th style="text-align:right;font-weight:700">Thực nhận</th>
          </tr>
        </thead>
        <tbody>
          ${data.employees.map(employee => `
          <tr>
            <td>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:28px;height:28px;border-radius:50%;background:${Utils.avatarColor(employee.userId)};display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:700;flex-shrink:0">
                  ${Utils.getInitials(employee.name)}
                </div>
                <span class="table-name">${employee.name}</span>
              </div>
            </td>
            <td>${employee.position}</td>
            <td style="text-align:right">${employee.standardHours}h</td>
            <td style="text-align:right;font-weight:600">${employee.workedHours}h</td>
            <td style="text-align:center">
              <span class="${employee.lateTimes > 0 ? 'badge badge-warning' : ''}">${employee.lateTimes}</span>
            </td>
            <td style="text-align:center">
              <span class="${employee.lateMinutes >= 15 ? 'badge badge-danger' : employee.lateMinutes > 0 ? 'badge badge-warning' : ''}">${employee.lateMinutes}'</span>
            </td>
            <td style="text-align:right;color:${employee.penalty > 0 ? 'var(--danger)' : 'var(--text-muted)'}">
              ${employee.penalty > 0 ? '-' + Utils.formatCurrency(employee.penalty) : '0đ'}
            </td>
            <td style="text-align:right;color:${employee.bonus > 0 ? 'var(--success)' : 'var(--text-muted)'}">
              ${employee.bonus > 0 ? '+' + Utils.formatCurrency(employee.bonus) : '0đ'}
            </td>
            <td style="text-align:right">${Utils.formatCurrency(employee.baseWage)}</td>
            <td style="text-align:right;font-weight:700;font-size:14px;color:var(--brown)">
              ${Utils.formatCurrency(employee.netSalary)}
            </td>
          </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr style="background:#FAFAFA">
            <td colspan="6" style="padding:12px 14px;font-weight:700">Tổng cộng</td>
            <td style="text-align:right;font-weight:700;color:var(--danger)">
              -${Utils.formatCurrency(data.employees.reduce((sum, employee) => sum + employee.penalty, 0))}
            </td>
            <td style="text-align:right;font-weight:700;color:var(--success)">
              +${Utils.formatCurrency(data.employees.reduce((sum, employee) => sum + employee.bonus, 0))}
            </td>
            <td style="text-align:right;font-weight:700">${Utils.formatCurrency(data.employees.reduce((sum, employee) => sum + employee.baseWage, 0))}</td>
            <td style="text-align:right;font-weight:800;font-size:16px;color:var(--brown)">
              ${Utils.formatCurrency(data.employees.reduce((sum, employee) => sum + employee.netSalary, 0))}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
    `;
  },

  bindPayroll() {
    const payMonthSelect = document.getElementById('pay-month');
    if (payMonthSelect) {
      payMonthSelect.addEventListener('change', () => this.changePeriod());
    }

    const btnSubmitManager = document.getElementById('btn-submit-manager');
    if (btnSubmitManager && !btnSubmitManager.disabled) {
      btnSubmitManager.addEventListener('click', () => this.submitToManager());
    }

    const btnExportPayroll = document.getElementById('btn-export-payroll');
    if (btnExportPayroll) {
      btnExportPayroll.addEventListener('click', () => this.showExportModal());
    }
  },

  changePeriod() {
    const month = document.getElementById('pay-month')?.value;
    Toast.show(`Đang tải bảng lương tháng ${month}/2026...`, 'success');
  },

  submitToManager() {
    Modal.confirm(
      'Gửi bảng lương lên Quản lý',
      'Bạn có chắc chắn muốn gửi bảng lương này lên Quản lý để duyệt? Sau khi gửi, kế toán không thể chỉnh sửa thêm.',
      () => {
        DB.payrollMonth.submittedToManager = true;
        Toast.show('Đã gửi bảng lương lên Quản lý thành công! Đang chờ duyệt.', 'success');
        setTimeout(() => App.navTo('payroll'), 500);
      }
    );
  },

  showExportModal() {
    this._exportFmt = 'excel';
    Modal.show(`
      <div class="modal-header">
        <h3 class="modal-title">Xuất bảng lương</h3>
        <button class="modal-close" id="btn-close-export-x"><span class="material-icons">close</span></button>
      </div>
      <div class="modal-body">
        <p style="font-size:14px;color:var(--text-body);margin-bottom:16px">
          Hãy chọn định dạng file mà bạn mong muốn:
        </p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
          <div data-format="excel" class="format-option" id="pl-excel"
            style="border:2px solid var(--brown);border-radius:10px;padding:16px;text-align:center;cursor:pointer;background:var(--brown-10)">
            <div style="font-size:28px;margin-bottom:6px">📊</div>
            <div style="font-weight:700;font-size:13px;color:var(--brown)">Excel (.xlsx)</div>
          </div>
          <div data-format="pdf" class="format-option" id="pl-pdf"
            style="border:2px solid #EBEBEB;border-radius:10px;padding:16px;text-align:center;cursor:pointer">
            <div style="font-size:28px;margin-bottom:6px">📄</div>
            <div style="font-weight:700;font-size:13px">PDF (.pdf)</div>
          </div>
        </div>
        <div class="alert alert-info" style="font-size:12px">
          <span class="material-icons" style="font-size:16px">folder</span>
          <span>File sẽ được tải về máy tính của bạn. Kiểm tra thư mục Downloads.</span>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="btn-cancel-export">Hủy bỏ</button>
        <button class="btn btn-primary" id="btn-confirm-export">
          <span class="material-icons">download</span> Tải xuống
        </button>
      </div>
    `);

    // Bind event listeners for modal after injecting to DOM
    document.getElementById('btn-close-export-x')?.addEventListener('click', () => Modal.close());
    document.getElementById('btn-cancel-export')?.addEventListener('click', () => Modal.close());
    document.getElementById('btn-confirm-export')?.addEventListener('click', () => this.doExport());
    
    document.querySelectorAll('.format-option').forEach(element => {
      element.addEventListener('click', (e) => {
        const format = e.currentTarget.getAttribute('data-format');
        this.selectFormat(format);
      });
    });
  },

  selectFormat(formatType) {
    this._exportFmt = formatType;
    ['excel', 'pdf'].forEach(f => {
      const element = document.getElementById(`pl-${f}`);
      if (element) {
        element.style.borderColor = f === formatType ? 'var(--brown)' : '#EBEBEB';
        element.style.background = f === formatType ? 'var(--brown-10)' : 'white';
        // Đổi màu chữ nếu được chọn
        const textLabel = element.querySelector('div:nth-child(2)');
        if (textLabel) {
            textLabel.style.color = f === formatType ? 'var(--brown)' : 'inherit';
        }
      }
    });
  },

  doExport() {
    Modal.close();
    const formatType = this._exportFmt || 'excel';
    Toast.show(`Đang tải bảng lương ${formatType.toUpperCase()} tháng ${DB.payrollMonth.month}...`, 'success');
    setTimeout(() => Toast.show(`Bảng lương ${formatType.toUpperCase()} đã lưu vào thư mục Downloads!`, 'success'), 1500);
  }
};