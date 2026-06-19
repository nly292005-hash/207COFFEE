'use strict';

/* ============================================================
   DATA.JS – Mock data store for 207 Coffee CofBase MVP
   ============================================================ */

const DB = {
  // Current session
  session: null,

  // Users
  users: [
    {
      id: 1, username: 'ceo', password: '207Coffee@123', defaultPw: false,
      name: 'CEO', role: 'ceo', email: 'ceo@207coffee.vn', phone: '0901234567',
      position: 'Giám đốc', branch: 'all', hourlyRate: 0, createdAt: '2024-01-01'
    },
    {
      id: 2, username: 'truongca1', password: '207Coffee@123', defaultPw: false,
      name: 'Nguyễn Minh Khoa', role: 'leader', email: 'khoa@207coffee.vn', phone: '0912345678',
      position: 'Trưởng ca', branch: 'CS1', hourlyRate: 25000, createdAt: '2024-01-15'
    },
    {
      id: 3, username: 'ketoan', password: '207Coffee@123', defaultPw: false,
      name: 'Trần Thị Lan', role: 'accountant', email: 'lan@207coffee.vn', phone: '0923456789',
      position: 'Kế toán', branch: 'all', hourlyRate: 22000, createdAt: '2024-01-15'
    },
    {
      id: 4, username: 'nv001', password: '207Coffee@123', defaultPw: true,
      name: 'Lê Văn Bình', role: 'employee', email: 'binh@207coffee.vn', phone: '0934567890',
      position: 'Nhân viên', branch: 'CS1', hourlyRate: 20000, createdAt: '2024-03-01'
    },
    {
      id: 5, username: 'nv002', password: '207Coffee@123', defaultPw: false,
      name: 'Phạm Thị Mai', role: 'employee', email: 'mai@207coffee.vn', phone: '0945678901',
      position: 'Nhân viên', branch: 'CS1', hourlyRate: 20000, createdAt: '2024-03-15'
    },
    {
      id: 6, username: 'nv003', password: '207Coffee@123', defaultPw: true,
      name: 'Hoàng Đức Tùng', role: 'employee', email: 'tung@207coffee.vn', phone: '0956789012',
      position: 'Nhân viên', branch: 'CS2', hourlyRate: 18000, createdAt: '2024-04-01'
    },
    {
      id: 7, username: 'nv004', password: '207Coffee@123', defaultPw: true,
      name: 'Nguyễn Thị Hoa', role: 'employee', email: 'hoa@207coffee.vn', phone: '0967890123',
      position: 'Nhân viên', branch: 'CS1', hourlyRate: 19000, createdAt: '2024-04-10'
    },
    {
      id: 8, username: 'truongca2', password: '207Coffee@123', defaultPw: true,
      name: 'Vũ Quang Hùng', role: 'leader', email: 'hung@207coffee.vn', phone: '0978901234',
      position: 'Trưởng ca', branch: 'CS2', hourlyRate: 24000, createdAt: '2024-02-01'
    }
  ],

  // Shifts definition
  shiftTypes: [
    { id: 'S', name: 'Ca Sáng', start: '07:00', end: '12:30', hours: 5.5 },
    { id: 'C', name: 'Ca Chiều', start: '12:30', end: '18:00', hours: 5.5 },
    { id: 'T', name: 'Ca Tối', start: '18:00', end: '23:00', hours: 5 }
  ],

  // Shift registrations (current week 2026)
  shiftRegistrations: [
    // Employee 4 (Bình)
    { id: 1, userId: 4, week: '2026-W24', day: 'Mon', shiftId: 'S', status: 'approved' },
    { id: 2, userId: 4, week: '2026-W24', day: 'Tue', shiftId: 'C', status: 'approved' },
    { id: 3, userId: 4, week: '2026-W24', day: 'Wed', shiftId: 'S', status: 'approved' },
    { id: 4, userId: 4, week: '2026-W24', day: 'Thu', shiftId: 'T', status: 'approved' },
    { id: 5, userId: 4, week: '2026-W24', day: 'Fri', shiftId: 'S', status: 'approved' },
    // Employee 5 (Mai)
    { id: 6, userId: 5, week: '2026-W24', day: 'Mon', shiftId: 'C', status: 'approved' },
    { id: 7, userId: 5, week: '2026-W24', day: 'Tue', shiftId: 'T', status: 'approved' },
    { id: 8, userId: 5, week: '2026-W24', day: 'Wed', shiftId: 'C', status: 'approved' },
    { id: 9, userId: 5, week: '2026-W24', day: 'Thu', shiftId: 'S', status: 'approved' },
    { id: 10, userId: 5, week: '2026-W24', day: 'Sat', shiftId: 'T', status: 'approved' },
    // Employee 7 (Hoa)
    { id: 11, userId: 7, week: '2026-W24', day: 'Mon', shiftId: 'S', status: 'approved' },
    { id: 12, userId: 7, week: '2026-W24', day: 'Tue', shiftId: 'S', status: 'approved' },
    { id: 13, userId: 7, week: '2026-W24', day: 'Thu', shiftId: 'C', status: 'pending' },
    { id: 14, userId: 7, week: '2026-W24', day: 'Fri', shiftId: 'T', status: 'pending' },
    // Next week registrations (pending)
    { id: 15, userId: 4, week: '2026-W25', day: 'Mon', shiftId: 'S', status: 'pending' },
    { id: 16, userId: 4, week: '2026-W25', day: 'Tue', shiftId: 'C', status: 'pending' },
    { id: 17, userId: 5, week: '2026-W25', day: 'Mon', shiftId: 'T', status: 'pending' },
  ],

  // TỰ ĐỘNG SINH DỮ LIỆU: Từ tháng 3 đến tháng 6 (mỗi tháng 10 ngày công)
  attendance: (function() {
    const records = [];
    let recordId = 1;
    const months = [3, 4, 5, 6]; // Tháng 3, 4, 5, 6 năm 2026
    const employeeIds = [2, 3, 4, 5, 6, 7, 8]; // Danh sách ID nhân sự (trừ CEO)

    months.forEach(month => {
      // Mỗi tháng tạo 10 ngày làm việc (từ ngày 01 đến ngày 10)
      for (let day = 1; day <= 10; day++) {
        const monthStr = String(month).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `2026-${monthStr}-${dayStr}`;

        employeeIds.forEach(userId => {
          // Tạo một ít ngẫu nhiên để bảng lương trông thực tế hơn
          // VD: ID 4 thỉnh thoảng đi muộn, ID 7 thỉnh thoảng nghỉ ca
          let isLate = (userId === 4 && day === 5) || (userId === 5 && day === 8);
          let isAbsent = (userId === 7 && day === 3);

          if (!isAbsent) {
            records.push({
              id: recordId++,
              userId: userId,
              date: dateStr,
              shiftId: 'S',
              checkIn: isLate ? '07:15' : '06:55',
              checkOut: '12:30',
              checkInType: 'gps',
              checkOutType: 'gps',
              lateMinutes: isLate ? 15 : 0,
              earlyMinutes: 0,
              hoursWorked: isLate ? 5.25 : 5.5,
              status: isLate ? 'late' : 'normal',
              note: isLate ? 'Kẹt xe' : ''
            });
          }
        });
      }
    });

    // Thêm một ca lỗi (flag) của Khoa (ID 2) vào hôm nay (08/06) để Test UI
    records.push({
      id: recordId++, userId: 2, date: '2026-06-08', shiftId: 'C',
      checkIn: '12:25', checkOut: null, checkInType: 'gps', checkOutType: null,
      lateMinutes: 0, earlyMinutes: 0, hoursWorked: 0, status: 'flag', note: 'Quên check-out'
    });

    return records;
  })(),

  // Audit log for attendance edits
  attendanceLog: [
    {
      id: 1,
      attendanceId: 3,
      userId: 4,
      editedBy: 2,
      editedAt: '2026-06-04 13:30',
      field: 'checkOut',
      oldValue: null,
      newValue: '12:30',
      reason: 'Nhân viên quên check-out, xác minh camera'
    }
  ],

  // POS menu items
  menuItems: [
    { id: 1, name: 'Cà phê Đen', category: 'hot', price: 25000, emoji: '☕' },
    { id: 2, name: 'Cà phê Sữa', category: 'hot', price: 30000, emoji: '☕' },
    { id: 3, name: 'Bạc Xỉu', category: 'hot', price: 32000, emoji: '☕' },
    { id: 4, name: 'Cà phê Đen đá', category: 'cold', price: 25000, emoji: '🧊' },
    { id: 5, name: 'Cà phê Sữa đá', category: 'cold', price: 30000, emoji: '🧊' },
    { id: 6, name: 'Bạc Xỉu đá', category: 'cold', price: 32000, emoji: '🧊' },
    { id: 7, name: 'Trà Đào', category: 'tea', price: 35000, emoji: '🍵' },
    { id: 8, name: 'Trà Vải', category: 'tea', price: 35000, emoji: '🍵' },
    { id: 9, name: 'Trà Sữa Truyền Thống', category: 'tea', price: 40000, emoji: '🧋' },
    { id: 10, name: 'Trà Sữa Matcha', category: 'tea', price: 45000, emoji: '🍵' },
    { id: 11, name: 'Sinh Tố Xoài', category: 'juice', price: 40000, emoji: '🥭' },
    { id: 12, name: 'Sinh Tố Bơ', category: 'juice', price: 45000, emoji: '🥑' },
    { id: 13, name: 'Nước Ép Cam', category: 'juice', price: 38000, emoji: '🍊' },
    { id: 14, name: 'Bánh Mì Trứng', category: 'food', price: 25000, emoji: '🥖' },
    { id: 15, name: 'Bánh Croissant', category: 'food', price: 30000, emoji: '🥐' },
    { id: 16, name: 'Bánh Tiramisu', category: 'food', price: 45000, emoji: '🍰' },
  ],

  // Orders
  orders: [
    {
      id: 1001, date: '2026-06-05', time: '07:42', cashierId: 4,
      items: [
        { menuId: 1, name: 'Cà phê Đen', qty: 2, price: 25000, note: '' },
        { menuId: 3, name: 'Bạc Xỉu', qty: 1, price: 32000, note: 'ít đường' }
      ],
      total: 82000, payMethod: 'cash', status: 'paid'
    },
    {
      id: 1002, date: '2026-06-05', time: '08:15', cashierId: 5,
      items: [
        { menuId: 5, name: 'Cà phê Sữa đá', qty: 3, price: 30000, note: 'ít đá' }
      ],
      total: 90000, payMethod: 'transfer', status: 'paid'
    },
    {
      id: 1003, date: '2026-06-05', time: '09:30', cashierId: 4,
      items: [
        { menuId: 7, name: 'Trà Đào', qty: 2, price: 35000, note: '' },
        { menuId: 15, name: 'Bánh Croissant', qty: 2, price: 30000, note: '' }
      ],
      total: 130000, payMethod: 'cash', status: 'paid'
    },
    {
      id: 1004, date: '2026-06-05', time: '10:00', cashierId: 5,
      items: [
        { menuId: 9, name: 'Trà Sữa Truyền Thống', qty: 4, price: 40000, note: '' }
      ],
      total: 160000, payMethod: 'transfer', status: 'paid'
    },
    {
      id: 1005, date: '2026-06-04', time: '08:20', cashierId: 4,
      items: [
        { menuId: 1, name: 'Cà phê Đen', qty: 5, price: 25000, note: '' }
      ],
      total: 125000, payMethod: 'cash', status: 'paid'
    },
    {
      id: 1006, date: '2026-06-04', time: '14:35', cashierId: 7,
      items: [
        { menuId: 11, name: 'Sinh Tố Xoài', qty: 2, price: 40000, note: '' },
        { menuId: 16, name: 'Bánh Tiramisu', qty: 1, price: 45000, note: '' }
      ],
      total: 125000, payMethod: 'transfer', status: 'paid'
    },
    {
      id: 1007, date: '2026-06-03', time: '09:10', cashierId: 5,
      items: [
        { menuId: 2, name: 'Cà phê Sữa', qty: 3, price: 30000, note: '' }
      ],
      total: 90000, payMethod: 'cash', status: 'paid'
    },
    {
      id: 1008, date: '2026-06-03', time: '19:40', cashierId: 5,
      items: [
        { menuId: 10, name: 'Trà Sữa Matcha', qty: 2, price: 45000, note: '' }
      ],
      total: 90000, payMethod: 'transfer', status: 'paid'
    }
  ],

  // Day reports (end-of-day)
  dayReports: [
    // ── Tháng 6/2026 ──
    {
      id: 1, date: '2026-06-04', shiftId: 'T', leaderId: 2,
      totalOrders: 47, systemRevenue: 4250000, cashSystem: 2100000,
      cashActual: 2050000, cashDiff: -50000, diffReason: 'Thối nhầm khách 1 order',
      rating: 4.3, ratingNote: 'Khách hài lòng, có 1 phản ánh chờ lâu lúc đông',
      incidents: 'Máy POS báo lỗi kết nối 10 phút lúc 20h',
      ingredients: [
        { name: 'Cà phê hạt', status: 'ok' },
        { name: 'Sữa đặc', status: 'low' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-06-04 23:15'
    },
    {
      id: 2, date: '2026-06-03', shiftId: 'T', leaderId: 2,
      totalOrders: 52, systemRevenue: 4850000, cashSystem: 2400000,
      cashActual: 2400000, cashDiff: 0, diffReason: '',
      rating: 4.7, ratingNote: 'Khách hài lòng cao',
      incidents: '',
      ingredients: [
        { name: 'Cà phê hạt', status: 'ok' },
        { name: 'Sữa đặc', status: 'ok' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'low' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-06-03 23:08'
    },
    {
      id: 3, date: '2026-06-02', shiftId: 'S', leaderId: 8,
      totalOrders: 38, systemRevenue: 3620000, cashSystem: 1800000,
      cashActual: 1800000, cashDiff: 0, diffReason: '',
      rating: 4.5, ratingNote: 'Ca sáng ổn định, khách đều',
      incidents: '',
      ingredients: [
        { name: 'Cà phê hạt', status: 'ok' },
        { name: 'Sữa đặc', status: 'ok' },
        { name: 'Đá viên', status: 'low' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-06-02 12:45'
    },
    {
      id: 4, date: '2026-06-01', shiftId: 'C', leaderId: 2,
      totalOrders: 44, systemRevenue: 4100000, cashSystem: 2050000,
      cashActual: 2100000, cashDiff: 50000, diffReason: 'Khách trả thừa, chưa xác định được',
      rating: 4.4, ratingNote: 'Chiều đông khách, phục vụ tốt',
      incidents: '',
      ingredients: [
        { name: 'Cà phê hạt', status: 'ok' },
        { name: 'Sữa đặc', status: 'ok' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'low' },
      ],
      status: 'locked', lockedAt: '2026-06-01 18:10'
    },

    // ── Tháng 5/2026 ──
    {
      id: 5, date: '2026-05-30', shiftId: 'T', leaderId: 8,
      totalOrders: 55, systemRevenue: 5100000, cashSystem: 2550000,
      cashActual: 2550000, cashDiff: 0, diffReason: '',
      rating: 4.8, ratingNote: 'Ca tối đông khách, nhân viên phục vụ xuất sắc',
      incidents: '',
      ingredients: [
        { name: 'Cà phê hạt', status: 'ok' },
        { name: 'Sữa đặc', status: 'ok' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-05-30 23:05'
    },
    {
      id: 6, date: '2026-05-28', shiftId: 'S', leaderId: 2,
      totalOrders: 33, systemRevenue: 3100000, cashSystem: 1550000,
      cashActual: 1500000, cashDiff: -50000, diffReason: 'Thiếu tiền lẻ đầu ca, sẽ bù ca sau',
      rating: 4.1, ratingNote: 'Ca sáng ít khách do trời mưa',
      incidents: 'Trời mưa lớn từ 8h-10h, lượng khách giảm',
      ingredients: [
        { name: 'Cà phê hạt', status: 'ok' },
        { name: 'Sữa đặc', status: 'low' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-05-28 12:50'
    },
    {
      id: 7, date: '2026-05-25', shiftId: 'C', leaderId: 8,
      totalOrders: 49, systemRevenue: 4600000, cashSystem: 2300000,
      cashActual: 2300000, cashDiff: 0, diffReason: '',
      rating: 4.6, ratingNote: 'Cuối tuần đông, phục vụ nhanh',
      incidents: '',
      ingredients: [
        { name: 'Cà phê hạt', status: 'low' },
        { name: 'Sữa đặc', status: 'ok' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-05-25 18:20'
    },
    {
      id: 8, date: '2026-05-20', shiftId: 'T', leaderId: 2,
      totalOrders: 41, systemRevenue: 3900000, cashSystem: 1950000,
      cashActual: 1950000, cashDiff: 0, diffReason: '',
      rating: 4.3, ratingNote: 'Ca bình thường, không có phản ánh',
      incidents: '',
      ingredients: [
        { name: 'Cà phê hạt', status: 'ok' },
        { name: 'Sữa đặc', status: 'ok' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-05-20 23:00'
    },
    {
      id: 9, date: '2026-05-15', shiftId: 'S', leaderId: 8,
      totalOrders: 36, systemRevenue: 3350000, cashSystem: 1675000,
      cashActual: 1675000, cashDiff: 0, diffReason: '',
      rating: 4.4, ratingNote: 'Ca sáng ổn, khách quen nhiều',
      incidents: '',
      ingredients: [
        { name: 'Cà phê hạt', status: 'ok' },
        { name: 'Sữa đặc', status: 'ok' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'low' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-05-15 12:40'
    },
    {
      id: 10, date: '2026-05-10', shiftId: 'C', leaderId: 2,
      totalOrders: 45, systemRevenue: 4200000, cashSystem: 2100000,
      cashActual: 2050000, cashDiff: -50000, diffReason: 'Nhân viên mới thối nhầm',
      rating: 4.2, ratingNote: 'Nhân viên mới cần thêm thời gian thích nghi',
      incidents: 'Nhân viên thử việc lần đầu phục vụ độc lập',
      ingredients: [
        { name: 'Cà phê hạt', status: 'ok' },
        { name: 'Sữa đặc', status: 'ok' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'low' },
      ],
      status: 'locked', lockedAt: '2026-05-10 18:05'
    },
    {
      id: 11, date: '2026-05-05', shiftId: 'T', leaderId: 8,
      totalOrders: 58, systemRevenue: 5400000, cashSystem: 2700000,
      cashActual: 2700000, cashDiff: 0, diffReason: '',
      rating: 4.9, ratingNote: 'Ca tối 30/4 bù - đông khách kỷ lục, team rất cố gắng',
      incidents: '',
      ingredients: [
        { name: 'Cà phê hạt', status: 'low' },
        { name: 'Sữa đặc', status: 'low' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-05-05 23:30'
    },

    // ── Tháng 4/2026 ──
    {
      id: 12, date: '2026-04-28', shiftId: 'S', leaderId: 2,
      totalOrders: 40, systemRevenue: 3750000, cashSystem: 1875000,
      cashActual: 1875000, cashDiff: 0, diffReason: '',
      rating: 4.5, ratingNote: 'Ca sáng cuối tháng bình thường',
      incidents: '',
      ingredients: [
        { name: 'Cà phê hạt', status: 'ok' },
        { name: 'Sữa đặc', status: 'ok' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-04-28 12:35'
    },
    {
      id: 13, date: '2026-04-20', shiftId: 'T', leaderId: 8,
      totalOrders: 46, systemRevenue: 4300000, cashSystem: 2150000,
      cashActual: 2150000, cashDiff: 0, diffReason: '',
      rating: 4.5, ratingNote: 'Ổn định, không sự cố',
      incidents: '',
      ingredients: [
        { name: 'Cà phê hạt', status: 'ok' },
        { name: 'Sữa đặc', status: 'ok' },
        { name: 'Đá viên', status: 'low' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-04-20 23:10'
    },
    {
      id: 14, date: '2026-04-15', shiftId: 'C', leaderId: 2,
      totalOrders: 43, systemRevenue: 4050000, cashSystem: 2025000,
      cashActual: 2025000, cashDiff: 0, diffReason: '',
      rating: 4.3, ratingNote: 'Giữa tháng, lượng khách ổn',
      incidents: '',
      ingredients: [
        { name: 'Cà phê hạt', status: 'ok' },
        { name: 'Sữa đặc', status: 'ok' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-04-15 18:15'
    },
    {
      id: 15, date: '2026-04-08', shiftId: 'S', leaderId: 8,
      totalOrders: 35, systemRevenue: 3280000, cashSystem: 1640000,
      cashActual: 1590000, cashDiff: -50000, diffReason: 'Mất 1 bill do máy in lỗi, đã ghi tay',
      rating: 4.0, ratingNote: 'Máy in hóa đơn gặp sự cố đầu ca',
      incidents: 'Máy in bill hỏng đầu ca, dùng bill tay 2 tiếng',
      ingredients: [
        { name: 'Cà phê hạt', status: 'ok' },
        { name: 'Sữa đặc', status: 'ok' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'low' },
      ],
      status: 'locked', lockedAt: '2026-04-08 12:55'
    },
    {
      id: 16, date: '2026-04-02', shiftId: 'T', leaderId: 2,
      totalOrders: 50, systemRevenue: 4700000, cashSystem: 2350000,
      cashActual: 2350000, cashDiff: 0, diffReason: '',
      rating: 4.6, ratingNote: 'Đầu tháng 4, khách đông hơn dự kiến',
      incidents: '',
      ingredients: [
        { name: 'Cà phê hạt', status: 'ok' },
        { name: 'Sữa đặc', status: 'ok' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-04-02 23:00'
    },

    // ── Tháng 3/2026 ──
    {
      id: 17, date: '2026-03-28', shiftId: 'C', leaderId: 8,
      totalOrders: 42, systemRevenue: 3950000, cashSystem: 1975000,
      cashActual: 1975000, cashDiff: 0, diffReason: '',
      rating: 4.4, ratingNote: 'Cuối tháng 3 ổn định',
      incidents: '',
      ingredients: [
        { name: 'Cà phê hạt', status: 'ok' },
        { name: 'Sữa đặc', status: 'ok' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-03-28 18:20'
    },
    {
      id: 18, date: '2026-03-20', shiftId: 'T', leaderId: 2,
      totalOrders: 39, systemRevenue: 3650000, cashSystem: 1825000,
      cashActual: 1825000, cashDiff: 0, diffReason: '',
      rating: 4.2, ratingNote: 'Ca tối bình thường',
      incidents: '',
      ingredients: [
        { name: 'Cà phê hạt', status: 'ok' },
        { name: 'Sữa đặc', status: 'low' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-03-20 23:05'
    },
    {
      id: 19, date: '2026-03-14', shiftId: 'S', leaderId: 8,
      totalOrders: 31, systemRevenue: 2900000, cashSystem: 1450000,
      cashActual: 1450000, cashDiff: 0, diffReason: '',
      rating: 4.1, ratingNote: 'Ca sáng weekday ít khách',
      incidents: '',
      ingredients: [
        { name: 'Cà phê hạt', status: 'ok' },
        { name: 'Sữa đặc', status: 'ok' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-03-14 12:30'
    },
    {
      id: 20, date: '2026-03-08', shiftId: 'C', leaderId: 2,
      totalOrders: 53, systemRevenue: 4950000, cashSystem: 2475000,
      cashActual: 2475000, cashDiff: 0, diffReason: '',
      rating: 4.7, ratingNote: '8/3 đông khách, team phục vụ tốt, có tặng hoa khách nữ',
      incidents: '',
      ingredients: [
        { name: 'Cà phê hạt', status: 'ok' },
        { name: 'Sữa đặc', status: 'low' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-03-08 18:30'
    },
    {
      id: 21, date: '2026-03-01', shiftId: 'T', leaderId: 8,
      totalOrders: 44, systemRevenue: 4150000, cashSystem: 2075000,
      cashActual: 2075000, cashDiff: 0, diffReason: '',
      rating: 4.4, ratingNote: 'Đầu tháng 3 ổn',
      incidents: '',
      ingredients: [
        { name: 'Cà phê hạt', status: 'ok' },
        { name: 'Sữa đặc', status: 'ok' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-03-01 23:10'
    },

    // ── Tháng 2/2026 ──
    {
      id: 22, date: '2026-02-25', shiftId: 'S', leaderId: 2,
      totalOrders: 29, systemRevenue: 2750000, cashSystem: 1375000,
      cashActual: 1375000, cashDiff: 0, diffReason: '',
      rating: 4.0, ratingNote: 'Sau Tết, khách chưa đông trở lại',
      incidents: '',
      ingredients: [
        { name: 'Cà phê hạt', status: 'ok' },
        { name: 'Sữa đặc', status: 'ok' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-02-25 12:45'
    },
    {
      id: 23, date: '2026-02-18', shiftId: 'C', leaderId: 8,
      totalOrders: 48, systemRevenue: 4500000, cashSystem: 2250000,
      cashActual: 2250000, cashDiff: 0, diffReason: '',
      rating: 4.6, ratingNote: 'Rằm tháng Giêng - khách đông bất ngờ',
      incidents: '',
      ingredients: [
        { name: 'Cà phê hạt', status: 'low' },
        { name: 'Sữa đặc', status: 'ok' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-02-18 18:25'
    },
    {
      id: 24, date: '2026-02-10', shiftId: 'T', leaderId: 2,
      totalOrders: 56, systemRevenue: 5200000, cashSystem: 2600000,
      cashActual: 2600000, cashDiff: 0, diffReason: '',
      rating: 4.8, ratingNote: 'Mùng 1 Tết bù - đông khách, không khí tốt',
      incidents: '',
      ingredients: [
        { name: 'Cà phê hạt', status: 'low' },
        { name: 'Sữa đặc', status: 'low' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-02-10 23:20'
    },
    {
      id: 25, date: '2026-02-05', shiftId: 'S', leaderId: 8,
      totalOrders: 27, systemRevenue: 2550000, cashSystem: 1275000,
      cashActual: 1275000, cashDiff: 0, diffReason: '',
      rating: 3.9, ratingNote: 'Gần Tết, nhiều nhân viên xin nghỉ sớm',
      incidents: 'Thiếu 1 nhân viên do nghỉ phép Tết',
      ingredients: [
        { name: 'Cà phê hạt', status: 'ok' },
        { name: 'Sữa đặc', status: 'ok' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'low' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-02-05 12:40'
    },

    // ── Tháng 1/2026 ──
    {
      id: 26, date: '2026-01-28', shiftId: 'T', leaderId: 2,
      totalOrders: 51, systemRevenue: 4800000, cashSystem: 2400000,
      cashActual: 2400000, cashDiff: 0, diffReason: '',
      rating: 4.6, ratingNote: 'Cuối tháng 1, khách đông chuẩn bị Tết',
      incidents: '',
      ingredients: [
        { name: 'Cà phê hạt', status: 'ok' },
        { name: 'Sữa đặc', status: 'ok' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-01-28 23:15'
    },
    {
      id: 27, date: '2026-01-20', shiftId: 'C', leaderId: 8,
      totalOrders: 46, systemRevenue: 4300000, cashSystem: 2150000,
      cashActual: 2100000, cashDiff: -50000, diffReason: 'Thối nhầm tiền khách lúc đông',
      rating: 4.3, ratingNote: 'Giữa tháng 1 bình thường',
      incidents: '',
      ingredients: [
        { name: 'Cà phê hạt', status: 'ok' },
        { name: 'Sữa đặc', status: 'ok' },
        { name: 'Đá viên', status: 'low' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-01-20 18:20'
    },
    {
      id: 28, date: '2026-01-15', shiftId: 'S', leaderId: 2,
      totalOrders: 37, systemRevenue: 3450000, cashSystem: 1725000,
      cashActual: 1725000, cashDiff: 0, diffReason: '',
      rating: 4.3, ratingNote: 'Ca sáng giữa tháng ổn định',
      incidents: '',
      ingredients: [
        { name: 'Cà phê hạt', status: 'ok' },
        { name: 'Sữa đặc', status: 'ok' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-01-15 12:45'
    },
    {
      id: 29, date: '2026-01-08', shiftId: 'T', leaderId: 8,
      totalOrders: 43, systemRevenue: 4050000, cashSystem: 2025000,
      cashActual: 2025000, cashDiff: 0, diffReason: '',
      rating: 4.4, ratingNote: 'Đầu năm mới 2026, không khí vui vẻ',
      incidents: '',
      ingredients: [
        { name: 'Cà phê hạt', status: 'ok' },
        { name: 'Sữa đặc', status: 'ok' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-01-08 23:00'
    },
    {
      id: 30, date: '2026-01-02', shiftId: 'C', leaderId: 2,
      totalOrders: 60, systemRevenue: 5600000, cashSystem: 2800000,
      cashActual: 2800000, cashDiff: 0, diffReason: '',
      rating: 4.9, ratingNote: 'Ngày 2/1 - khách kỷ lục đầu năm, team làm rất tốt!',
      incidents: '',
      ingredients: [
        { name: 'Cà phê hạt', status: 'low' },
        { name: 'Sữa đặc', status: 'low' },
        { name: 'Đá viên', status: 'ok' },
        { name: 'Trà túi', status: 'ok' },
        { name: 'Đường', status: 'ok' },
      ],
      status: 'locked', lockedAt: '2026-01-02 18:45'
    },
  ],

  // Revenue data for charts
  revenueData: {
    today: {
      labels: ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00'],
      today: [82000, 90000, 130000, 160000, 95000, 210000, 180000, 115000],
      yesterday: [65000, 110000, 95000, 140000, 120000, 190000, 155000, 130000]
    },
    week: {
      labels: ['T2','T3','T4','T5','T6','T7','CN'],
      thisWeek: [3200000, 2800000, 4100000, 3500000, 4600000, 5200000, 2900000],
      lastWeek: [2900000, 3100000, 3800000, 3200000, 4200000, 4900000, 2600000]
    },
    month: {
      labels: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30'],
      values: [3200000,2800000,4100000,3500000,4600000,5200000,2900000,3800000,4200000,4500000,3900000,4100000,3600000,4800000,5100000,4200000,3700000,4900000,5300000,4400000,3800000,4200000,4600000,5000000,4300000,4700000,3900000,4100000,4800000,5200000]
    }
  },

  // Payroll month data (ĐÃ CẬP NHẬT để đồng bộ chuẩn 10 ngày = 55 giờ)
  payrollMonth: {
    month: 5,
    year: 2026,
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    approved: false,
    submittedToManager: false,
    employees: [
      {
        userId: 4, name: 'Lê Văn Bình', position: 'Nhân viên',
        standardHours: 55, workedHours: 54.75,
        lateTimes: 1, lateMinutes: 15,
        penalty: 20000, bonus: 50000,
        hourlyRate: 20000,
        baseWage: 1095000,
        netSalary: 1125000
      },
      {
        userId: 5, name: 'Phạm Thị Mai', position: 'Nhân viên',
        standardHours: 55, workedHours: 54.75,
        lateTimes: 1, lateMinutes: 15,
        penalty: 20000, bonus: 100000,
        hourlyRate: 20000,
        baseWage: 1095000,
        netSalary: 1175000
      },
      {
        userId: 7, name: 'Nguyễn Thị Hoa', position: 'Nhân viên',
        standardHours: 55, workedHours: 49.5, // Vắng 1 ngày
        lateTimes: 0, lateMinutes: 0,
        penalty: 0, bonus: 0,
        hourlyRate: 19000,
        baseWage: 940500,
        netSalary: 940500
      },
      {
        userId: 6, name: 'Hoàng Đức Tùng', position: 'Nhân viên',
        standardHours: 55, workedHours: 55,
        lateTimes: 0, lateMinutes: 0,
        penalty: 0, bonus: 150000,
        hourlyRate: 18000,
        baseWage: 990000,
        netSalary: 1140000
      },
      {
        userId: 2, name: 'Nguyễn Minh Khoa', position: 'Trưởng ca',
        standardHours: 55, workedHours: 55,
        lateTimes: 0, lateMinutes: 0,
        penalty: 0, bonus: 500000,
        hourlyRate: 25000,
        baseWage: 1375000,
        netSalary: 1875000
      },
      {
        userId: 8, name: 'Vũ Quang Hùng', position: 'Trưởng ca',
        standardHours: 55, workedHours: 55,
        lateTimes: 0, lateMinutes: 0,
        penalty: 0, bonus: 400000,
        hourlyRate: 24000,
        baseWage: 1320000,
        netSalary: 1720000
      }
    ]
  },

  // Branches
  branches: [
    { id: 'CS1', name: 'Cơ sở 1 - Nguyễn Huệ' },
    { id: 'CS2', name: 'Cơ sở 2 - Lê Lợi' }
  ],

  // Store coordinates (207 Coffee)
  storeCoords: { lat: 10.7769, lng: 106.7009 }, // Ho Chi Minh City
  allowedRadius: 50, // meters

  // Helper: get next id
  nextId(array) {
    return Math.max(0, ...array.map(item => item.id)) + 1;
  }
};

// Helper functions
const Utils = {
  formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  },

  formatDate(dateString) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  },

  formatTime(timeString) {
    return timeString || '—';
  },

  dayNames: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  dayKeys: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  dayLabels: { Mon: 'Thứ 2', Tue: 'Thứ 3', Wed: 'Thứ 4', Thu: 'Thứ 5', Fri: 'Thứ 6', Sat: 'Thứ 7', Sun: 'CN' },

  getWeekDates(weekOffset = 0) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    
    // Calculate the Monday of the target week
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + weekOffset * 7);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + i);
      dates.push(targetDate);
    }
    return dates;
  },

  getWeekLabel(weekOffset = 0) {
    const dates = this.getWeekDates(weekOffset);
    const formatDayMonth = (dateObj) => `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
    return `${formatDayMonth(dates[0])} – ${formatDayMonth(dates[6])}`;
  },

  isDeadlinePassed() {
    // Deadline: Thursday 20:00 each week
    // Simulate: always return false for demo (deadline not passed)
    return false;
  },

  getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
  },

  avatarColor(userId) {
    const colors = ['#4E342E', '#1565C0', '#2E7D32', '#6A1B9A', '#E65100', '#00838F', '#558B2F'];
    return colors[userId % colors.length];
  },

  getTodayRevenue() {
    // Mock target date for demo (2026-06-05)
    const mockToday = '2026-06-05';
    const todayOrders = DB.orders.filter(order => order.date === mockToday);
    
    return {
      total: todayOrders.reduce((sum, order) => sum + order.total, 0),
      count: todayOrders.length,
      cash: todayOrders.filter(order => order.payMethod === 'cash').reduce((sum, order) => sum + order.total, 0),
      transfer: todayOrders.filter(order => order.payMethod === 'transfer').reduce((sum, order) => sum + order.total, 0)
    };
  },

  getShiftById(shiftId) {
    return DB.shiftTypes.find(shift => shift.id === shiftId);
  },

  getUserById(userId) {
    return DB.users.find(user => user.id === userId);
  },

  getEmployees() {
    return DB.users.filter(user => user.role === 'employee');
  },

  // Calculate distance (Haversine formula)
  calcDistance(lat1, lng1, lat2, lng2) {
    const EARTH_RADIUS = 6371000; // in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) ** 2 + 
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
              
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS * c;
  }
};