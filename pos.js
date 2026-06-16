'use strict';

/* ============================================================
   POS MODULE – Point of Sale
   ============================================================ */

const POSModule = {
  _cart: [],
  _selectedCategory: 'all',
  _payMethod: 'cash',

  render() {
    // Kiểm tra quyền: Chỉ CEO hoặc Trưởng ca (Leader) mới được thêm món
    const isManager = DB.session && (DB.session.role === 'leader' || DB.session.role === 'ceo');

    const categories = [
      { id: 'all', label: 'Tất cả' },
      { id: 'hot', label: 'Cà phê nóng' },
      { id: 'cold', label: 'Cà phê đá' },
      { id: 'tea', label: 'Trà & Trà sữa' },
      { id: 'juice', label: 'Sinh tố' },
      { id: 'food', label: 'Đồ ăn' },
    ];

    return `
    <div class="pos-layout">
      <div class="pos-menu">
        <div class="pos-categories" style="display: flex; gap: 6px; overflow-x: auto;">
          ${categories.map(categoryItem => `
            <button class="pos-cat-btn js-category-btn ${this._selectedCategory === categoryItem.id ? 'active' : ''}"
              data-category="${categoryItem.id}">
              ${categoryItem.label}
            </button>
          `).join('')}
          
          ${isManager ? `
            <button class="pos-cat-btn js-add-new-menu-item" style="border-color:var(--success); color:var(--success); background:var(--success-bg); margin-left:auto;">
              <span class="material-icons" style="font-size:14px; vertical-align:-2px;">add</span> Thêm món
            </button>
          ` : ''}
        </div>

        <div class="pos-items" id="pos-items">
          ${DB.menuItems
            .filter(menuItem => this._selectedCategory === 'all' || menuItem.category === this._selectedCategory)
            .map(menuItem => `
              <div class="pos-item js-add-item" data-id="${menuItem.id}">
                <div class="pos-item-icon">${menuItem.emoji}</div>
                <div class="pos-item-name">${menuItem.name}</div>
                <div class="pos-item-price">${Utils.formatCurrency(menuItem.price)}</div>
              </div>
            `).join('')}
        </div>
      </div>

      <div class="pos-order">
        <div class="pos-order-header">
          <span>
            <span class="material-icons" style="font-size:18px;vertical-align:-3px;color:var(--brown)">receipt</span>
            Đơn hàng
          </span>
          ${this._cart.length > 0 ? `
          <button class="btn btn-ghost btn-sm js-clear-cart" style="color:var(--danger)">
            <span class="material-icons" style="font-size:16px">delete_sweep</span>
            Xóa tất cả
          </button>
          ` : ''}
        </div>

        <div class="pos-order-items" id="pos-order-items">
          ${this._cart.length === 0 ? `
            <div style="text-align:center;padding:40px 20px;color:var(--text-muted)">
              <span class="material-icons" style="font-size:48px;display:block;margin-bottom:8px;opacity:0.3">shopping_cart</span>
              <div style="font-size:13px">Chọn món để thêm vào đơn</div>
            </div>
          ` : this._cart.map((cartItem, index) => `
            <div class="pos-order-item">
              <div style="flex:1">
                <div class="pos-order-item-name">${cartItem.name}</div>
                ${cartItem.note ? `<div class="pos-order-item-note">${cartItem.note}</div>` : ''}
                <div style="font-size:12px;color:var(--text-muted)">${Utils.formatCurrency(cartItem.price)} × ${cartItem.qty} = <b>${Utils.formatCurrency(cartItem.price * cartItem.qty)}</b></div>
              </div>
              <div class="qty-control">
                <button class="qty-btn js-change-qty" data-index="${index}" data-delta="-1">−</button>
                <span class="qty-num">${cartItem.qty}</span>
                <button class="qty-btn js-change-qty" data-index="${index}" data-delta="1">+</button>
              </div>
              <button class="js-remove-item" data-index="${index}" style="background:none;border:none;cursor:pointer;color:var(--danger);padding:4px;margin-left:4px">
                <span class="material-icons" style="font-size:18px">close</span>
              </button>
            </div>
          `).join('')}
        </div>

        ${this._cart.length > 0 ? `
        <div style="padding:8px 10px;border-top:1px solid #EBEBEB">
          <input type="text" class="form-control" id="order-note" placeholder="Ghi chú đơn hàng (tùy chọn): ít đá, ít đường..."
            style="height:36px;font-size:12px">
        </div>
        ` : ''}

        <div class="pos-order-summary">
          <div class="summary-row">
            <span>Số món</span>
            <span>${this._cart.reduce((sum, cartItem) => sum + cartItem.qty, 0)} món</span>
          </div>
          <div class="summary-row">
            <span>Tạm tính</span>
            <span>${Utils.formatCurrency(this._getTotal())}</span>
          </div>
          <div class="summary-row total">
            <span>TỔNG CỘNG</span>
            <span style="color:var(--brown)">${Utils.formatCurrency(this._getTotal())}</span>
          </div>

          <div class="payment-methods">
            <div class="payment-method js-pay-method ${this._payMethod === 'cash' ? 'selected' : ''}" data-method="cash">
              <span class="material-icons" style="display:block;font-size:22px;margin-bottom:4px">payments</span>
              Tiền mặt
            </div>
            <div class="payment-method js-pay-method ${this._payMethod === 'transfer' ? 'selected' : ''}" data-method="transfer">
              <span class="material-icons" style="display:block;font-size:22px;margin-bottom:4px">qr_code</span>
              QR / CK
            </div>
          </div>

          ${this._payMethod === 'transfer' ? `
          <div style="text-align:center;padding:10px;background:#F5F5F5;border-radius:8px;margin-bottom:10px">
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">Mã QR Cửa hàng</div>
            <div style="width:90px;height:90px;margin:0 auto;background:#1A1A1A;border-radius:6px;display:flex;align-items:center;justify-content:center">
              <svg width="70" height="70" viewBox="0 0 70 70" fill="white">
                <rect x="5" y="5" width="25" height="25" fill="white"/>
                <rect x="7" y="7" width="21" height="21" fill="black"/>
                <rect x="10" y="10" width="15" height="15" fill="white"/>
                <rect x="40" y="5" width="25" height="25" fill="white"/>
                <rect x="42" y="7" width="21" height="21" fill="black"/>
                <rect x="45" y="10" width="15" height="15" fill="white"/>
                <rect x="5" y="40" width="25" height="25" fill="white"/>
                <rect x="7" y="42" width="21" height="21" fill="black"/>
                <rect x="10" y="45" width="15" height="15" fill="white"/>
                <rect x="40" y="40" width="5" height="5" fill="white"/>
                <rect x="50" y="40" width="5" height="5" fill="white"/>
                <rect x="60" y="40" width="5" height="5" fill="white"/>
                <rect x="40" y="50" width="10" height="5" fill="white"/>
                <rect x="55" y="50" width="10" height="5" fill="white"/>
                <rect x="40" y="60" width="5" height="5" fill="white"/>
                <rect x="50" y="57" width="5" height="8" fill="white"/>
                <rect x="60" y="55" width="5" height="5" fill="white"/>
              </svg>
            </div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:4px">207 Coffee · MB Bank</div>
          </div>
          ` : ''}

          <button class="btn btn-primary btn-block js-confirm-order" style="height:48px;font-size:16px"
            ${this._cart.length === 0 ? 'disabled' : ''}>
            <span class="material-icons">check_circle</span>
            Xác nhận thanh toán
          </button>
        </div>
      </div>
    </div>
    `;
  },

  bind() {
    window.POSModule = this;

    // Sự kiện thêm món mới (Chỉ áp dụng khi nút được render - quyền Manager)
    const btnAddNew = document.querySelector('.js-add-new-menu-item');
    if (btnAddNew) {
      btnAddNew.addEventListener('click', () => this.showAddItemModal());
    }

    // Sự kiện chuyển danh mục
    document.querySelectorAll('.js-category-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setCategory(e.currentTarget.getAttribute('data-category'));
      });
    });

    // Sự kiện thêm món vào giỏ
    document.querySelectorAll('.js-add-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.addToCart(parseInt(e.currentTarget.getAttribute('data-id'), 10));
      });
    });

    // Sự kiện xóa toàn bộ giỏ
    const clearBtn = document.querySelector('.js-clear-cart');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearCart());
    }

    // Sự kiện tăng/giảm số lượng
    document.querySelectorAll('.js-change-qty').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        const delta = parseInt(e.currentTarget.getAttribute('data-delta'), 10);
        this.changeQty(index, delta);
      });
    });

    // Sự kiện xóa 1 món
    document.querySelectorAll('.js-remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        this.removeItem(index);
      });
    });

    // Sự kiện chọn phương thức thanh toán
    document.querySelectorAll('.js-pay-method').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setPayMethod(e.currentTarget.getAttribute('data-method'));
      });
    });

    // Sự kiện xác nhận đơn hàng
    const confirmBtn = document.querySelector('.js-confirm-order');
    if (confirmBtn && !confirmBtn.disabled) {
      confirmBtn.addEventListener('click', () => this.confirmOrder());
    }
  },

  // ============================================================
  // LOGIC THÊM MÓN MỚI (DÀNH CHO QUẢN LÝ)
  // ============================================================
  showAddItemModal() {
    Modal.show(`
      <div class="modal-header">
        <h3 class="modal-title">Thêm món mới vào Menu</h3>
        <button class="modal-close" id="btn-close-add-item"><span class="material-icons">close</span></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Tên món <span class="required">*</span></label>
          <input type="text" class="form-control" id="new-item-name" placeholder="VD: Cà phê Muối">
        </div>
        <div class="form-group">
          <label class="form-label">Danh mục <span class="required">*</span></label>
          <select class="form-control" id="new-item-category">
            <option value="hot">Cà phê nóng</option>
            <option value="cold">Cà phê đá</option>
            <option value="tea">Trà & Trà sữa</option>
            <option value="juice">Sinh tố</option>
            <option value="food">Đồ ăn</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Giá bán (VNĐ) <span class="required">*</span></label>
          <input type="number" class="form-control" id="new-item-price" placeholder="VD: 35000">
        </div>
        <div class="form-group">
          <label class="form-label">Emoji (Biểu tượng hiển thị)</label>
          <input type="text" class="form-control" id="new-item-emoji" placeholder="VD: ☕">
          <p class="form-hint">Dùng phím Windows + '.' (hoặc Cmd + Ctrl + Space trên Mac) để chèn emoji.</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="btn-cancel-add-item">Hủy</button>
        <button class="btn btn-success" id="btn-confirm-add-item">
          <span class="material-icons">save</span> Lưu món mới
        </button>
      </div>
    `);

    // Gắn sự kiện trong Modal
    document.getElementById('btn-close-add-item')?.addEventListener('click', () => Modal.close());
    document.getElementById('btn-cancel-add-item')?.addEventListener('click', () => Modal.close());
    document.getElementById('btn-confirm-add-item')?.addEventListener('click', () => this.submitNewItem());
  },

  submitNewItem() {
    const name = document.getElementById('new-item-name')?.value.trim();
    const category = document.getElementById('new-item-category')?.value;
    const priceStr = document.getElementById('new-item-price')?.value;
    const price = parseInt(priceStr, 10);
    const emoji = document.getElementById('new-item-emoji')?.value.trim() || '☕'; // Emoji mặc định

    // Validate dữ liệu
    if (!name || !priceStr || isNaN(price) || price < 0) {
      Toast.show('Vui lòng nhập tên món và giá bán hợp lệ!', 'danger');
      return;
    }

    // Thêm món vào DB (Sử dụng hàm Utils hoặc tự động tạo ID)
    const newId = Math.max(0, ...DB.menuItems.map(item => item.id)) + 1;
    DB.menuItems.push({
      id: newId,
      name: name,
      category: category,
      price: price,
      emoji: emoji
    });

    Modal.close();
    Toast.show(`Đã thêm thành công: ${name}`, 'success');

    // Chuyển trang thái Danh mục về danh mục chứa món mới để xem kết quả ngay
    this._selectedCategory = category;
    this._updateOrderPanel();
  },

  // ============================================================
  // LOGIC ĐẶT HÀNG / GIỎ HÀNG
  // ============================================================
  setCategory(category) {
    this._selectedCategory = category;
    this._updateOrderPanel();
  },

  addToCart(menuId) {
    const menuItem = DB.menuItems.find(item => item.id === menuId);
    if (!menuItem) return;

    const existingCartItem = this._cart.find(cartItem => cartItem.menuId === menuId && !cartItem.note);
    if (existingCartItem) {
      existingCartItem.qty++;
    } else {
      this._cart.push({ menuId, name: menuItem.name, price: menuItem.price, qty: 1, note: '' });
    }

    this._updateOrderPanel();
    Toast.show(`Đã thêm: ${menuItem.name}`, 'success');
  },

  changeQty(index, delta) {
    if (!this._cart[index]) return;
    this._cart[index].qty += delta;
    if (this._cart[index].qty <= 0) this._cart.splice(index, 1);
    this._updateOrderPanel();
  },

  removeItem(index) {
    this._cart.splice(index, 1);
    this._updateOrderPanel();
  },

  clearCart() {
    Modal.confirm('Xóa đơn hàng', 'Bạn có chắc muốn xóa toàn bộ đơn hàng hiện tại?', () => {
      this._cart = [];
      this._updateOrderPanel();
    });
  },

  setPayMethod(method) {
    this._payMethod = method;
    this._updateOrderPanel();
  },

  _getTotal() {
    return this._cart.reduce((sum, cartItem) => sum + cartItem.price * cartItem.qty, 0);
  },

  _updateOrderPanel() {
    const container = document.getElementById('page-content');
    if (container) {
      container.innerHTML = this.render();
      this.bind();
    }
  },

  confirmOrder() {
    if (this._cart.length === 0) return;

    const note = document.getElementById('order-note')?.value || '';
    const total = this._getTotal();
    const totalItems = this._cart.reduce((sum, cartItem) => sum + cartItem.qty, 0);

    Modal.confirm(
      'Xác nhận thanh toán',
      `Tổng cộng: <b style="font-size:18px;color:var(--brown)">${Utils.formatCurrency(total)}</b><br>
      Phương thức: <b>${this._payMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản/QR'}</b><br>
      Số món: <b>${totalItems} món</b>`,
      () => {
        // Cập nhật ngày chốt đơn thành 2026-06-08 theo định dạng dự án
        const now = new Date();
        DB.orders.push({
          id: DB.nextId(DB.orders),
          date: '2026-06-08',
          time: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          cashierId: DB.session.id,
          items: [...this._cart],
          total,
          payMethod: this._payMethod,
          note,
          status: 'paid'
        });

        // Show success overlay
        const overlay = document.createElement('div');
        overlay.className = 'success-overlay';
        overlay.innerHTML = `
          <div class="success-overlay-content">
            <span class="material-icons">check_circle</span>
            <h2>Đơn hàng thành công!</h2>
            <p style="margin-top:8px;font-size:18px;opacity:0.9">${Utils.formatCurrency(total)}</p>
            <p style="font-size:14px;opacity:0.75;margin-top:4px">${this._payMethod === 'cash' ? 'Tiền mặt' : 'QR / Chuyển khoản'}</p>
          </div>
        `;
        document.body.appendChild(overlay);

        // Auto-reset after 2 seconds
        setTimeout(() => {
          overlay.remove();
          this._cart = [];
          this._payMethod = 'cash';
          this._selectedCategory = 'all';
          App.navTo('pos');
        }, 2000);
      },
      null, 'Xác nhận', 'btn-success'
    );
  }
};