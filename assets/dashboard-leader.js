/* ============================================================
   LEADER DASHBOARD MODULE
   ============================================================ */

const LeaderDashModule = {
  render() {
    const today = new Date();
    const todayRev = Utils.getTodayRevenue();
    const todayAttendance = DB.attendance.filter(a => a.date === '2025-06-05');
    const staff = DB.users.filter(u => u.role === 'employee' || u.role === 'leader');

    // Current shift
    const hour = today.getHours();
    let currentShift = null;
    if (hour >= 7 && hour < 12.5) currentShift = DB.shiftTypes[0];
    else if (hour >= 12.5 && hour < 18) currentShift = DB.shiftTypes[1];
    else if (hour >= 18) currentShift = DB.shiftTypes[2];

    // Staff in current shift
    const dayKey = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][today.getDay()];
    const currentShiftStaff = DB.shiftRegistrations.filter(r =>
      r.day === dayKey && r.shiftId === currentShift?.id && r.week === '2025-W23' && r.status === 'approved'
    );

    const flaggedCount = DB.attendance.filter(a => a.status === 'flag').length;
    const pendingRegs = DB.shiftRegistrations.filter(r => r.status === 'pending').length;

    return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Tổng quan ca làm việc</h1>
        <p class="text-muted fs-13 mt-1">${today.toLocaleDateString('vi-VN',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'})}</p>
      </div>
      <div class="page-header-right">
        ${currentShift ? `
        <div class="badge badge-brown" style="padding:8px 14px;font-size:13px">
          <span class="material-icons" style="font-size:16px">schedule</span>
          Ca hiện tại: ${currentShift.name} (${currentShift.start}–${currentShift.end})
        </div>
        ` : ''}
      </div>
    </div>

    <!-- Stats -->
    <div class="stat-grid" style="grid-template-columns:repeat(4,1fr)">
      <div class="stat-card">
        <div class="stat-icon brown"><span class="material-icons">people</span></div>
        <div>
          <div class="stat-label">Nhân sự hiện ca</div>
          <div class="stat-value">${currentShiftStaff.length}/${staff.length}</div>
          <div class="stat-change ${currentShiftStaff.length >= 2 ? 'up' : 'down'}">
            ${currentShiftStaff.length >= 2 ? 'Đủ người' : '⚠ Thiếu nhân sự'}
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><span class="material-icons">point_of_sale</span></div>
        <div>
          <div class="stat-label">Doanh thu hôm nay</div>
          <div class="stat-value" style="font-size:18px">${Utils.formatCurrency(todayRev.total)}</div>
          <div class="stat-change up">+12.4% so hôm qua</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon ${flaggedCount > 0 ? 'red' : 'green'}"><span class="material-icons">flag</span></div>
        <div>
          <div class="stat-label">Ngoại lệ chấm công</div>
          <div class="stat-value">${flaggedCount}</div>
          <div class="stat-change ${flaggedCount > 0 ? 'down' : 'up'}">
            ${flaggedCount > 0 ? 'Cần xử lý' : 'Không có vấn đề'}
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon yellow"><span class="material-icons">event_note</span></div>
        <div>
          <div class="stat-label">Ca chờ duyệt</div>
          <div class="stat-value">${pendingRegs}</div>
          <div class="stat-change">${pendingRegs > 0 ? 'Cần xét duyệt' : 'Đã xử lý hết'}</div>
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">

      <!-- Staff status -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Tình trạng nhân sự ca hiện tại</span>
          <button class="btn btn-primary btn-sm" onclick="App.navTo('exception-checkin')">
            <span class="material-icons">person_add</span> Check-in hộ
          </button>
        </div>
        <div class="card-body" style="padding:12px">
          <div class="staff-grid">
            ${staff.map(emp => {
              const shiftReg = DB.shiftRegistrations.find(r =>
                r.userId === emp.id && r.shiftId === currentShift?.id &&
                r.day === dayKey && r.week === '2025-W23' && r.status === 'approved'
              );
              const attRec = DB.attendance.find(a =>
                a.userId === emp.id && a.date === '2025-06-05'
              );
              const isScheduled = !!shiftReg;
              const isCheckedIn = attRec && attRec.checkIn && !attRec.checkOut;
              const isCheckedOut = attRec && attRec.checkIn && attRec.checkOut;
              const isFlag = attRec?.status === 'flag';

              let statusText = 'Không có ca';
              let statusClass = '';
              if (isFlag) { statusText = '⚠ Thiếu checkout'; statusClass = 'not-checked'; }
              else if (isCheckedOut) { statusText = 'Đã về'; statusClass = 'checked-in'; }
              else if (isCheckedIn) { statusText = 'Đang làm việc'; statusClass = 'checked-in'; }
              else if (isScheduled) { statusText = 'Chưa check-in'; statusClass = 'not-checked'; }

              return `
              <div class="staff-card">
                <div class="staff-avatar" style="background:${Utils.avatarColor(emp.id)}">
                  ${Utils.getInitials(emp.name)}
                </div>
                <div>
                  <div class="staff-name">${emp.name}</div>
                  <div class="staff-shift">${emp.position}</div>
                  <div class="staff-status ${statusClass}">${statusText}</div>
                </div>
              </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Quick actions -->
      <div>
        <h3 class="section-title">Thao tác nhanh</h3>
        <div class="quick-actions">
          <button class="quick-action-btn" onclick="App.navTo('shift-approve')">
            <span class="material-icons">approval</span>
            <span>Duyệt ca (${pendingRegs})</span>
          </button>
          <button class="quick-action-btn" onclick="App.navTo('exception-checkin')">
            <span class="material-icons">person_add</span>
            <span>Check-in ngoại lệ</span>
          </button>
          <button class="quick-action-btn" onclick="App.navTo('edit-attendance')">
            <span class="material-icons">edit_note</span>
            <span>Sửa chấm công</span>
          </button>
          <button class="quick-action-btn" onclick="App.navTo('shift-schedule')">
            <span class="material-icons">calendar_month</span>
            <span>Xem lịch</span>
          </button>
          <button class="quick-action-btn" onclick="App.navTo('pos')">
            <span class="material-icons">point_of_sale</span>
            <span>POS Bán hàng</span>
          </button>
          <button class="quick-action-btn" onclick="App.navTo('day-report')">
            <span class="material-icons">assignment_turned_in</span>
            <span>Chốt ca</span>
          </button>
        </div>

        <!-- Revenue mini card -->
        <div class="card mt-3">
          <div class="card-header">
            <span class="card-title">Doanh thu ca hôm nay</span>
          </div>
          <div class="card-body">
            <div class="report-row">
              <span class="report-row-label">Tổng đơn hàng</span>
              <span class="report-row-value">${todayRev.count} đơn</span>
            </div>
            <div class="report-row">
              <span class="report-row-label">Tiền mặt</span>
              <span class="report-row-value">${Utils.formatCurrency(todayRev.cash)}</span>
            </div>
            <div class="report-row">
              <span class="report-row-label">Chuyển khoản</span>
              <span class="report-row-value">${Utils.formatCurrency(todayRev.transfer)}</span>
            </div>
            <div class="divider"></div>
            <div class="report-row">
              <span class="report-row-label" style="font-weight:700">Tổng doanh thu</span>
              <span class="report-row-value" style="font-size:18px;color:var(--brown)">${Utils.formatCurrency(todayRev.total)}</span>
            </div>
          </div>
        </div>

        <!-- Flagged alerts -->
        ${flaggedCount > 0 ? `
        <div class="alert alert-danger mt-3">
          <span class="material-icons">flag</span>
          <div>
            <div style="font-weight:700">Có ${flaggedCount} ca bị đánh dấu ngoại lệ!</div>
            <div style="font-size:12px;margin-top:2px">Nhân viên quên check-out. Cần xác minh và cập nhật thủ công.</div>
            <button class="btn btn-danger btn-sm mt-2" onclick="App.navTo('edit-attendance')">Xử lý ngay</button>
          </div>
        </div>
        ` : ''}
      </div>
    </div>
    `;
  },

  bind() {}
};
