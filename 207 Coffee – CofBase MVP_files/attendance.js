'use strict';

/* ============================================================
   ATTENDANCE MODULE – Check-in/out, History, Exception, Edit
   ============================================================ */

const AttendanceModule = {
  // Simulate GPS check-in state
  _checkedIn: false,
  _checkInTime: null,
  _timer: null,

  renderEmployeeHome() {
    const user = DB.session;
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];

    // Get today's shifts for this user
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayKey = daysOfWeek[today.getDay()];
    
    const weekRegistrations = DB.shiftRegistrations.filter(registration =>
      registration.userId === user.id && 
      registration.status === 'approved' && 
      registration.day === dayKey
    );

    const todayRecord = DB.attendance.find(record =>
      record.userId === user.id && record.date === todayKey
    );

    const gpsOk = true; // Simulated GPS within range
    const formattedDate = today.toLocaleDateString('vi-VN', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
    });

    // Render ca làm việc
    let shiftsHtml = '';
    if (weekRegistrations.length === 0) {
      shiftsHtml = `
        <div style="text-align:center;padding:24px;color:var(--text-muted)">
          <span class="material-icons" style="font-size:40px;display:block;margin-bottom:8px">event_busy</span>
          Không có ca làm việc hôm nay
        </div>
      `;
    } else {
      shiftsHtml = weekRegistrations.map(registration => {
        const shift = Utils.getShiftById(registration.shiftId);
        
        let borderColor = 'var(--brown-20)';
        let bgColor = 'var(--brown-10)';
        let iconColor = 'var(--brown)';

        if (registration.shiftId === 'S') {
          borderColor = '#FFE082'; bgColor = '#FFF8E1'; iconColor = '#E65100';
        } else if (registration.shiftId === 'C') {
          borderColor = '#C8E6C9'; bgColor = '#E8F5E9'; iconColor = 'var(--success)';
        }

        return `
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg);border-radius:8px;border:1.5px solid ${borderColor}">
          <div style="width:44px;height:44px;border-radius:50%;background:${bgColor};display:flex;align-items:center;justify-content:center">
            <span class="material-icons" style="color:${iconColor}">schedule</span>
          </div>
          <div>
            <div style="font-weight:600;font-size:14px">${shift.name}</div>
            <div style="font-size:13px;color:var(--text-muted)">${shift.start} – ${shift.end} · ${shift.hours}h</div>
          </div>
          <div style="margin-left:auto">
            <span class="badge badge-success">Đã duyệt</span>
          </div>
        </div>
        `;
      }).join('');
    }

    // Render thông tin chấm công hôm nay
    let todayRecordHtml = '';
    if (todayRecord) {
      const isLate = todayRecord.lateMinutes > 0;
      const penaltyHtml = todayRecord.lateMinutes >= 15 ? '<span class="badge badge-danger" style="margin-left:6px">-1h lương</span>' : '';
      const flagBadge = todayRecord.status === 'flag' ? '<span class="flag-badge"><span class="material-icons" style="font-size:14px">flag</span>Ngoại lệ</span>' : '';
      const noteHtml = todayRecord.note ? `
        <div class="alert alert-warning mt-2" style="margin-bottom:0">
          <span class="material-icons">info</span>
          <span>${todayRecord.note}</span>
        </div>` : '';

      todayRecordHtml = `
      <div class="card mt-3">
        <div class="card-header">
          <span class="card-title">Dữ liệu chấm công hôm nay</span>
          ${flagBadge}
        </div>
        <div class="card-body">
          <div class="report-row">
            <span class="report-row-label">Check-in</span>
            <span class="report-row-value">${todayRecord.checkIn || '—'}</span>
          </div>
          <div class="report-row">
            <span class="report-row-label">Check-out</span>
            <span class="report-row-value ${!todayRecord.checkOut ? 'danger' : ''}">${todayRecord.checkOut || 'Chưa check-out'}</span>
          </div>
          <div class="report-row">
            <span class="report-row-label">Đi muộn</span>
            <span class="report-row-value ${isLate ? 'danger' : 'success'}">
              ${isLate ? `${todayRecord.lateMinutes} phút` : 'Đúng giờ'}
              ${penaltyHtml}
            </span>
          </div>
          <div class="report-row">
            <span class="report-row-label">Giờ làm</span>
            <span class="report-row-value ${todayRecord.hoursWorked === 0 ? 'danger' : ''}">${todayRecord.hoursWorked}h</span>
          </div>
          ${noteHtml}
        </div>
      </div>
      `;
    }

    return `
    <div style="max-width:480px;margin:0 auto">
      <div class="checkin-card">
        <div class="label text-muted" style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase">Thời gian hiện tại</div>
        <div class="checkin-time" id="live-clock">--:--:--</div>
        <div class="checkin-date" id="live-date">${formattedDate}</div>

        <div class="checkin-status ${gpsOk ? 'ok' : 'error'}" id="gps-status">
          <span class="material-icons" style="font-size:16px">${gpsOk ? 'location_on' : 'location_off'}</span>
          <span id="gps-text">${gpsOk ? 'Đang trong phạm vi cửa hàng (~30m)' : 'Ngoài phạm vi cho phép (>50m)'}</span>
        </div>

        <button class="checkin-btn ${this._checkedIn ? 'stop' : 'start'}" id="btn-checkin-toggle"
          ${gpsOk ? '' : 'disabled style="opacity:0.5;cursor:not-allowed"'}>
          <span class="material-icons">${this._checkedIn ? 'logout' : 'fingerprint'}</span>
          <span style="font-size:14px">${this._checkedIn ? 'CHECK-OUT' : 'CHECK-IN'}</span>
        </button>

        ${this._checkedIn ? `
        <div style="text-align:center;font-size:13px;color:var(--success)">
          <span class="material-icons" style="font-size:14px;vertical-align:-2px">check_circle</span>
          Đã check-in lúc <b>${this._checkInTime}</b>
        </div>
        ` : ''}

        <button class="btn btn-ghost btn-sm mt-3" id="btn-simulate-gps">
          <span class="material-icons">gps_fixed</span>
          Mô phỏng GPS
        </button>
      </div>

      <div class="card mt-4">
        <div class="card-header">
          <span class="card-title">
            <span class="material-icons" style="font-size:18px;vertical-align:-3px;color:var(--brown)">today</span>
            Ca làm việc hôm nay
          </span>
        </div>
        <div class="card-body">
          ${shiftsHtml}
        </div>
      </div>

      ${todayRecordHtml}

      <div class="alert alert-info mt-3">
        <span class="material-icons">info</span>
        <span>Nếu được Trưởng ca gọi đến sớm, liên hệ Trưởng ca để cộng giờ thủ công vào hệ thống.</span>
      </div>
    </div>
    `;
  },

  bindEmployeeHome() {
    this.startClock();

    const btnCheckin = document.getElementById('btn-checkin-toggle');
    if (btnCheckin) {
      btnCheckin.addEventListener('click', () => this.toggleCheckin());
    }

    const btnSimulateGps = document.getElementById('btn-simulate-gps');
    if (btnSimulateGps) {
      btnSimulateGps.addEventListener('click', () => this.simulateGPS());
    }
  },

  startClock() {
    const update = () => {
      const now = new Date();
      const clock = document.getElementById('live-clock');
      if (clock) {
        clock.textContent = now.toLocaleTimeString('vi-VN');
        this._timer = setTimeout(update, 1000);
      }
    };
    update();
  },

  toggleCheckin() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const todayStr = now.toISOString().split('T')[0];

    if (!this._checkedIn) {
      this._checkedIn = true;
      this._checkInTime = timeStr;

      // Show success feedback
      const overlay = document.createElement('div');
      overlay.className = 'success-overlay';
      overlay.innerHTML = `
        <div class="success-overlay-content">
          <span class="material-icons">check_circle</span>
          <h2>Check-in thành công!</h2>
          <p style="margin-top:8px;font-size:16px;opacity:0.9">${timeStr}</p>
        </div>
      `;
      document.body.appendChild(overlay);
      setTimeout(() => overlay.remove(), 2000);

      // Add record
      DB.attendance.push({
        id: DB.nextId(DB.attendance),
        userId: DB.session.id,
        date: todayStr,
        shiftId: 'S',
        checkIn: timeStr,
        checkOut: null,
        checkInType: 'gps',
        checkOutType: null,
        lateMinutes: 0,
        hoursWorked: 0,
        status: 'normal',
        note: ''
      });

      Toast.show('Check-in thành công lúc ' + timeStr, 'success');
    } else {
      // Check-out
      Modal.confirm(
        'Xác nhận Check-out',
        `Bạn có chắc muốn Check-out lúc <b>${timeStr}</b>?`,
        () => {
          this._checkedIn = false;

          // Update record
          const record = DB.attendance.find(att =>
            att.userId === DB.session.id && att.date === todayStr && !att.checkOut
          );
          if (record) {
            record.checkOut = timeStr;
            record.checkOutType = 'gps';
            record.hoursWorked = 5.5; // Simplified
          }

          Toast.show('Check-out thành công lúc ' + timeStr, 'success');
          setTimeout(() => App.navTo('employee-home'), 500);
        }
      );
    }
    setTimeout(() => App.navTo('employee-home'), 200);
  },

  simulateGPS() {
    Modal.show(`
      <div class="modal-header">
        <h3 class="modal-title">Mô phỏng GPS</h3>
        <button class="modal-close" id="btn-close-modal-gps-x"><span class="material-icons">close</span></button>
      </div>
      <div class="modal-body">
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">Vị trí cửa hàng: 207 Coffee – Tọa độ demo</p>
        <div style="background:#E3F2FD;border-radius:8px;padding:16px;margin-bottom:12px;font-size:13px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span>Vị trí bạn:</span>
            <span style="font-weight:600">10.7769, 106.7009</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span>Vị trí cửa hàng:</span>
            <span style="font-weight:600">10.7769, 106.7009</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding-top:8px;border-top:1px solid rgba(0,0,0,0.1)">
            <span style="font-weight:600">Khoảng cách:</span>
            <span style="font-weight:700;color:var(--success)">~30m ✓ Trong phạm vi</span>
          </div>
        </div>
        <p class="hint">Phạm vi cho phép: 50m tính từ tọa độ cửa hàng</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" id="btn-close-modal-gps">Đóng</button>
      </div>
    `);

    document.getElementById('btn-close-modal-gps-x').addEventListener('click', () => Modal.close());
    document.getElementById('btn-close-modal-gps').addEventListener('click', () => Modal.close());
  },

  renderHistory() {
    const user = DB.session;
    let records = DB.attendance
.filter(record => record.userId === user.id);

const selectedDate =
document.getElementById(
'attendance-search-date'
)?.value;

const selectedMonth =
document.getElementById(
'attendance-month-filter'
)?.value || 'current';

if(selectedDate){

records=
records.filter(
r=>r.date===selectedDate
);

}

if(selectedMonth==='current'){

const now=new Date();

records=
records.filter(r=>{

const d=new Date(r.date);

return(
d.getMonth()===now.getMonth()
&&
d.getFullYear()===now.getFullYear()
);

});

}

records.sort(
(a,b)=>
b.date.localeCompare(a.date)
);

    const getStatusBadge = (record) => {
      if (record.status === 'absent') return '<span class="badge badge-danger">Vắng</span>';
      if (record.status === 'flag') return '<span class="flag-badge"><span class="material-icons" style="font-size:12px">flag</span>Thiếu checkout</span>';
      if (record.status === 'late') return '<span class="badge badge-warning">Đi muộn</span>';
      return '<span class="badge badge-success">Bình thường</span>';
    };

    const totalHours = records.reduce((sum, record) => sum + record.hoursWorked, 0);
    const totalLate = records.filter(record => record.lateMinutes > 0).length;
    const totalFlagged = records.filter(record => record.status === 'flag').length;
    const totalWorked = records.filter(record => record.status !== 'absent').length;

    return `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Lịch sử chấm công</h1>
        <p class="text-muted fs-13 mt-1">Nhân viên: ${user.name}</p>
      </div>
      <div class="page-header-right">
        <div class="search-box">
          <span class="material-icons">search</span>
          <input type="text" class="form-control" placeholder="Tìm theo ngày..." style="width:180px">
        </div>
        <select class="form-control" style="width:140px">
          <option>Tháng này</option>
          <option>Tháng trước</option>
          <option>3 tháng</option>
        </select>
      </div>
    </div>

    <div class="stat-grid" style="grid-template-columns:repeat(4,1fr)">
      <div class="stat-card">
        <div class="stat-icon green"><span class="material-icons">check_circle</span></div>
        <div><div class="stat-label">Giờ làm</div><div class="stat-value">${totalHours}h</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon yellow"><span class="material-icons">schedule</span></div>
        <div><div class="stat-label">Đi muộn</div><div class="stat-value">${totalLate} lần</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red"><span class="material-icons">flag</span></div>
        <div><div class="stat-label">Ngoại lệ</div><div class="stat-value">${totalFlagged}</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon brown"><span class="material-icons">work</span></div>
        <div><div class="stat-label">Ca đã làm</div><div class="stat-value">${totalWorked}</div></div>
      </div>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Ngày</th>
            <th>Ca</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Đi muộn</th>
            <th>Giờ làm</th>
            <th>Trạng thái</th>
            <th>Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          ${records.map(record => {
            const shift = Utils.getShiftById(record.shiftId);
            const isManual = record.checkInType === 'exception' ? '<span class="badge badge-blue" style="font-size:10px">Thủ công</span>' : '';
            const penaltyHtml = record.lateMinutes >= 15 ? ' (−1h)' : '';
            const lateColor = record.lateMinutes >= 15 ? 'var(--danger)' : 'var(--warning)';
            
            const lateHtml = record.lateMinutes > 0 
              ? `<span style="color:${lateColor}">+${record.lateMinutes}'${penaltyHtml}</span>` 
              : '<span style="color:var(--success)">0</span>';

            return `
            <tr>
              <td><span style="font-weight:600">${Utils.formatDate(record.date)}</span></td>
              <td>${shift ? shift.name : record.shiftId}</td>
              <td>${record.checkIn || '—'} ${isManual}</td>
              <td style="${!record.checkOut ? 'color:var(--danger);font-weight:600' : ''}">${record.checkOut || '—'}</td>
              <td>${lateHtml}</td>
              <td><span style="font-weight:600">${record.hoursWorked}h</span></td>
              <td>${getStatusBadge(record)}</td>
              <td style="font-size:12px;color:var(--text-muted);max-width:180px">${record.note || '—'}</td>
            </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
    `;
  },

  renderException() {
    const employees = DB.users.filter(user => user.role === 'employee');
    
    // Lịch sử ngoại lệ
    const exceptionsLog = DB.attendance.filter(record => 
      record.checkInType === 'exception' || record.checkOutType === 'exception'
    );

    return `
    <div class="page-header">
      <h1 class="page-title">Check-in ngoại lệ</h1>
      <p class="text-muted fs-13 mt-1">Dành cho trường hợp nhân viên không thể tự check-in (hết pin, mất điện thoại...)</p>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:860px">

      <div class="card">
        <div class="card-header">
          <span class="card-title"><span class="material-icons" style="font-size:18px;vertical-align:-3px;color:var(--brown)">person_add</span> Check-in hộ nhân viên</span>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">Chọn nhân viên <span class="required">*</span></label>
            <select class="form-control" id="exc-employee">
              <option value="">-- Chọn nhân viên --</option>
              ${employees.map(employee => `<option value="${employee.id}">${employee.name}</option>`).join('')}
            </select>
            <div class="form-error" id="err-exc-emp">Vui lòng chọn nhân viên</div>
          </div>
          <div class="form-group">
            <label class="form-label">Ca làm việc <span class="required">*</span></label>
            <select class="form-control" id="exc-shift">
              ${DB.shiftTypes.map(shift => `<option value="${shift.id}">${shift.name} (${shift.start}–${shift.end})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Loại thao tác <span class="required">*</span></label>
            <select class="form-control" id="exc-type">
              <option value="checkin">Check-in hộ</option>
              <option value="checkout">Check-out hộ</option>
              <option value="manual-hours">Cộng giờ thủ công (đến sớm)</option>
            </select>
          </div>
          <div id="exc-manual-hours" style="display:none">
            <div class="form-group">
              <label class="form-label">Số giờ cộng thêm <span class="required">*</span></label>
              <input type="number" class="form-control" id="exc-extra-hours" placeholder="VD: 0.5" min="0.25" max="4" step="0.25">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Lý do / Ghi chú <span class="required">*</span></label>
            <textarea class="form-control" id="exc-note" placeholder="VD: Điện thoại hết pin, hỏng máy..."></textarea>
            <div class="form-error" id="err-exc-note">Vui lòng nhập lý do</div>
          </div>
          <div class="btn-group">
            <button class="btn btn-secondary" id="btn-cancel-exception">Hủy bỏ</button>
            <button class="btn btn-primary" id="btn-save-exception">
              <span class="material-icons">save</span> Xác nhận
            </button>
          </div>
        </div>
      </div>

      <div>
        <div class="card">
          <div class="card-header">
            <span class="card-title">Lịch sử ngoại lệ hôm nay</span>
          </div>
          <div class="card-body" style="padding:12px">
            <div class="timeline">
              ${exceptionsLog.length > 0 ? exceptionsLog.map(record => {
                const employee = Utils.getUserById(record.userId);
                const shift = Utils.getShiftById(record.shiftId);
                return `
                <div class="timeline-item">
                  <div class="timeline-dot success"></div>
                  <div class="timeline-content">
                    <div class="timeline-time">${Utils.formatDate(record.date)} · ${record.checkIn || '—'}</div>
                    <div class="timeline-text"><b>${employee?.name}</b> – ${shift?.name}</div>
                    <div style="font-size:11px;color:var(--text-muted);margin-top:3px">${record.note}</div>
                  </div>
                </div>
                `;
              }).join('') : '<p class="text-muted fs-13">Không có ngoại lệ nào</p>'}
            </div>
          </div>
        </div>

        <div class="alert alert-info mt-3">
          <span class="material-icons">info</span>
          <span>Tính năng "Cộng giờ thủ công" áp dụng khi Trưởng ca gọi nhân viên đến sớm tăng cường. Tất cả thao tác đều được ghi log.</span>
        </div>
      </div>
    </div>
    `;
  },

  bindException() {
    const typeSelect = document.getElementById('exc-type');
    if (typeSelect) {
      typeSelect.addEventListener('change', (e) => this.toggleExcType(e.target.value));
    }

    const saveBtn = document.getElementById('btn-save-exception');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveException());
    }
  },

  toggleExcType(value) {
    const manualHoursBlock = document.getElementById('exc-manual-hours');
    if (manualHoursBlock) {
      manualHoursBlock.style.display = value === 'manual-hours' ? 'block' : 'none';
    }
  },

  saveException() {
    const employeeId = parseInt(document.getElementById('exc-employee').value, 10);
    const noteText = document.getElementById('exc-note').value.trim();
    let isValid = true;

    if (!employeeId) {
      document.getElementById('err-exc-emp').classList.add('show');
      document.getElementById('exc-employee').classList.add('error');
      isValid = false;
    }
    if (!noteText) {
      document.getElementById('err-exc-note').classList.add('show');
      document.getElementById('exc-note').classList.add('error');
      isValid = false;
    }
    if (!isValid) return;

    const shiftId = document.getElementById('exc-shift').value;
    const actionType = document.getElementById('exc-type').value;
    const employeeInfo = Utils.getUserById(employeeId);
    
    const todayStr = new Date().toISOString().split('T')[0];
    const timeNowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    if (actionType === 'manual-hours') {
      const extraHours = parseFloat(document.getElementById('exc-extra-hours').value) || 0;
      Toast.show(`Đã cộng ${extraHours}h cho ${employeeInfo.name} thành công`, 'success');
    } else {
      DB.attendance.push({
        id: DB.nextId(DB.attendance),
        userId: employeeId, 
        date: todayStr, 
        shiftId: shiftId,
        checkIn: actionType === 'checkin' ? timeNowStr : null,
        checkOut: actionType === 'checkout' ? timeNowStr : null,
        checkInType: 'exception',
        checkOutType: actionType === 'checkout' ? 'exception' : null,
        lateMinutes: 0, 
        hoursWorked: 0, 
        status: 'normal',
        note: `Check-in ngoại lệ: ${noteText} – ${DB.session.name} duyệt`
      });
      Toast.show(`Check-in ngoại lệ cho ${employeeInfo.name} thành công`, 'success');
    }

    setTimeout(() => App.navTo('exception-checkin'), 400);
  },

  renderEdit() {
    const flaggedRecords = DB.attendance
      .filter(record => record.status === 'flag' || !record.checkOut)
      .sort((a, b) => b.date.localeCompare(a.date));
      
    const allRecords = [...DB.attendance]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 20);
      
    const auditLogs = DB.attendanceLog;
    const nowTime = new Date();

    const formatTimeValue = (timeStr) => {
      if (!timeStr) return '';
      return timeStr.replace(':', '').padStart(4, '0').replace(/(\d{2})(\d{2})/, '$1:$2');
    };

    return `
    <div class="page-header">
      <h1 class="page-title">Chỉnh sửa chấm công</h1>
      <p class="text-muted fs-13 mt-1">Chỉ được sửa trong vòng 24h kể từ khi ca kết thúc. Mọi thao tác đều được ghi log.</p>
    </div>

    <div class="tabs">
      <button class="tab-btn active" data-target="flagged-tab">
        <span class="material-icons" style="font-size:15px;vertical-align:-2px">flag</span>
        Cần xử lý (${flaggedRecords.length})
      </button>
      <button class="tab-btn" data-target="all-tab">Tất cả</button>
      <button class="tab-btn" data-target="log-tab">Lịch sử chỉnh sửa</button>
    </div>

    <div id="flagged-tab">
      ${flaggedRecords.length === 0 ? '<div class="alert alert-success"><span class="material-icons">check_circle</span><span>Không có bản ghi nào cần xử lý.</span></div>' :
      flaggedRecords.map(record => {
        const employeeInfo = Utils.getUserById(record.userId);
        const shiftInfo = Utils.getShiftById(record.shiftId);
        const recordDate = new Date(record.date);
        
        const hoursAgo = (nowTime - recordDate) / 3600000;
        const isEditable = hoursAgo <= 36; // Cho phép sửa trong 24h + 12h leeway

        return `
        <div class="card mb-3">
          <div class="card-header">
            <div>
              <span style="font-weight:700">${employeeInfo?.name}</span>
              <span class="text-muted fs-13"> · ${Utils.formatDate(record.date)} · ${shiftInfo?.name}</span>
            </div>
            <span class="flag-badge">
              <span class="material-icons" style="font-size:14px">flag</span>
              ${record.status === 'flag' ? 'Thiếu check-out' : 'Ngoại lệ'}
            </span>
          </div>
          <div class="card-body">
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px">
              <div>
                <label class="form-label">Check-in hiện tại</label>
                <input type="time" class="form-control" value="${formatTimeValue(record.checkIn)}"
                  id="edit-ci-${record.id}" ${isEditable ? '' : 'disabled'}>
              </div>
              <div>
                <label class="form-label">Check-out <span class="required">*</span></label>
                <input type="time" class="form-control ${!record.checkOut ? 'error' : ''}" value="${formatTimeValue(record.checkOut)}"
                  id="edit-co-${record.id}" ${isEditable ? '' : 'disabled'}>
              </div>
              <div>
                <label class="form-label">Giờ làm thực tế</label>
                <input type="number" class="form-control" value="${record.hoursWorked}" step="0.5"
                  id="edit-hw-${record.id}" ${isEditable ? '' : 'disabled'}>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Lý do chỉnh sửa <span class="required">*</span></label>
              <input type="text" class="form-control" placeholder="VD: Xác minh camera, nhân viên báo về..."
                id="edit-reason-${record.id}" ${isEditable ? '' : 'disabled'}>
            </div>
            ${isEditable ? `
            <div class="btn-group btn-group-right">
              <button class="btn btn-secondary btn-sm">Bỏ qua</button>
              <button class="btn btn-primary btn-sm btn-save-edit" data-id="${record.id}">
                <span class="material-icons">save</span> Lưu chỉnh sửa
              </button>
            </div>
            ` : `
            <div class="alert alert-warning" style="margin-bottom:0">
              <span class="material-icons">lock</span>
              <span>Đã quá 24h – không thể chỉnh sửa. Liên hệ CEO để reset thủ công.</span>
            </div>
            `}
          </div>
        </div>
        `;
      }).join('')}
    </div>

    <div id="all-tab" style="display:none">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Ngày</th>
              <th>Ca</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Đi muộn</th>
              <th>Giờ làm</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${allRecords.map(record => {
              const employeeInfo = Utils.getUserById(record.userId);
              const shiftInfo = Utils.getShiftById(record.shiftId);
              
              let statusBadge = '<span class="badge badge-success">OK</span>';
              if (record.status === 'flag') statusBadge = '<span class="flag-badge"><span class="material-icons" style="font-size:12px">flag</span>Ngoại lệ</span>';
              else if (record.status === 'late') statusBadge = '<span class="badge badge-warning">Muộn</span>';
              else if (record.status === 'absent') statusBadge = '<span class="badge badge-danger">Vắng</span>';

              const lateHtml = record.lateMinutes > 0 
                ? `<span style="color:${record.lateMinutes >= 15 ? 'var(--danger)' : '#E65100'}">${record.lateMinutes}'</span>` 
                : '0';

              return `
              <tr>
                <td><span class="table-name">${employeeInfo?.name || '—'}</span></td>
                <td>${Utils.formatDate(record.date)}</td>
                <td>${shiftInfo?.name || record.shiftId}</td>
                <td>${record.checkIn || '—'}</td>
                <td style="${!record.checkOut ? 'color:var(--danger);font-weight:600' : ''}">${record.checkOut || 'Thiếu'}</td>
                <td>${lateHtml}</td>
                <td>${record.hoursWorked}h</td>
                <td>${statusBadge}</td>
                <td><button class="btn btn-ghost btn-sm btn-mock-edit" data-id="${record.id}">Sửa</button></td>
              </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div id="log-tab" style="display:none">
      <div class="card">
        <div class="card-header"><span class="card-title">Lịch sử chỉnh sửa (Audit Log)</span></div>
        <div class="card-body">
          ${auditLogs.length === 0 ? '<p class="text-muted">Chưa có thao tác chỉnh sửa nào</p>' :
          auditLogs.map(log => {
            const editorInfo = Utils.getUserById(log.editedBy);
            const employeeInfo = Utils.getUserById(log.userId);
            return `
            <div style="padding:12px;border:1px solid #EBEBEB;border-radius:8px;margin-bottom:8px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <span style="font-size:13px;font-weight:600">${editorInfo?.name} đã sửa chấm công của ${employeeInfo?.name}</span>
                <span style="font-size:11px;color:var(--text-muted)">${log.editedAt}</span>
              </div>
              <div style="font-size:12px;color:var(--text-muted)">
                Trường: <b>${log.field}</b> · Trước: <b style="color:var(--danger)">${log.oldValue || '—'}</b>
                → Sau: <b style="color:var(--success)">${log.newValue}</b>
              </div>
              <div style="font-size:12px;margin-top:4px;color:var(--text-body)">Lý do: ${log.reason}</div>
            </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
    `;
  },

  bindEdit() {
    // Tab switching event binding
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = e.currentTarget.getAttribute('data-target');
        
        ['flagged-tab', 'all-tab', 'log-tab'].forEach(id => {
          const contentEl = document.getElementById(id);
          if (contentEl) {
            contentEl.style.display = id === targetId ? 'block' : 'none';
          }
        });

        tabButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
      });
    });

    // Save Edit event binding
    const saveButtons = document.querySelectorAll('.btn-save-edit');
    saveButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const recordId = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        this.saveEdit(recordId);
      });
    });

    // Mock Edit event binding
    const mockButtons = document.querySelectorAll('.btn-mock-edit');
    mockButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const recordId = e.currentTarget.getAttribute('data-id');
        Toast.show(`Chỉnh sửa bản ghi ID: ${recordId}`, 'success');
      });
    });
  },

  saveEdit(recordId) {
    const timeInEl = document.getElementById(`edit-ci-${recordId}`);
    const timeOutEl = document.getElementById(`edit-co-${recordId}`);
    const hoursWorkedEl = document.getElementById(`edit-hw-${recordId}`);
    const reasonEl = document.getElementById(`edit-reason-${recordId}`);

    if (!reasonEl || !reasonEl.value.trim()) {
      Toast.show('Vui lòng nhập lý do chỉnh sửa', 'danger');
      if (reasonEl) reasonEl.classList.add('error');
      return;
    }

    const attendanceRecord = DB.attendance.find(record => record.id === recordId);
    if (!attendanceRecord) return;

    // Ghi Log lịch sử
    const auditLog = {
      id: DB.nextId(DB.attendanceLog),
      attendanceId: recordId,
      userId: attendanceRecord.userId,
      editedBy: DB.session.id,
      editedAt: new Date().toLocaleString('vi-VN'),
      field: 'checkOut',
      oldValue: attendanceRecord.checkOut,
      newValue: timeOutEl.value,
      reason: reasonEl.value.trim()
    };
    DB.attendanceLog.push(auditLog);

    // Cập nhật record thực tế
    attendanceRecord.checkOut = timeOutEl.value;
    attendanceRecord.hoursWorked = parseFloat(hoursWorkedEl.value) || 0;
    attendanceRecord.status = 'normal';

    Toast.show('Đã lưu chỉnh sửa và ghi log thành công', 'success');
    setTimeout(() => App.navTo('edit-attendance'), 500);
  }
};