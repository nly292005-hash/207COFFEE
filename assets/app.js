'use strict';

/* ============================================================
   APP.JS – Core application, router, and layout
   207 Coffee CofBase MVP
   ============================================================ */

// Constants
const MIN_PASSWORD_LENGTH = 8;
const DEMO_OTP_CODE = '123456';

// ── ROUTER ─────────────────────────────────────────────────
const Router = {
  currentView: null,
  history: [],

  go(view, params = {}) {
    this.history.push({ view: this.currentView, params });
    this.currentView = view;
    App.render(view, params);
  },

  back() {
    const prev = this.history.pop();
    if (prev && prev.view) {
      this.currentView = prev.view;
      App.render(prev.view, prev.params || {});
    }
  }
};

// ── TOAST ───────────────────────────────────────────────────
const Toast = {
  show(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = { 
      success: 'check_circle', 
      warning: 'warning', 
      danger: 'error' 
    };
    
    toast.innerHTML = `
      <span class="material-icons" style="font-size:18px">${icons[type] || 'info'}</span>
      ${message}
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = '0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

// ── MODAL ───────────────────────────────────────────────────
const Modal = {
  show(content, options = {}) {
    const { size = '', onClose } = options;
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.id = 'active-modal';

    backdrop.innerHTML = `
      <div class="modal ${size}" role="dialog">
        ${content}
      </div>
    `;

    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) {
        this.close();
        if (onClose) {
          onClose();
        }
      }
    });

    document.body.appendChild(backdrop);
    return backdrop;
  },

  close() {
    const activeModal = document.getElementById('active-modal');
    if (activeModal) {
      activeModal.remove();
    }
  },

  confirm(title, message, onConfirm, onCancel, confirmText = 'Xác nhận', confirmClass = 'btn-primary') {
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" id="modal-close-btn">
          <span class="material-icons">close</span>
        </button>
      </div>
      <div class="modal-body">
        <p style="font-size:14px;color:var(--text-body);line-height:1.6">${message}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="modal-cancel-btn">Hủy bỏ</button>
        <button class="btn ${confirmClass}" id="modal-confirm-btn">${confirmText}</button>
      </div>
    `;

    this.show(content);

    // Bind events
    document.getElementById('modal-close-btn').addEventListener('click', () => {
      this.close();
    });

    document.getElementById('modal-cancel-btn').addEventListener('click', () => {
      this.close();
      if (onCancel) onCancel();
    });

    document.getElementById('modal-confirm-btn').addEventListener('click', () => {
      this.close();
      if (onConfirm) onConfirm();
    });
  }
};

// ── MAIN APP ────────────────────────────────────────────────
const App = {
  init() {
    document.getElementById('root').innerHTML = `
      <div id="app">
        <div id="main-area"></div>
        <div id="toast-container" class="toast-container"></div>
      </div>
    `;
    this.render('login');
  },

  render(view, params = {}) {
    const area = document.getElementById('main-area');
    const isAuthPage = ['login', 'change-password', 'forgot-password'].includes(view);

    if (DB.session && !isAuthPage) {
      this.renderWithLayout(view, params, area);
    } else {
      if (view === 'login') {
        area.innerHTML = AuthModule.renderLogin();
      } else if (view === 'change-password') {
        area.innerHTML = AuthModule.renderChangePassword(params);
      } else if (view === 'forgot-password') {
        area.innerHTML = AuthModule.renderForgotPassword();
      }
      AuthModule.bind(view, params);
    }
  },

  renderWithLayout(view, params, area) {
    const user = DB.session;
    const navItems = this.getNavItems(user.role);
    const currentDate = new Date().toLocaleDateString('vi-VN', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
    });

    const isManager = user.role === 'ceo' || user.role === 'leader';
    const branchLabel = user.branch === 'all' ? 'Tất cả cơ sở' : user.branch;

    area.innerHTML = `
      <div id="app">
        <div id="sidebar-overlay" class="sidebar-overlay"></div>

        <aside class="sidebar" id="sidebar">
          <div class="sidebar-brand">
            <div class="brand-logo">☕</div>
            <div>
              <div class="brand-name">207 Coffee</div>
              <div class="brand-sub">CofBase MVP</div>
            </div>
          </div>
          
          <div class="sidebar-user">
            <div class="sidebar-user-name">${user.name}</div>
            <div class="sidebar-user-role">${this.getRoleLabel(user.role)} · ${branchLabel}</div>
          </div>
          
          <nav class="sidebar-nav" id="sidebar-nav">
            ${navItems.map(navGroup => `
              <div class="nav-group-label">${navGroup.group}</div>
              ${navGroup.items.map(item => `
                <button class="nav-item ${view === item.view ? 'active' : ''}" data-view="${item.view}">
                  <span class="material-icons">${item.icon}</span>
                  ${item.label}
                </button>
              `).join('')}
            `).join('')}
          </nav>
          
          <div class="sidebar-logout">
            <button class="nav-item" id="btn-logout" style="color:rgba(255,255,255,0.5)">
              <span class="material-icons">logout</span>
              Đăng xuất
            </button>
          </div>
        </aside>

        <main class="main-content">
          <header class="topbar">
            <div style="display:flex; align-items:center; gap: 12px;">
              <button id="mobile-menu-btn" class="mobile-menu-btn" style="background:none; border:none; cursor:pointer; display:none; padding: 4px;">
                <span class="material-icons" style="font-size:26px;">menu</span>
              </button>
              <div class="topbar-title" id="topbar-title">${this.getViewTitle(view)}</div>
            </div>

            <div class="topbar-actions">
              ${isManager ? `
                <span style="font-size:12px;color:var(--text-muted)" class="hide-on-mobile">
                  <span class="material-icons" style="font-size:14px;vertical-align:-2px">schedule</span>
                  ${currentDate}
                </span>
              ` : ''}
              <div class="topbar-user">
                <div class="topbar-avatar">${Utils.getInitials(user.name)}</div>
                <span class="hide-on-mobile">${user.name}</span>
              </div>
            </div>
          </header>
          <div class="page-content" id="page-content">
            <div style="display:flex;justify-content:center;padding:40px">
              <div class="skeleton" style="height:40px;width:200px;border-radius:8px"></div>
            </div>
          </div>
        </main>
      </div>
    `;

    // Bind sidebar navigation events
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetView = e.currentTarget.getAttribute('data-view');
        if (targetView) this.navTo(targetView);
        
        // --- ĐÃ THÊM CHO MOBILE: Đóng sidebar sau khi bấm chuyển trang ---
        document.getElementById('sidebar').classList.remove('mobile-open');
        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) overlay.classList.remove('show');
      });
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
      this.logout();
    });

    // --- ĐÃ THÊM CHO MOBILE: Logic bấm nút mở/đóng Menu ---
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (mobileBtn && sidebar && overlay) {
      mobileBtn.addEventListener('click', () => {
        sidebar.classList.add('mobile-open');
        overlay.classList.add('show');
      });

      overlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('show');
      });
    }

    // Render view content asynchronously
    setTimeout(() => this.renderView(view, params), 50);
  },

  renderView(view, params) {
    const content = document.getElementById('page-content');
    const title = document.getElementById('topbar-title');
    
    if (title) {
      title.textContent = this.getViewTitle(view);
    }

    let html = '';
    let bindFn = null;

    switch (view) {
      case 'employee-home':
        html = AttendanceModule.renderEmployeeHome();
        bindFn = () => AttendanceModule.bindEmployeeHome();
        break;
      case 'shift-register':
        html = ShiftsModule.renderRegister();
        bindFn = () => ShiftsModule.bindRegister();
        break;
      case 'attendance-history':
        html = AttendanceModule.renderHistory();
        break;
      case 'leader-dashboard':
        html = LeaderDashModule.render();
        bindFn = () => LeaderDashModule.bind();
        break;
      case 'shift-schedule':
        html = ShiftsModule.renderSchedule();
        bindFn = () => ShiftsModule.bindSchedule();
        break;
      case 'shift-approve':
        html = ShiftsModule.renderApprove();
        bindFn = () => ShiftsModule.bindApprove();
        break;
      case 'exception-checkin':
        html = AttendanceModule.renderException();
        bindFn = () => AttendanceModule.bindException();
        break;
      case 'edit-attendance':
        html = AttendanceModule.renderEdit();
        bindFn = () => AttendanceModule.bindEdit();
        break;
      case 'ceo-dashboard':
        html = CEODashModule.render();
        bindFn = () => CEODashModule.bind();
        break;
      case 'salary-setup':
        html = PayrollModule.renderSalarySetup();
        bindFn = () => PayrollModule.bindSalarySetup();
        break;
      case 'payroll':
        html = PayrollModule.renderPayroll();
        bindFn = () => PayrollModule.bindPayroll();
        break;
      case 'pos':
        html = POSModule.render();
        bindFn = () => POSModule.bind();
        break;
      case 'day-report':
        html = ReportsModule.renderDayReport();
        bindFn = () => ReportsModule.bindDayReport();
        break;
      case 'report-history':
        html = ReportsModule.renderHistory();
        break;
      default:
        html = `<div class="card card-body"><p>Tính năng đang phát triển...</p></div>`;
    }

    if (content) {
      content.innerHTML = html;
      if (bindFn) {
        setTimeout(bindFn, 50);
      }
    }
  },

  navTo(view) {
    document.querySelectorAll('.nav-item').forEach(el => {
      if (el.dataset.view === view) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
    
    this.renderView(view, {});
    
    const title = document.getElementById('topbar-title');
    if (title) {
      title.textContent = this.getViewTitle(view);
    }
    
    Router.currentView = view;
  },

  logout() {
    Modal.confirm(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
      () => {
        DB.session = null;
        Router.history = [];
        this.render('login');
      }
    );
  },

  getRoleLabel(role) {
    const labels = {
      ceo: 'Quản lý / CEO',
      leader: 'Trưởng ca',
      accountant: 'Kế toán',
      employee: 'Nhân viên'
    };
    return labels[role] || role;
  },

  getViewTitle(view) {
    const titles = {
      'login': 'Đăng nhập',
      'employee-home': 'Chấm công hôm nay',
      'shift-register': 'Đăng ký ca làm việc',
      'attendance-history': 'Lịch sử chấm công',
      'leader-dashboard': 'Tổng quan ca',
      'shift-schedule': 'Lịch làm việc tổng hợp',
      'shift-approve': 'Duyệt & Điều phối ca',
      'exception-checkin': 'Check-in ngoại lệ',
      'edit-attendance': 'Chỉnh sửa chấm công',
      'ceo-dashboard': 'Dashboard Quản trị',
      'salary-setup': 'Thiết lập mức lương',
      'payroll': 'Tổng hợp & Tính lương',
      'pos': 'Bán hàng tại quầy',
      'day-report': 'Báo cáo chốt ca',
      'report-history': 'Lịch sử báo cáo',
    };
    return titles[view] || '207 Coffee';
  },

  getNavItems(role) {
    switch(role) {
      case 'ceo':
        return [
          { group: 'BÁO CÁO', items: [
            { view: 'ceo-dashboard', icon: 'dashboard', label: 'Dashboard' },
            { view: 'report-history', icon: 'history', label: 'Lịch sử báo cáo' },
          ]},
          { group: 'NHÂN SỰ', items: [
            { view: 'salary-setup', icon: 'payments', label: 'Thiết lập lương' },
            { view: 'payroll', icon: 'summarize', label: 'Bảng lương' },
            { view: 'shift-schedule', icon: 'calendar_month', label: 'Lịch làm việc' },
            { view: 'edit-attendance', icon: 'edit_note', label: 'Chỉnh sửa chấm công' },
          ]},
          { group: 'BÁN HÀNG', items: [
            { view: 'pos', icon: 'point_of_sale', label: 'POS Bán hàng' },
          ]}
        ];
      case 'leader':
        return [
          { group: 'TỔNG QUAN', items: [
            { view: 'leader-dashboard', icon: 'dashboard', label: 'Tổng quan ca' },
            { view: 'day-report', icon: 'assignment_turned_in', label: 'Báo cáo chốt ca' },
            { view: 'report-history', icon: 'history', label: 'Lịch sử báo cáo' },
          ]},
          { group: 'CA LÀM VIỆC', items: [
            { view: 'shift-schedule', icon: 'calendar_month', label: 'Lịch tổng hợp' },
            { view: 'shift-approve', icon: 'approval', label: 'Duyệt ca' },
          ]},
          { group: 'CHẤM CÔNG', items: [
            { view: 'exception-checkin', icon: 'person_add', label: 'Check-in ngoại lệ' },
            { view: 'edit-attendance', icon: 'edit_note', label: 'Chỉnh sửa chấm công' },
          ]},
          { group: 'BÁN HÀNG', items: [
            { view: 'pos', icon: 'point_of_sale', label: 'POS Bán hàng' },
          ]}
        ];
      case 'accountant':
        return [
          { group: 'LƯƠNG', items: [
            { view: 'salary-setup', icon: 'payments', label: 'Thiết lập lương' },
            { view: 'payroll', icon: 'summarize', label: 'Tính lương' },
          ]},
          { group: 'BÁO CÁO', items: [
            { view: 'report-history', icon: 'history', label: 'Lịch sử báo cáo' },
          ]}
        ];
      case 'employee':
      default:
        return [
          { group: 'CHẤM CÔNG', items: [
            { view: 'employee-home', icon: 'fingerprint', label: 'Chấm công hôm nay' },
            { view: 'attendance-history', icon: 'history', label: 'Lịch sử chấm công' },
          ]},
          { group: 'CA LÀM VIỆC', items: [
            { view: 'shift-register', icon: 'event_available', label: 'Đăng ký ca' },
          ]},
        ];
    }
  }
};

// ── AUTH MODULE ──────────────────────────────────────────────
const AuthModule = {
  renderLogin() {
    const demoAccounts = [
      { username: 'ceo', role: 'CEO/Quản lý' },
      { username: 'truongca1', role: 'Trưởng ca' },
      { username: 'ketoan', role: 'Kế toán' },
      { username: 'nv001', role: 'Nhân viên (đăng nhập lần đầu)' },
      { username: 'nv002', role: 'Nhân viên' }
    ];

    return `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="auth-logo-icon">☕</div>
          <div class="auth-logo-text">
            <h1>207 Coffee</h1>
            <p>CofBase MVP System</p>
          </div>
        </div>
        <h2 class="auth-title">Đăng nhập hệ thống</h2>
        <p class="auth-subtitle">Nhập tài khoản được cấp để tiếp tục</p>

        <div id="login-alert" class="alert alert-danger hidden">
          <span class="material-icons">error_outline</span>
          <span id="login-alert-msg">Tên đăng nhập hoặc mật khẩu không đúng</span>
        </div>

        <form id="login-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="login-username">Tên đăng nhập <span class="required">*</span></label>
            <div class="input-group">
              <input type="text" id="login-username" class="form-control" placeholder="VD: nv001, truongca1" autocomplete="username">
              <div class="input-group-btn"><span class="material-icons">person</span></div>
            </div>
            <div class="form-error" id="err-username">Vui lòng nhập tên đăng nhập</div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="login-password">Mật khẩu <span class="required">*</span></label>
            <div class="input-group">
              <input type="password" id="login-password" class="form-control" placeholder="Nhập mật khẩu" autocomplete="current-password">
              <button type="button" class="input-group-btn" id="toggle-pw" tabindex="-1">
                <span class="material-icons" id="pw-icon">visibility_off</span>
              </button>
            </div>
            <div class="form-error" id="err-password">Vui lòng nhập mật khẩu</div>
          </div>

          <div style="text-align:right;margin-bottom:20px">
            <a href="#" id="forgot-pw-link" style="font-size:13px;color:var(--brown);text-decoration:none;font-weight:500">
              Quên mật khẩu?
            </a>
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg" id="login-btn">
            Đăng nhập
          </button>
        </form>

        <div style="margin-top:20px;padding:12px;background:#FFF8E1;border-radius:8px;border:1px solid #FFE082">
          <p style="font-size:12px;color:#E65100;font-weight:600;margin-bottom:6px">Demo tài khoản:</p>
          <div class="demo-accounts-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
            ${demoAccounts.map(account => `
              <div class="demo-account-card" data-username="${account.username}"
                style="cursor:pointer;padding:6px 8px;background:white;border-radius:4px;border:1px solid #EBEBEB;font-size:11px;">
                <b>${account.username}</b> <span style="color:var(--text-muted)">${account.role}</span>
              </div>
            `).join('')}
          </div>
          <p style="font-size:11px;color:var(--text-muted);margin-top:6px">Mật khẩu mặc định: <b>207Coffee@123</b></p>
        </div>
      </div>
    </div>
    `;
  },

  renderChangePassword(params) {
    const isFirst = params.isFirst || false;
    
    return `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="auth-logo-icon">☕</div>
          <div class="auth-logo-text">
            <h1>207 Coffee</h1>
            <p>CofBase MVP System</p>
          </div>
        </div>
        
        ${isFirst ? `
          <div class="alert alert-warning mb-4">
            <span class="material-icons">lock_reset</span>
            <span>Đây là lần đăng nhập đầu tiên. Vui lòng đổi mật khẩu mặc định trước khi sử dụng hệ thống.</span>
          </div>
        ` : ''}
        
        <h2 class="auth-title">Đổi mật khẩu</h2>
        <p class="auth-subtitle">Mật khẩu mới phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự</p>

        <form id="changepw-form" novalidate>
          ${!isFirst ? `
          <div class="form-group">
            <label class="form-label" for="old-password">Mật khẩu hiện tại <span class="required">*</span></label>
            <input type="password" id="old-password" class="form-control" placeholder="Nhập mật khẩu hiện tại">
            <div class="form-error" id="err-old-pw">Mật khẩu không đúng</div>
          </div>
          ` : ''}
          
          <div class="form-group">
            <label class="form-label" for="new-password">Mật khẩu mới <span class="required">*</span></label>
            <input type="password" id="new-password" class="form-control" placeholder="Nhập mật khẩu mới">
            <div class="form-error" id="err-new-pw">Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự</div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="confirm-password">Xác nhận mật khẩu mới <span class="required">*</span></label>
            <input type="password" id="confirm-password" class="form-control" placeholder="Nhập lại mật khẩu mới">
            <div class="form-error" id="err-confirm-pw">Mật khẩu không khớp</div>
          </div>
          
          <button type="submit" class="btn btn-primary btn-block btn-lg" id="changepw-btn">
            Xác nhận đổi mật khẩu
          </button>
          
          ${!isFirst ? `
          <button type="button" class="btn btn-ghost btn-block mt-2" id="btn-cancel-change-pw">
            Hủy bỏ
          </button>
          ` : ''}
        </form>
      </div>
    </div>
    `;
  },

  renderForgotPassword() {
    return `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="auth-logo-icon">☕</div>
          <div class="auth-logo-text">
            <h1>207 Coffee</h1>
            <p>CofBase MVP System</p>
          </div>
        </div>
        
        <h2 class="auth-title">Quên mật khẩu</h2>
        <p class="auth-subtitle">Nhập email đăng ký để nhận mã OTP đặt lại mật khẩu</p>

        <div id="forgot-step-1" class="forgot-step">
          <div id="forgot-alert" class="alert alert-danger hidden">
            <span class="material-icons">error_outline</span>
            <span id="forgot-alert-msg"></span>
          </div>
          <div class="form-group">
            <label class="form-label" for="forgot-email">Email <span class="required">*</span></label>
            <div class="input-group">
              <input type="email" id="forgot-email" class="form-control" placeholder="email@207coffee.vn">
              <div class="input-group-btn"><span class="material-icons">email</span></div>
            </div>
            <div class="form-error" id="err-forgot-email">Email không hợp lệ</div>
          </div>
          <button class="btn btn-primary btn-block" id="send-otp-btn">
            Gửi mã OTP
          </button>
        </div>

        <div id="forgot-step-2" class="forgot-step hidden">
          <div class="alert alert-success">
            <span class="material-icons">mark_email_read</span>
            <span>Mã OTP đã được gửi đến email của bạn. Hiệu lực 5 phút.</span>
          </div>
          <div class="form-group">
            <label class="form-label" for="otp-input">Mã OTP <span class="required">*</span></label>
            <input type="text" id="otp-input" class="form-control" placeholder="Nhập 6 chữ số" maxlength="6"
              style="letter-spacing:8px;font-size:20px;text-align:center;font-weight:700">
            <p class="form-hint">Mã demo: <b>${DEMO_OTP_CODE}</b></p>
          </div>
          <div class="form-group">
            <label class="form-label" for="new-pw-forgot">Mật khẩu mới <span class="required">*</span></label>
            <input type="password" id="new-pw-forgot" class="form-control" placeholder="Nhập mật khẩu mới">
          </div>
          <div class="form-group">
            <label class="form-label" for="confirm-pw-forgot">Xác nhận mật khẩu mới <span class="required">*</span></label>
            <input type="password" id="confirm-pw-forgot" class="form-control" placeholder="Nhập lại mật khẩu mới">
            <div class="form-error" id="err-otp-confirm">Mật khẩu không khớp</div>
          </div>
          <button class="btn btn-primary btn-block" id="reset-pw-btn">
            Đặt lại mật khẩu
          </button>
        </div>

        <button class="btn btn-ghost btn-block mt-3" id="back-to-login-btn">
          <span class="material-icons">arrow_back</span> Quay lại đăng nhập
        </button>
      </div>
    </div>
    `;
  },

  bind(view, params) {
    if (view === 'login') {
      const form = document.getElementById('login-form');
      if (form) {
        form.addEventListener('submit', (e) => { 
          e.preventDefault(); 
          this.doLogin(); 
        });
      }

      const toggleBtn = document.getElementById('toggle-pw');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', this.togglePassword);
      }

      const forgotLink = document.getElementById('forgot-pw-link');
      if (forgotLink) {
        forgotLink.addEventListener('click', (e) => { 
          e.preventDefault(); 
          App.render('forgot-password'); 
        });
      }

      document.querySelectorAll('.demo-account-card').forEach(card => {
        card.addEventListener('click', (e) => {
          const username = e.currentTarget.getAttribute('data-username');
          document.getElementById('login-username').value = username;
          document.getElementById('login-password').value = '207Coffee@123';
        });
      });
    }

    if (view === 'change-password') {
      const form = document.getElementById('changepw-form');
      if (form) {
        form.addEventListener('submit', (e) => { 
          e.preventDefault(); 
          this.doChangePassword(params); 
        });
      }

      const cancelBtn = document.getElementById('btn-cancel-change-pw');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          Router.back();
        });
      }
    }

    if (view === 'forgot-password') {
      const sendOtpBtn = document.getElementById('send-otp-btn');
      if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', () => this.sendOTP());
      }

      const resetPwBtn = document.getElementById('reset-pw-btn');
      if (resetPwBtn) {
        resetPwBtn.addEventListener('click', () => this.resetPassword());
      }

      const backToLoginBtn = document.getElementById('back-to-login-btn');
      if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', () => App.render('login'));
      }
    }
  },

  togglePassword() {
    const pwInput = document.getElementById('login-password');
    const icon = document.getElementById('pw-icon');
    
    if (pwInput.type === 'password') { 
      pwInput.type = 'text'; 
      icon.textContent = 'visibility'; 
    } else { 
      pwInput.type = 'password'; 
      icon.textContent = 'visibility_off'; 
    }
  },

  doLogin() {
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    let isValid = true;

    const showErr = (id, shouldShow) => {
      const errorLabel = document.getElementById(id);
      if (errorLabel) {
        if (shouldShow) {
          errorLabel.classList.add('show');
        } else {
          errorLabel.classList.remove('show');
        }
      }
      
      const inputId = id.replace('err-', 'login-');
      const inputEl = document.getElementById(inputId);
      
      if (inputEl) {
        if (shouldShow) {
          inputEl.classList.add('error');
        } else {
          inputEl.classList.remove('error');
        }
      }
    };

    if (!username) { 
      showErr('err-username', true); 
      isValid = false; 
    } else {
      showErr('err-username', false);
    }
    
    if (!password) { 
      showErr('err-password', true); 
      isValid = false; 
    } else {
      showErr('err-password', false);
    }

    if (!isValid) return;

    const userRecord = DB.users.find(u => u.username === username && u.password === password);

    if (!userRecord) {
      const alertBox = document.getElementById('login-alert');
      if (alertBox) {
        alertBox.classList.remove('hidden');
      }
      return;
    }

    if (userRecord.defaultPw) {
      DB.session = userRecord;
      App.render('change-password', { user: userRecord, isFirst: true });
      return;
    }

    DB.session = userRecord;
    this.redirectByRole(userRecord.role);
  },

  redirectByRole(role) {
    const routes = {
      ceo: 'ceo-dashboard',
      leader: 'leader-dashboard',
      accountant: 'payroll',
      employee: 'employee-home'
    };
    App.render(routes[role] || 'employee-home');
  },

  doChangePassword(params) {
    const newPwInput = document.getElementById('new-password');
    const confirmPwInput = document.getElementById('confirm-password');
    
    const newPw = newPwInput.value;
    const confirmPw = confirmPwInput.value;
    const userRecord = params.user || DB.session;
    
    let isValid = true;

    if (!params.isFirst) {
      const oldPwInput = document.getElementById('old-password');
      const oldPw = oldPwInput.value;
      const errOld = document.getElementById('err-old-pw');
      
      if (oldPw !== userRecord.password) {
        if (errOld) errOld.classList.add('show');
        oldPwInput.classList.add('error');
        isValid = false;
      } else {
        if (errOld) errOld.classList.remove('show');
        oldPwInput.classList.remove('error');
      }
    }

    if (newPw.length < MIN_PASSWORD_LENGTH) {
      document.getElementById('err-new-pw').classList.add('show');
      newPwInput.classList.add('error');
      isValid = false;
    } else {
      document.getElementById('err-new-pw').classList.remove('show');
      newPwInput.classList.remove('error');
    }

    if (newPw !== confirmPw) {
      document.getElementById('err-confirm-pw').classList.add('show');
      confirmPwInput.classList.add('error');
      isValid = false;
    } else {
      document.getElementById('err-confirm-pw').classList.remove('show');
      confirmPwInput.classList.remove('error');
    }

    if (!isValid) return;

    const dbUser = DB.users.find(u => u.id === userRecord.id);
    if (dbUser) { 
      dbUser.password = newPw; 
      dbUser.defaultPw = false; 
    }
    
    DB.session = dbUser;

    Toast.show('Đổi mật khẩu thành công!', 'success');
    setTimeout(() => this.redirectByRole(dbUser.role), 800);
  },

  sendOTP() {
    const emailInput = document.getElementById('forgot-email');
    const email = emailInput.value.trim();
    const emailUser = DB.users.find(u => u.email === email);

    if (!email || !email.includes('@')) {
      document.getElementById('err-forgot-email').classList.add('show');
      emailInput.classList.add('error');
      return;
    }

    if (!emailUser) {
      const alertBox = document.getElementById('forgot-alert');
      const alertMsg = document.getElementById('forgot-alert-msg');
      
      alertMsg.textContent = 'Email không tồn tại trong hệ thống';
      if (alertBox) {
        alertBox.classList.remove('hidden');
      }
      return;
    }

    document.getElementById('forgot-step-1').classList.add('hidden');
    document.getElementById('forgot-step-2').classList.remove('hidden');
    this._forgotUser = emailUser;
  },

  resetPassword() {
    const otp = document.getElementById('otp-input').value;
    const newPw = document.getElementById('new-pw-forgot').value;
    const confirmPw = document.getElementById('confirm-pw-forgot').value;

    if (otp !== DEMO_OTP_CODE) { 
      Toast.show('Mã OTP không đúng', 'danger'); 
      return; 
    }
    
    if (newPw.length < MIN_PASSWORD_LENGTH) { 
      Toast.show(`Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`, 'danger'); 
      return; 
    }
    
    if (newPw !== confirmPw) {
      document.getElementById('err-otp-confirm').classList.add('show');
      return;
    }

    if (this._forgotUser) {
      const dbUser = DB.users.find(u => u.id === this._forgotUser.id);
      if (dbUser) { 
        dbUser.password = newPw; 
        dbUser.defaultPw = false; 
      }
    }

    Toast.show('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.', 'success');
    setTimeout(() => App.render('login'), 1500);
  }
};

// ── INIT ─────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => App.init());