// ============================================
// Sahabat Baju — JavaScript (7 Konsep JS)
//  Variable   Function   DOM Manipulation
//  Event Handling   Array Methods
//  Conditional   Object & JSON
// ============================================

// ===  VARIABLE ===
const HARGA = 20000; // harga per keranjang
let orders = JSON.parse(localStorage.getItem('orders')) || []; //  JSON //mengubah string JSON menjadi objek JavaScript asli


// === 2. FUNCTION ===
function formatRupiah(num) {
  return 'Rp' + num.toLocaleString('id-ID');
}

// ===  DOM MANIPULATIONN &  EVENT HANDLINGGG ===

// --- FORM (order.html) ---
const form = document.getElementById('orderForm');

if (form) {
  // Live preview harga
  const jumlahInput = document.getElementById('jumlah');
  const previewEl = document.getElementById('previewAmount');

  // 4. Event - input
  jumlahInput.addEventListener('input', function () {
    const qty = parseInt(jumlahInput.value) || 0;
    previewEl.textContent = formatRupiah(qty * HARGA);
  });

  let currentIdTransaksi = null;
  let currentTanggalPesanan = null;

  // Cek edit mode
  let editIndex = localStorage.getItem('editIndex');
  if (editIndex !== null) {
    localStorage.setItem('isEdit', 'true');
    const item = orders[editIndex];
    if (item) {
      document.getElementById('nama').value = item.nama;
      document.getElementById('alamat').value = item.alamat;
      document.getElementById('telp').value = item.telp;
      jumlahInput.value = item.jumlah;
      document.getElementById('payment').value = item.payment;
      previewEl.textContent = formatRupiah(item.total);

      currentIdTransaksi = item.idTransaksi;
      currentTanggalPesanan = item.tanggalPesanan;

      // 5. Array - splice (hapus data lama)
      orders.splice(editIndex, 1);
      localStorage.setItem('orders', JSON.stringify(orders));
    }
    localStorage.removeItem('editIndex');
  }

  // 4. Event Dom - submit
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const nama = document.getElementById('nama').value;
    const alamat = document.getElementById('alamat').value;
    const telp = document.getElementById('telp').value;
    const jumlah = parseInt(document.getElementById('jumlah').value);  //bilangan bulat
    const payment = document.getElementById('payment').value;
    const total = jumlah * HARGA;

    // === OBJECT MATH & DATE ===
    const idTransaksi = currentIdTransaksi || ('TRX-' + Math.floor(Math.random() * 1000000));
    const tanggalPesanan = currentTanggalPesanan || formatTanggal(new Date());

    // 7. Object literal
    const pesanan = { idTransaksi, tanggalPesanan, nama, alamat, telp, jumlah, total, payment };

    // Cek status edit
    const isEditMode = localStorage.getItem('isEdit') === 'true';
    if (isEditMode) {
      localStorage.removeItem('isEdit');
    }

    // 5. Array - unshift (posisi teratas)
    orders.unshift(pesanan);
    localStorage.setItem('orders', JSON.stringify(orders)); // 7. JSON

    const successMsg = isEditMode ? 'Data pesanan berhasil diubah' : 'Pesanan berhasil di buat';
    localStorage.setItem('toastNotif', successMsg);

    // 6. Conditional - redirect berdasarkan payment
    if (payment === 'Transfer' || payment === 'E-Wallet') {
      window.location.href = 'payment.html?nama=' + nama + '&total=' + total + '&metode=' + payment;
    } else {
      window.location.href = 'index.html';
    }
  });
}

// --- TABEL (index.html) ---
const tabel = document.getElementById('tabelData');

if (tabel) {
  tampilkanData();
  updateStats();
}

// 2. Function - update statistik dashboard
function updateStats() {
  // 5. Array - reduce (menghitung total)
  const totalKeranjang = orders.reduce(function (sum, d) { return sum + d.jumlah; }, 0);
  const totalPendapatan = orders.reduce(function (sum, d) { return sum + d.total; }, 0);

  // 6. Conditional - ternary untuk rata-rata
  const rataRata = orders.length > 0 ? Math.round(totalPendapatan / orders.length) : 0;

  // 3. DOM - textContent
  document.getElementById('statOrders').textContent = orders.length;
  document.getElementById('statBaskets').textContent = totalKeranjang;
  document.getElementById('statRevenue').textContent = formatRupiah(totalPendapatan);
  document.getElementById('statAvg').textContent = formatRupiah(rataRata);
}

function tampilkanData() {
  tabel.innerHTML = '';

  // 6. Conditional - cek kosong
  if (orders.length === 0) {
    tabel.innerHTML = '<tr><td colspan="9" class="empty">Belum ada pesanan</td></tr>';
    return;
  }

  // 5. Array - forEach
  orders.forEach(function (d, i) {
    // 6. Conditional - ternary untuk badge
    const badgeClass = d.payment === 'Cash' ? 'badge-cash'
      : d.payment === 'Transfer' ? 'badge-transfer'
        : 'badge-ewallet';

    const renderId = d.idTransaksi || '-';
    const renderTanggal = d.tanggalPesanan || '-';

    const row = '<tr>' +
      '<td><strong>' + renderId + '</strong></td>' +
      '<td><small>' + renderTanggal + '</small></td>' +
      '<td>' + d.nama.toUpperCase() + '</td>' +
      '<td>' + d.alamat + '</td>' +
      '<td>' + d.telp + '</td>' +
      '<td>' + d.jumlah + '</td>' +
      '<td>' + formatRupiah(d.total) + '</td>' +
      '<td><span class="badge ' + badgeClass + '">' + d.payment + '</span></td>' +
      '<td>' +
      '<button class="btn btn-primary btn-sm" onclick="editData(' + i + ')" style="margin-bottom:4px;">Edit</button><br>' +
      '<button class="btn btn-danger btn-sm" onclick="hapusData(' + i + ')">Hapus</button>' +
      '</td>' +
      '</tr>';

    //  DOM - innerHTML
    tabel.innerHTML += row;
  });
}

// Edit data
function editData(index) {
  localStorage.setItem('editIndex', index);
  window.location.href = 'order.html';
}

// Hapus satu data
function hapusData(index) {
  if (confirm('Hapus pesanan ' + orders[index].nama + '?')) {
    orders.splice(index, 1); // Array - splice
    localStorage.setItem('orders', JSON.stringify(orders));
    tampilkanData();
    updateStats();
    showToast('Data pesanan berhasil dihapus');
  }
}

// Kotak Dialog
function resetData() {
  if (orders.length === 0) {
    alert('Tidak ada data!');
    return;
  }
  if (confirm('Yakin hapus semua pesanan?')) {
    localStorage.removeItem('orders');
    orders = [];
    tampilkanData();
    updateStats();
  }
}

// === 8. OBJECT DATE (Format Tanggal) ===
function formatTanggal(dateObj) {
  const hariArr = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const bulanArr = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const hari = hariArr[dateObj.getDay()];
  const tanggal = dateObj.getDate();
  const bulan = bulanArr[dateObj.getMonth()];
  const tahun = dateObj.getFullYear();

  const jam = String(dateObj.getHours()).padStart(2, '0');
  const menit = String(dateObj.getMinutes()).padStart(2, '0');

  return `${hari}, ${tanggal} ${bulan} ${tahun} - ${jam}:${menit}`;
}

// === TOAST NOTIFICATION ===
function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  
  setTimeout(function() {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(function() {
    toast.classList.remove('show');
    setTimeout(function() {
      toast.remove();
    }, 300);
  }, 3000);
}

// Cek toast notifikasi saat berada di beranda
if (document.getElementById('tabelData')) {
  const pendingToast = localStorage.getItem('toastNotif');
  if (pendingToast) {
    showToast(pendingToast);
    localStorage.removeItem('toastNotif');
  }
}