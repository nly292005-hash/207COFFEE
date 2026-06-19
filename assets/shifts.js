'use strict';

/* ============================================================
   SHIFTS MODULE – Registration, Schedule, Approval
   ============================================================ */

const ShiftsModule = {
  _weekOffset: 0,
  _nextWeekOffset: 1,
  
  // Biến trạng thái để theo dõi tuần đang xem trong mục Lịch làm việc
  _scheduleWeekOffset: 0, 

  // ============================================================
  // 1. ĐĂNG KÝ CA LÀM VIỆC (Dành cho nhân viên)
  // ============================================================
  renderRegister() {
    const user = DB.session;
    const isDeadlinePassed = Utils.isDeadlinePassed();
    const weekDates = Utils.getWeekDates(1); // Next week
    const weekLabel = Utils.getWeekLabel(1);

    // Lọc các ca nhân viên đã đăng ký cho tuần tới (2026)
    const myRegistrations = DB.shiftRegistrations.filter(registration =>
      registration.userId === user.id && registration.week === '2026-W25'
    );

    const dayKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayLabels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

    return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Đăng ký ca làm việc</h1>
        <p class="text-muted fs-13 mt-1">Tuần tiếp theo: <b>${weekLabel}</b></p>
      </div>
      <div class="page-header-right">
        <div class="badge ${isDeadlinePassed ? 'badge-danger' : 'badge-warning'}" style="padding:6px 12px;font-size:12px">
          <span class="material-icons" style="font-size:14px">schedule</span>
          Hạn đăng ký: Thứ 5 tuần này – 20:00
        </div>
      </div>
    </div>

    ${isDeadlinePassed ? `
    <div class="alert alert-danger">
      <span class="material-icons">block</span>
      <span>Đã qua hạn đăng ký (Thứ 5 – 20:00). Vui lòng liên hệ Trưởng ca để điều chỉnh.</span>
    </div>
    ` : `
    <div class="alert alert-info">
      <span class="material-icons">info</span>
      <span>Chọn ca bạn muốn làm cho tuần tới. Bạn có thể chọn nhiều ca trong 1 ngày. Sau khi Trưởng ca duyệt, lịch sẽ được chốt. Hạn chót: <b>20:00 Thứ 5 hàng tuần</b>.</span>
    </div>
    `}

    <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap">
      ${DB.shiftTypes.map(shift => `
        <div style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600">
          <div class="shift-chip ${shift.id === 'S' ? 'morning' : shift.id === 'C' ? 'afternoon' : 'evening'}">${shift.name}</div>
          <span class="text-muted">${shift.start}–${shift.end}</span>
        </div>
      `).join('')}
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Chọn ca làm việc</span>
        <span class="text-muted fs-13">${myRegistrations.length} ca đã đăng ký</span>
      </div>
      <div class="card-body" style="padding:16px">
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:10px">
          ${dayKeys.map((day, i) => {
            const date = weekDates[i];
            const dateStr = `${date.getDate()}/${date.getMonth() + 1}`;
            
            // Lọc TẤT CẢ các ca đã đăng ký trong ngày này (cho phép mảng nhiều phần tử)
            const dayRegs = myRegistrations.filter(reg => reg.day === day);
            const hasReg = dayRegs.length > 0;

            return `
            <div style="border:1.5px solid ${hasReg ? 'var(--brown)' : '#EBEBEB'};border-radius:10px;overflow:hidden;${isDeadlinePassed ? 'opacity:0.6' : ''}">
              <div style="background:${hasReg ? 'var(--brown)' : '#FAFAFA'};padding:8px;text-align:center;border-bottom:1px solid #EBEBEB">
                <div style="font-size:11px;font-weight:600;color:${hasReg ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)'}">
                  ${dayLabels[i]}
                </div>
                <div style="font-size:16px;font-weight:700;color:${hasReg ? 'white' : 'var(--text-primary)'}">
                  ${dateStr}
                </div>
              </div>
              <div style="padding:8px;display:flex;flex-direction:column;gap:5px">
                ${DB.shiftTypes.map(shiftType => {
                  // Kiểm tra xem ca hiện tại có nằm trong mảng các ca đã chọn của ngày này không
                  const isSelected = dayRegs.some(reg => reg.shiftId === shiftType.id);
                  return `
                  <button
                    class="shift-chip btn-toggle-shift ${shiftType.id === 'S' ? 'morning' : shiftType.id === 'C' ? 'afternoon' : 'evening'} ${isSelected ? 'active' : ''}"
                    data-day="${day}"
                    data-shift="${shiftType.id}"
                    style="cursor:${isDeadlinePassed ? 'not-allowed' : 'pointer'};width:100%;text-align:center;opacity:${isSelected ? '1' : '0.5'};border-width:${isSelected ? '2px' : '1px'}"
                    ${isDeadlinePassed ? 'disabled' : ''}
                  >
                    ${shiftType.id === 'S' ? 'Sáng' : shiftType.id === 'C' ? 'Chiều' : 'Tối'}
                    ${isSelected ? '<span class="material-icons" style="font-size:12px;vertical-align:-2px">check</span>' : ''}
                  </button>
                  `;
                }).join('')}
              </div>
              ${dayRegs.some(r => r.status === 'pending') ? `
                <div style="padding:4px 8px;background:var(--warning-bg);text-align:center">
                  <span style="font-size:10px;font-weight:600;color:#E65100">Chờ duyệt</span>
                </div>
              ` : dayRegs.some(r => r.status === 'approved') ? `
                <div style="padding:4px 8px;background:var(--success-bg);text-align:center">
                  <span style="font-size:10px;font-weight:600;color:var(--success)">Đã duyệt ✓</span>
                </div>
              ` : ''}
            </div>
            `;
          }).join('')}
        </div>
      </div>
      ${!isDeadlinePassed ? `
      <div class="card-footer">
        <button class="btn btn-secondary">Xóa tất cả</button>
        <button class="btn btn-primary" id="btn-submit-registration">
          <span class="material-icons">send</span>
          Gửi đăng ký
        </button>
      </div>
      ` : ''}
    </div>

    <h3 class="section-title mt-4">Lịch tuần này đã được duyệt</h3>
    <div class="card">
      <div class="card-body">
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px">
          ${dayKeys.map((day, i) => {
            // Lấy tất cả các ca đã duyệt trong ngày (hỗ trợ nhiều ca)
            const approvedDayRegs = DB.shiftRegistrations.filter(r =>
              r.userId === user.id && r.week === '2026-W24' && r.day === day && r.status === 'approved'
            );
            
            return `
            <div style="text-align:center;padding:8px">
              <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">${dayLabels[i]}</div>
              ${approvedDayRegs.length > 0 ? approvedDayRegs.map(reg => {
                const shift = Utils.getShiftById(reg.shiftId);
                return `
                  <div class="shift-chip ${shift.id === 'S' ? 'morning' : shift.id === 'C' ? 'afternoon' : 'evening'}" style="text-align:center; margin-bottom:4px;">
                    ${shift.name.replace('Ca ', '')}<br>
                    <span style="font-size:10px;font-weight:400">${shift.start}–${shift.end}</span>
                  </div>
                `;
              }).join('') : `<span style="font-size:12px;color:var(--disabled)">–</span>`}
            </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
    `;
  },

  bindRegister() {
    const shiftButtons = document.querySelectorAll('.btn-toggle-shift');
    shiftButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const day = e.currentTarget.getAttribute('data-day');
        const shiftId = e.currentTarget.getAttribute('data-shift');
        this.toggleShift(day, shiftId);
      });
    });

    const submitBtn = document.getElementById('btn-submit-registration');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.submitRegistration());
    }
  },

  toggleShift(day, shiftId) {
    const user = DB.session;
    
    // Sửa lại: Tìm chính xác ca (shiftId) trong ngày (day)
    const existing = DB.shiftRegistrations.find(reg =>
      reg.userId === user.id && reg.week === '2026-W25' && reg.day === day && reg.shiftId === shiftId
    );

    if (existing) {
      // Nếu đã chọn rồi thì xóa đi (Bỏ chọn)
      const idx = DB.shiftRegistrations.indexOf(existing);
      DB.shiftRegistrations.splice(idx, 1);
    } else {
      // Nếu chưa chọn thì thêm mới (Cho phép chọn thêm ca khác cùng ngày)
      DB.shiftRegistrations.push({
        id: DB.nextId(DB.shiftRegistrations),
        userId: user.id, week: '2026-W25', day, shiftId, status: 'pending'
      });
    }
    
    // Dùng renderView để update UI mượt mà, không bị giật trang
    App.renderView('shift-register');
  },

  submitRegistration() {
    const user = DB.session;
    const userRegistrations = DB.shiftRegistrations.filter(reg => reg.userId === user.id && reg.week === '2026-W25');

    if (userRegistrations.length === 0) {
      Toast.show('Vui lòng chọn ít nhất 1 ca trước khi gửi', 'warning');
      return;
    }

    Modal.confirm(
      'Gửi đăng ký ca',
      `Bạn đã đăng ký <b>${userRegistrations.length} ca</b> cho tuần tới. Xác nhận gửi lên Trưởng ca?`,
      () => {
        Toast.show(`Đã gửi đăng ký ${userRegistrations.length} ca thành công. Chờ Trưởng ca duyệt.`, 'success');
        setTimeout(() => App.renderView('shift-register'), 500);
      }
    );
  },

  // ============================================================
  // 2. XEM LỊCH LÀM VIỆC TỔNG HỢP (Năm 2026 & Có Random Data)
  // ============================================================
  renderSchedule() {
    const dayKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    
    // Lấy dữ liệu ngày tháng theo Offset của nút điều hướng
    const weekDates = Utils.getWeekDates(this._scheduleWeekOffset);
    const weekLabel = Utils.getWeekLabel(this._scheduleWeekOffset);
    const targetWeekStr = `2026-W${24 + this._scheduleWeekOffset}`; // Baseline tuần hiện tại là 24 của năm 2026

    const employees = DB.users.filter(user => user.role === 'employee' || user.role === 'leader');

    // 👉 CHỐT CHẶN THỜI GIAN (Cut-off Date)
    const cutoffDate = new Date(2026, 5, 14); // 14/06/2026
    const currentWeekMonday = weekDates[0];
    const isFutureWeek = currentWeekMonday > cutoffDate;

    // ĐOẠN CODE "ĐIỀN BỪA"
    const currentWeekRegs = DB.shiftRegistrations.filter(r => r.week === targetWeekStr);
    
    if (currentWeekRegs.length === 0 && employees.length > 0 && !isFutureWeek) {
      dayKeys.forEach(day => {
        DB.shiftTypes.forEach(shift => {
          const numPeople = Math.floor(Math.random() * 3) + 1; 
          const shuffledEmployees = [...employees].sort(() => 0.5 - Math.random());
          
          for (let i = 0; i < numPeople; i++) {
            if (shuffledEmployees[i]) {
              DB.shiftRegistrations.push({
                id: Math.floor(Math.random() * 1000000),
                userId: shuffledEmployees[i].id,
                week: targetWeekStr,
                day: day,
                shiftId: shift.id,
                status: 'approved'
              });
            }
          }
        });
      });
    }

    const countForDayShift = (day, shiftId) => {
      return DB.shiftRegistrations.filter(reg =>
        reg.day === day && 
        reg.shiftId === shiftId && 
        reg.week === targetWeekStr && 
        reg.status === 'approved'
      ).length;
    };

    return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Lịch làm việc tổng hợp</h1>
        <p class="text-muted fs-13 mt-1">Tuần: ${weekLabel} (${targetWeekStr})</p>
      </div>
      <div class="page-header-right">
        
        <div style="display:flex;align-items:center;background:white;border:1px solid #EBEBEB;border-radius:6px;margin-right:12px">
          <button class="btn btn-ghost btn-sm" id="btn-prev-week" style="border-right:1px solid #EBEBEB;border-radius:6px 0 0 6px">
            <span class="material-icons">chevron_left</span>
          </button>
          <span style="font-size:13px;font-weight:600;min-width:140px;text-align:center;color:var(--brown)">
            ${weekLabel}
          </span>
          <button class="btn btn-ghost btn-sm" id="btn-next-week" style="border-left:1px solid #EBEBEB;border-radius:0 6px 6px 0">
            <span class="material-icons">chevron_right</span>
          </button>
        </div>

        <button class="btn btn-primary btn-sm">
          <span class="material-icons">download</span> Xuất lịch
        </button>
      </div>
    </div>

    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
      ${employees.map(employee => `
        <div style="display:flex;align-items:center;gap:6px;font-size:12px">
          <div style="width:20px;height:20px;border-radius:50%;background:${Utils.avatarColor(employee.id)};display:flex;align-items:center;justify-content:center;color:white;font-size:9px;font-weight:700">
            ${Utils.getInitials(employee.name)}
          </div>
          <span>${employee.name}</span>
        </div>
      `).join('')}
    </div>

    <div class="table-wrapper" style="margin-bottom:16px">
      <table>
        <thead>
          <tr>
            <th style="width:100px">Ca</th>
            ${dayKeys.map((day, i) => `
              <th style="text-align:center">
                ${dayLabels[i]}<br>
                <span style="font-size:10px;font-weight:400;color:var(--text-muted)">${weekDates[i].getDate()}/${weekDates[i].getMonth() + 1}</span>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          ${DB.shiftTypes.map(shiftType => `
            <tr>
              <td>
                <div class="shift-chip ${shiftType.id === 'S' ? 'morning' : shiftType.id === 'C' ? 'afternoon' : 'evening'}" style="white-space:nowrap">
                  ${shiftType.name}<br><span style="font-weight:400;font-size:10px">${shiftType.start}–${shiftType.end}</span>
                </div>
              </td>
              ${dayKeys.map(day => {
                const count = countForDayShift(day, shiftType.id);
                const approvedRegs = DB.shiftRegistrations.filter(reg =>
                  reg.day === day && reg.shiftId === shiftType.id && reg.week === targetWeekStr && reg.status === 'approved'
                );
                const isWarning = count > 0 && count < 2;
                return `
                <td style="text-align:center;padding:8px;background:${isWarning ? 'var(--warning-bg)' : 'white'}">
                  ${count === 0 ? '<span style="font-size:11px;color:var(--disabled)">—</span>' : `
                    <div>
                      ${isWarning ? '<div style="font-size:10px;color:#E65100;font-weight:600;margin-bottom:4px">⚠ Thiếu người</div>' : ''}
                      ${approvedRegs.map(reg => {
                        const employeeInfo = Utils.getUserById(reg.userId);
                        return `<div style="display:flex;align-items:center;gap:4px;margin-bottom:3px;font-size:11px">
                          <div style="width:16px;height:16px;border-radius:50%;background:${Utils.avatarColor(reg.userId)};color:white;font-size:8px;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0">
                            ${Utils.getInitials(employeeInfo?.name)}
                          </div>
                          ${employeeInfo?.name?.split(' ').pop()}
                        </div>`;
                      }).join('')}
                      <div style="font-size:10px;color:var(--text-muted);margin-top:3px">${count} người</div>
                    </div>
                  `}
                </td>
                `;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="alert alert-warning">
      <span class="material-icons">warning</span>
      <span>Các ô màu vàng cảnh báo ca có <b>dưới 2 người</b>. Trưởng ca vẫn có thể lưu lịch – hệ thống không chặn.</span>
    </div>
    `;
  },

  bindSchedule() {
    const btnPrevWeek = document.getElementById('btn-prev-week');
    if (btnPrevWeek) {
      btnPrevWeek.addEventListener('click', () => {
        this._scheduleWeekOffset -= 1;
        App.renderView('shift-schedule');
      });
    }

    const btnNextWeek = document.getElementById('btn-next-week');
    if (btnNextWeek) {
      btnNextWeek.addEventListener('click', () => {
        this._scheduleWeekOffset += 1;
        App.renderView('shift-schedule');
      });
    }
  },

  // ============================================================
  // 3. DUYỆT & ĐIỀU PHỐI CA LÀM VIỆC
  // ============================================================
  renderApprove() {
    const pendingRegistrations = DB.shiftRegistrations.filter(reg => reg.status === 'pending');
    const dayLabels = { Mon: 'T2', Tue: 'T3', Wed: 'T4', Thu: 'T5', Fri: 'T6', Sat: 'T7', Sun: 'CN' };

    // Group by user
    const groupedByUser = {};
    pendingRegistrations.forEach(reg => {
      if (!groupedByUser[reg.userId]) groupedByUser[reg.userId] = [];
      groupedByUser[reg.userId].push(reg);
    });

    return `
    <div class="page-header">
      <h1 class="page-title">Duyệt & Điều phối ca</h1>
      <p class="text-muted fs-13 mt-1">${pendingRegistrations.length} đăng ký chờ duyệt</p>
    </div>

    ${Object.keys(groupedByUser).length === 0 ? `
      <div class="alert alert-success">
        <span class="material-icons">check_circle</span>
        <span>Tất cả đăng ký đã được xử lý.</span>
      </div>
    ` : Object.entries(groupedByUser).map(([userId, regs]) => {
      const employee = Utils.getUserById(parseInt(userId, 10));
      const weekLabelStr = regs[0]?.week || '';

      return `
      <div class="card mb-3">
        <div class="card-header">
          <div style="display:flex;align-items:center;gap:10px">
            <div class="topbar-avatar" style="background:${Utils.avatarColor(parseInt(userId, 10))}">
              ${Utils.getInitials(employee?.name)}
            </div>
            <div>
              <div style="font-weight:700">${employee?.name}</div>
              <div style="font-size:12px;color:var(--text-muted)">${employee?.position} · Tuần ${weekLabelStr}</div>
            </div>
          </div>
          <div class="btn-group">
            <button class="btn btn-secondary btn-sm btn-reject-all" data-userid="${userId}">Từ chối tất cả</button>
            <button class="btn btn-success btn-sm btn-approve-all" data-userid="${userId}">
              <span class="material-icons">done_all</span> Duyệt tất cả
            </button>
          </div>
        </div>
        <div class="card-body">
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${regs.map(reg => {
              const shift = Utils.getShiftById(reg.shiftId);
              const approvedInSameShift = DB.shiftRegistrations.filter(x =>
                x.day === reg.day && x.shiftId === reg.shiftId && x.week === reg.week && x.status === 'approved'
              );
              const willBeUnderstaffed = approvedInSameShift.length < 1; 

              return `
              <div style="border:1.5px solid #EBEBEB;border-radius:8px;padding:12px;min-width:120px;position:relative">
                <div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:6px">${dayLabels[reg.day]}</div>
                <div class="shift-chip ${reg.shiftId === 'S' ? 'morning' : reg.shiftId === 'C' ? 'afternoon' : 'evening'}" style="margin-bottom:8px">
                  ${shift?.name}
                </div>
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:10px">${shift?.start}–${shift?.end}</div>
                ${willBeUnderstaffed ? `
                  <div style="font-size:10px;color:#E65100;font-weight:600;margin-bottom:6px">⚠ Ca sẽ < 2 người</div>
                ` : ''}
                <div style="display:flex;gap:4px">
                  <button class="btn btn-ghost btn-sm btn-reject-one" data-regid="${reg.id}" style="padding:0 8px;height:26px;color:var(--danger);border-color:var(--danger)">
                    <span class="material-icons" style="font-size:14px">close</span>
                  </button>
                  <button class="btn btn-success btn-sm btn-approve-one" data-regid="${reg.id}" style="padding:0 8px;height:26px">
                    <span class="material-icons" style="font-size:14px">check</span>
                  </button>
                </div>
              </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
      `;
    }).join('')}

    <div class="card">
      <div class="card-header">
        <span class="card-title">Điều phối / Đổi ca thủ công</span>
        <span class="text-muted fs-13">Chỉ Trưởng ca / Quản lý mới có quyền</span>
      </div>
      <div class="card-body">
        <p class="text-muted fs-13" style="margin-bottom:12px">
          Nhân viên không thể tự đổi ca sau khi lịch đã duyệt. Trưởng ca xử lý tại đây.
        </p>
        <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr auto;gap:10px;align-items:end">
          <div class="form-group" style="margin:0">
            <label class="form-label">Nhân viên</label>
            <select class="form-control" id="swap-emp">
              ${DB.users.filter(u => u.role === 'employee' || u.role === 'leader').map(employee => `<option value="${employee.id}">${employee.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin:0">
            <label class="form-label">Ngày (Thứ)</label>
            <select class="form-control" id="swap-day">
              <option value="Mon">Thứ 2</option>
              <option value="Tue">Thứ 3</option>
              <option value="Wed">Thứ 4</option>
              <option value="Thu">Thứ 5</option>
              <option value="Fri">Thứ 6</option>
              <option value="Sat">Thứ 7</option>
              <option value="Sun">CN</option>
            </select>
          </div>
          <div class="form-group" style="margin:0">
            <label class="form-label">Từ ca</label>
            <select class="form-control" id="swap-from">
              ${DB.shiftTypes.map(shiftType => `<option value="${shiftType.id}">${shiftType.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin:0">
            <label class="form-label">Sang ca</label>
            <select class="form-control" id="swap-to">
              ${DB.shiftTypes.map(shiftType => `<option value="${shiftType.id}">${shiftType.name}</option>`).join('')}
            </select>
          </div>
          <button class="btn btn-primary" id="btn-swap-shift">
            <span class="material-icons">swap_horiz</span> Đổi ca
          </button>
        </div>
      </div>
    </div>
    `;
  },

  bindApprove() {
    document.querySelectorAll('.btn-reject-all').forEach(btn => {
      btn.addEventListener('click', (e) => this.rejectAll(e.currentTarget.getAttribute('data-userid')));
    });

    document.querySelectorAll('.btn-approve-all').forEach(btn => {
      btn.addEventListener('click', (e) => this.approveAll(e.currentTarget.getAttribute('data-userid')));
    });

    document.querySelectorAll('.btn-reject-one').forEach(btn => {
      btn.addEventListener('click', (e) => this.rejectOne(parseInt(e.currentTarget.getAttribute('data-regid'), 10)));
    });

    document.querySelectorAll('.btn-approve-one').forEach(btn => {
      btn.addEventListener('click', (e) => this.approveOne(parseInt(e.currentTarget.getAttribute('data-regid'), 10)));
    });

    const btnSwap = document.getElementById('btn-swap-shift');
    if (btnSwap) {
      btnSwap.addEventListener('click', () => this.swapShift());
    }
  },

  swapShift() {
    const empId = parseInt(document.getElementById('swap-emp').value, 10);
    const day = document.getElementById('swap-day').value;
    const fromShiftId = document.getElementById('swap-from').value;
    const toShiftId = document.getElementById('swap-to').value;

    if (fromShiftId === toShiftId) {
      Toast.show('Ca đổi sang phải khác ca hiện tại', 'warning');
      return;
    }

    // Tìm lịch gốc của nhân viên đã được duyệt
    const reg = DB.shiftRegistrations.find(r => 
      r.userId === empId && 
      r.day === day && 
      r.shiftId === fromShiftId && 
      r.status === 'approved'
    );

    if (!reg) {
      Toast.show('Không tìm thấy lịch làm ở ca gốc để tiến hành đổi!', 'danger');
      return;
    }

    // Kiểm tra nhân viên có bị trùng lịch ở ca mới không
    const existingTarget = DB.shiftRegistrations.find(r => 
      r.userId === empId && 
      r.day === day && 
      r.shiftId === toShiftId &&
      r.week === reg.week
    );

    if (existingTarget) {
      Toast.show('Nhân viên đã có lịch làm ở ca đích, không thể đổi trùng!', 'warning');
      return;
    }

    // Thực hiện đổi ca
    reg.shiftId = toShiftId;
    Toast.show(`Đã đổi lịch thành công! Bạn có thể qua "Lịch làm việc" để kiểm tra.`, 'success');
    
    setTimeout(() => App.renderView('shift-approve'), 600);
  },

  approveOne(registrationId) {
    const reg = DB.shiftRegistrations.find(r => r.id === registrationId);
    if (reg) {
      reg.status = 'approved';
      const shiftInfo = Utils.getShiftById(reg.shiftId);

      const approvedCount = DB.shiftRegistrations.filter(r =>
        r.day === reg.day && r.shiftId === reg.shiftId && r.week === reg.week && r.status === 'approved'
      ).length;

      if (approvedCount < 2) {
        Toast.show(`⚠ Cảnh báo: Ca ${shiftInfo.name} hiện có ${approvedCount} người (dưới 2)`, 'warning');
      } else {
        Toast.show('Đã duyệt ca thành công', 'success');
      }
      setTimeout(() => App.renderView('shift-approve'), 300);
    }
  },

  rejectOne(registrationId) {
    const reg = DB.shiftRegistrations.find(r => r.id === registrationId);
    if (reg) {
      const idx = DB.shiftRegistrations.indexOf(reg);
      DB.shiftRegistrations.splice(idx, 1);
      Toast.show('Đã từ chối đăng ký ca', 'warning');
      setTimeout(() => App.renderView('shift-approve'), 300);
    }
  },

  approveAll(userId) {
    const regsToApprove = DB.shiftRegistrations.filter(r => r.userId === parseInt(userId, 10) && r.status === 'pending');
    regsToApprove.forEach(r => r.status = 'approved');
    Toast.show(`Đã duyệt ${regsToApprove.length} ca cho nhân viên`, 'success');
    setTimeout(() => App.renderView('shift-approve'), 400);
  },

  rejectAll(userId) {
    Modal.confirm('Từ chối tất cả', 'Bạn có chắc muốn từ chối tất cả đăng ký ca của nhân viên này?', () => {
      const regsToRemove = DB.shiftRegistrations.filter(r => r.userId === parseInt(userId, 10) && r.status === 'pending');
      regsToRemove.forEach(r => {
        const idx = DB.shiftRegistrations.indexOf(r);
        if (idx > -1) DB.shiftRegistrations.splice(idx, 1);
      });
      Toast.show('Đã từ chối tất cả đăng ký', 'warning');
      setTimeout(() => App.renderView('shift-approve'), 400);
    });
  }
};