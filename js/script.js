document.addEventListener('DOMContentLoaded', () => {
    const KUNCI_PENYIMPANAN = 'GUDANG_STOK_DATA';
    const KUNCI_RIWAYAT = 'GUDANG_RIWAYAT_DATA';
    
    // Data awal jika kosong
    if (!localStorage.getItem(KUNCI_PENYIMPANAN)) {
        const dataContoh = [
            { id: Math.floor(Math.random() * 1000000).toString(), code: 'BRG-001', name: 'Beras Premium', category: 'Bahan Pokok', quantity: 50, unit: 'Kg', expiry: '2027-12-31' },
            { id: (Math.floor(Math.random() * 1000000) + 1).toString(), code: 'BRG-002', name: 'Minyak Goreng', category: 'Bahan Pokok', quantity: 15, unit: 'Liter', expiry: '2026-05-20' },
            { id: (Math.floor(Math.random() * 1000000) + 2).toString(), code: 'BRG-003', name: 'Daging Ayam', category: 'Daging & Ikan', quantity: 5, unit: 'Kg', expiry: '2026-03-25' },
        ];
        localStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify(dataContoh));
    }

    let daftarBarang = JSON.parse(localStorage.getItem(KUNCI_PENYIMPANAN)) || [];

    // Elemen DOM
    const tubuhTabel = document.getElementById('tableBody');
    const statusKosong = document.getElementById('emptyState');
    const inputPencarian = document.getElementById('searchInput');
    const kontainerTabel = document.querySelector('.table-container');
    
    // Elemen statistik
    const tampilanTotalBarang = document.getElementById('totalItems');
    const tampilanStokAman = document.getElementById('safeStock');
    const tampilanStokMenipis = document.getElementById('lowStock');
    const tampilanSegerapKedaluwarsa = document.getElementById('expiringSoon');

    // Modal Tambah/Edit
    const modalFormulir = document.getElementById('formModal');
    const formulirBarang = document.getElementById('itemForm');
    const judulModal = document.getElementById('modalTitle');
    const btnBukaModalTambah = document.getElementById('openAddModalBtn');
    
    // Modal Hapus
    const modalHapus = document.getElementById('deleteModal');
    const inputIdHapusBarang = document.getElementById('deleteItemId');
    const spanNamaHapusBarang = document.getElementById('deleteItemName');
    const btnKonfirmasiHapus = document.getElementById('confirmDeleteBtn');

    // Input formulir
    const inputIdBarang = document.getElementById('itemId');
    const inputKodeBarang = document.getElementById('itemCode');
    const inputNamaBarang = document.getElementById('itemName');
    const inputKategoriBarang = document.getElementById('itemCategory');
    const inputJumlahBarang = document.getElementById('itemQuantity');
    const inputSatuanBarang = document.getElementById('itemUnit');
    const inputKedaluwarsaBarang = document.getElementById('itemExpiry');

    // Fungsi Utilitas
    const simpanKeLocalStorage = () => {
        localStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify(daftarBarang));
    };

    const formatTanggal = (stringTanggal) => {
        const opsi = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(stringTanggal).toLocaleDateString('id-ID', opsi);
    };

    /* =============================================================================
       =============================================================================
       TASK 1: TENTUKAN STATUS BARANG
       =============================================================================
       =============================================================================
       Deskripsi: 
       - Fungsi ini menentukan status barang berdasarkan jumlah stok dan tanggal kedaluwarsa
       - Digunakan untuk menampilkan badge warna pada tabel inventory
      
       Logika yang harus diimplementasikan:
       1. Buat objek Date untuk hari ini dan tanggal kedaluwarsa
       2. Hitung selisih waktu dalam milidetik, lalu konversi ke hari (Math.ceil)
       3. Jika hariMenujuKedaluwarsa <= 7: 
          → return { label: 'Kedaluwarsa', class: 'kedaluwarsa', type: 'expiring' }
       4. Jika jumlah stok <= 10 (dan tidak kedaluwarsa): 
          → return { label: 'Stok Menipis', class: 'menipis', type: 'low' }
       5. Jika tidak keduanya: 
          → return { label: 'Aman', class: 'aman', type: 'safe' }
      
       Output: Object { label: string, class: string, type: 'expiring' | 'low' | 'safe' }
      
       Wiring (Dimana fungsi ini digunakan):
       - Dipanggil oleh: fungsi tampilkanTabel() - untuk menampilkan badge status di tabel
       - Dipanggil oleh: fungsi perbaruiStatistik() - untuk menghitung jumlah per kategori
       - Parameter: (jumlah: number, tanggalKadaluarsa: string)
       - Contoh pemanggilan: const status = enentukanStatus(barang.quantity, barang.expiry)
       
       Contoh return value:
       - { label: 'Kedaluwarsa', class: 'kedaluwarsa', type: 'expiring' }
       - { label: 'Stok Menipis', class: 'menipis', type: 'low' }
       - { label: 'Aman', class: 'aman', type: 'safe' }
       ============================================================================= */
    const enentukanStatus = (jumlah, tanggalKadaluarsa) => {
        const hariIni = new Date();
        const tanggalKedaluwarsa = new Date(tanggalKadaluarsa);
        const selisihWaktu = tanggalKedaluwarsa - hariIni;
        const hariMenujuKedaluwarsa = Math.ceil(selisihWaktu / (1000 * 60 * 60 * 24));

        if (hariMenujuKedaluwarsa <= 7) {
            return { label: 'Kedaluwarsa', class: 'kedaluwarsa', type: 'expiring' };
        }
        if (jumlah <= 10) {
            return { label: 'Stok Menipis', class: 'menipis', type: 'low' };
        }
        return { label: 'Aman', class: 'aman', type: 'safe' };
    };

    /* =============================================================================
       =============================================================================
       TASK 2: RIWAYAT AKTIVITAS (HISTORY TRACKING)
       =============================================================================
       =============================================================================
       Deskripsi: 
       - Fungsi ini menyimpan catatan aktivitas pengguna ke localStorage
       - Berguna untuk tracking siapa melakukan apa dan kapan (audit trail)
       - Data disimpan dengan key: 'GUDANG_RIWAYAT_DATA'
      
       Logika yang harus diimplementasikan:
       1. Ambil data riwayat dari localStorage: localStorage.getItem('GUDANG_RIWAYAT_DATA')
       2. Parse JSON, jika null buat array kosong: []
       3. Buat object entry baru dengan format:
          {
            id: Date.now().toString(),        // ID unik berbasis timestamp
            action: action,                    // 'Tambah' | 'Edit' | 'Hapus'
            itemName: itemName,                // Nama barang yang dioperasikan
            details: details,                  // Detail perubahan, contoh: "Mengubah jumlah menjadi 20 Kg"
            timestamp: new Date().toISOString() // Waktu sekarang format ISO
          }
       4. Tambahkan ke array riwayat di posisi paling depan: riwayat.unshift(entry)
       5. Simpan kembali ke localStorage: localStorage.setItem(...)
      
       Wiring (Dimana fungsi ini digunakan):
       - Saat submit form tambah barang baru
       - Saat submit form edit barang
       - Saat konfirmasi hapus barang
       - Parameter: (action: string, itemName: string, details: string)
       - Contoh pemanggilan: addToHistory('Tambah', 'Beras Premium', 'Menambahkan 50 Kg')
       
       Tips:
       - Gunakan JSON.parse() untuk mengambil data
       - Gunakan JSON.stringify() untuk menyimpan data
       - localStorage hanya menyimpan string
       ============================================================================= */
    const addToHistory = (action, itemName, details) => {
        const riwayat = JSON.parse(localStorage.getItem('GUDANG_RIWAYAT_DATA')) || [];
        const entry = {
            id: Date.now().toString(),
            action: action,
            itemName: itemName,
            details: details,
            timestamp: new Date().toISOString()
        };
        riwayat.unshift(entry);
        localStorage.setItem('GUDANG_RIWAYAT_DATA', JSON.stringify(riwayat));
    };

    /* =============================================================================
       =============================================================================
       TASK 3: PERBARUI STATISTIK DASHBOARD
       =============================================================================
       =============================================================================
       Deskripsi: 
       - Fungsi ini menghitung dan menampilkan statistik inventory di dashboard
       - Menampilkan 4 metrik: total barang, stok aman, stok menipis, akan kedaluwarsa
      
       Logika yang harus diimplementasikan:
       1. Inisialisasi 3 counter: aman = 0, menipis = 0, kedaluwarsa = 0
       2. Loop melalui semua barang di array 'daftarBarang'
       3. Untuk setiap barang, panggil fungsi enentukanStatus(barang.quantity, barang.expiry)
       4. Hitung berdasarkan type:
          - Jika status.type === 'safe' → aman++
          - Jika status.type === 'low' → menipis++
          - Jika status.type === 'expiring' → kedaluwarsa++
       5. Update tampilan HTML (innerText):
          - tampilanTotalBarang.innerText = daftarBarang.length
          - tampilanStokAman.innerText = aman
          - tampilanStokMenipis.innerText = menipis
          - tampilanSegerapKedaluwarsa.innerText = kedaluwarsa
      
       Wiring (Dimana fungsi ini digunakan):
       - Dipanggil oleh: fungsi tampilkanTabel() - selalu dipanggil setelah tabel di-render
       - Tidak menerima parameter (menggunakan variabel global daftarBarang)
       - Update elemen DOM: totalItems, safeStock, lowStock, expiringSoon
       
       Contoh penggunaan di HTML:
       <div class="stat-card">
           <span id="totalItems">0</span>
           <span id="safeStock">0</span>
           <span id="lowStock">0</span>
           <span id="expiringSoon">0</span>
       </div>
       ============================================================================= */
    const perbaruiStatistik = () => {
        let aman = 0;
        let menipis = 0;
        let kedaluwarsa = 0;

        daftarBarang.forEach(barang => {
            const status = enentukanStatus(barang.quantity, barang.expiry);
            if (status.type === 'safe') aman++;
            if (status.type === 'low') menipis++;
            if (status.type === 'expiring') kedaluwarsa++;
        });

        tampilanTotalBarang.innerText = daftarBarang.length;
        tampilanStokAman.innerText = aman;
        tampilanStokMenipis.innerText = menipis;
        tampilanSegerapKedaluwarsa.innerText = kedaluwarsa;
    };

    /* =============================================================================
       =============================================================================
       TASK 4: TAMPILKAN TABEL BARANG (RENDER TABLE)
       =============================================================================
       =============================================================================
       Deskripsi: 
       - Fungsi utama untuk merender tabel inventory ke HTML
       - Include fitur search/filter realtime berdasarkan nama atau kode barang
      
       Logika yang harus diimplementasikan:
       1. Clear isi tabel: tubuhTabel.innerHTML = ''
       2. Filter barang berdasarkan kataPencarian:
          barang.name.toLowerCase().includes(kataPencarian.toLowerCase()) ||
          barang.code.toLowerCase().includes(kataPencarian.toLowerCase())
       3. Kondisi jika hasil filter KOSONG (barangTersaring.length === 0):
          - Hide tabel: tubuhTabel.parentNode.style.display = 'none'
          - Show empty state: statusKosong.style.display = 'block'
       4. Kondisi jika ADA hasil:
          - Show tabel: tubuhTabel.parentNode.style.display = 'table'
          - Hide empty state: statusKosong.style.display = 'none'
          - Loop setiap barang dan buat elemen <tr> dengan innerHTML:
            <tr>
                <td><strong>${barang.code}</strong></td>
                <td>${barang.name}</td>
                <td>${barang.category}</td>
                <td>${barang.quantity}</td>
                <td>${barang.unit}</td>
                <td>${formatTanggal(barang.expiry)}</td>
                <td><span class="badge ${status.class}">${status.label}</span></td>
                <td>
                    <div class="action-cell">
                        <button class="icon-btn edit" onclick="editBarang('${barang.id}')" title="Edit">
                            <i class="ph ph-pencil-simple"></i>
                        </button>
                        <button class="icon-btn delete" onclick="bukaModalHapus('${barang.id}', '${barang.name}')" title="Hapus">
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
          - Append ke tubuhTabel: tubuhTabel.appendChild(baris)
       5. Di AKHIR fungsi, panggil perbaruiStatistik()
      
       Wiring (Dimana fungsi ini digunakan):
       - Saat halaman load: tampilkanTabel() (tanpa parameter)
       - Saat inputPencarian 'input' event: tampilkanTabel(e.target.value)
       - Saat submit form (tambah/edit): tampilkanTabel(inputPencarian.value)
       - Saat konfirmasi hapus: tampilkanTabel(inputPencarian.value)
       - Parameter: kataPencarian = '' (default empty string)
       
       Helper functions yang tersedia:
       - enentukanStatus(quantity, expiry) → { label, class, type }
       - formatTanggal(dateString) → "15 Mar 2026"
       ============================================================================= */
    const tampilkanTabel = (kataPencarian = '') => {
        tubuhTabel.innerHTML = '';
        
        const barangTersaring = daftarBarang.filter(barang => 
            barang.name.toLowerCase().includes(kataPencarian.toLowerCase()) ||
            barang.code.toLowerCase().includes(kataPencarian.toLowerCase())
        );

        if (barangTersaring.length === 0) {
            kontainerTabel.style.display = 'none';
            statusKosong.style.display = 'block';
        } else {
            kontainerTabel.style.display = 'block';
            statusKosong.style.display = 'none';
            
            barangTersaring.forEach(barang => {
                const status = enentukanStatus(barang.quantity, barang.expiry);
                const baris = document.createElement('tr');
                const isBarisPertama = tubuhTabel.children.length === 0;
                baris.innerHTML = `
                    <td data-label="Kode"><strong>${barang.code}</strong></td>
                    <td data-label="Nama Barang">${barang.name}</td>
                    <td data-label="Kategori">${barang.category}</td>
                    <td data-label="Jumlah">${barang.quantity}</td>
                    <td data-label="Satuan">${barang.unit}</td>
                    <td data-label="Tgl Kedaluwarsa">${formatTanggal(barang.expiry)}</td>
                    <td data-label="Status"><span class="badge ${status.class}" ${isBarisPertama ? 'id="demo-first-status-badge"' : ''}>${status.label}</span></td>
                    <td data-label="Aksi">
                        <div class="action-cell">
                            <button class="icon-btn edit" ${isBarisPertama ? 'id="demo-first-edit-btn"' : ''} onclick="editBarang('${barang.id}')" title="Edit">
                                <i class="ph ph-pencil-simple"></i>
                            </button>
                            <button class="icon-btn delete" onclick="bukaModalHapus('${barang.id}', '${barang.name}')" title="Hapus">
                                <i class="ph ph-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                tubuhTabel.appendChild(baris);
            });
        }
        
        perbaruiStatistik();
    };

    /* =============================================================================
       =============================================================================
       TASK 5: EDIT BARANG (GLOBAL FUNCTION - WINDOW)
       =============================================================================
       =============================================================================
       Deskripsi: 
       - Fungsi yang dipanggil saat user klik tombol Edit pada tabel
       - Berisi logika untuk populate form dengan data barang yang akan di-edit
       - WAJIB di-attach ke window object agar bisa dipanggil dari onclick inline HTML
      
       Implementasi:
       1. Cari barang di array 'daftarBarang' berdasarkan id: daftarBarang.find(b => b.id === id)
       2. Jika barang ditemukan (if barang):
          - inputIdBarang.value = barang.id
          - inputKodeBarang.value = barang.code
          - inputNamaBarang.value = barang.name
          - inputKategoriBarang.value = barang.category
          - inputJumlahBarang.value = barang.quantity
          - inputSatuanBarang.value = barang.unit
          - inputKedaluwarsaBarang.value = barang.expiry
          - judulModal.innerText = 'Edit Barang'
          - modalFormulir.classList.add('active')
       3. Jika tidak ditemukan: console.error('Barang tidak ditemukan')
      
       WIRING - Cara menghubungkan dengan HTML:
       - Fungsi ini WAJIB di-attach ke window: window.editBarang = function(id) { ... }
       - Dipanggil dari button onclick di tabel: onclick="editBarang('${barang.id}')"
       - Parameter: id (string) - ID unik barang yang akan diedit
       
       Elemen DOM yang digunakan:
       - inputIdBarang, inputKodeBarang, inputNamaBarang
       - inputKategoriBarang, inputJumlahBarang, inputSatuanBarang
       - inputKedaluwarsaBarang
       - judulModal, modalFormulir
       
       Contoh pemanggilan di HTML:
       <button onclick="editBarang('123456')">Edit</button>
       
       Catatan Penting:
       - Gunakan .find() bukan .filter() karena kita mau dapat 1 barang
       - Modal otomatis terbuka dengan class 'active'
       ============================================================================= */
    window.editBarang = (id) => {
        const barang = daftarBarang.find(b => b.id === id);
        if (barang) {
            inputIdBarang.value = barang.id;
            inputKodeBarang.value = barang.code;
            inputNamaBarang.value = barang.name;
            inputKategoriBarang.value = barang.category;
            inputJumlahBarang.value = barang.quantity;
            inputSatuanBarang.value = barang.unit;
            inputKedaluwarsaBarang.value = barang.expiry;
            judulModal.innerText = 'Edit Barang';
            modalFormulir.classList.add('active');
        } else {
            console.error('Barang tidak ditemukan');
        }
    };

    /* =============================================================================
       =============================================================================
       TASK 6: BUKA MODAL HAPUS (GLOBAL FUNCTION - WINDOW)
       =============================================================================
       =============================================================================
       Deskripsi: 
       - Fungsi yang dipanggil saat user klik tombol Hapus pada tabel
       - Menampilkan modal konfirmasi hapus dengan menampilkan nama barang
       - WAJIB di-attach ke window object agar bisa dipanggil dari onclick inline HTML
      
       Implementasi:
       1. Simpan ID barang ke input hidden: inputIdHapusBarang.value = id
          (Ini penting karena saat konfirmasi, kita butuh ID untuk hapus)
       2. Tampilkan nama barang di modal: spanNamaHapusBarang.innerText = nama
       3. Tampilkan modal: modalHapus.classList.add('active')
      
       WIRING - Cara menghubungkan dengan HTML:
       - Fungsi ini WAJIB di-attach ke window: window.bukaModalHapus = function(id, nama) { ... }
       - Dipanggil dari button onclick di tabel: onclick="bukaModalHapus('${barang.id}', '${barang.name}')"
       - Parameter: 
         * id (string) - ID unik barang yang akan dihapus
         * nama (string) - Nama barang untuk ditampilkan di konfirmasi
       
       Elemen DOM yang digunakan:
       - inputIdHapusBarang (hidden input untuk menyimpan ID sementara)
       - spanNamaHapusBarang (span untuk menampilkan nama di modal)
       - modalHapus (elemen modal itu sendiri)
       
       Contoh pemanggilan di HTML:
       <button onclick="bukaModalHapus('123456', 'Beras Premium')">Hapus</button>
       
       Alur fluxo lengkap:
       1. User klik Hapus → bukaModalHapus(id, nama) dipanggil
       2. Modal muncul dengan nama barang
       3. User klik "Ya, Hapus" → btnKonfirmasiHapus event listener mengambil ID dari inputIdHapusBarang
       4. Barang dihapus dari array, simpan ke localStorage, render ulang tabel
       ============================================================================= */
    window.bukaModalHapus = (id, nama) => {
        inputIdHapusBarang.value = id;
        spanNamaHapusBarang.innerText = nama;
        modalHapus.classList.add('active');
    };

    // =============================================================================
    // EVENT LISTENERS - Jangan diubah, ini sudah berfungsi
    // =============================================================================
    
    // Pencarian - realtime search
    inputPencarian.addEventListener('input', (e) => {
        tampilkanTabel(e.target.value);
    });

    // Tutup Modal Tambah/Edit
    document.querySelectorAll('.close-modal').forEach(tombol => {
        tombol.addEventListener('click', () => {
            modalFormulir.classList.remove('active');
            formulirBarang.reset();
            inputIdBarang.value = '';
        });
    });

    // Tutup Modal Hapus
    document.querySelectorAll('.close-delete').forEach(tombol => {
        tombol.addEventListener('click', () => {
            modalHapus.classList.remove('active');
            inputIdHapusBarang.value = '';
        });
    });

    // Buka Modal Tambah
    btnBukaModalTambah.addEventListener('click', () => {
        judulModal.innerText = 'Tambah Barang Baru';
        formulirBarang.reset();
        inputIdBarang.value = '';
        modalFormulir.classList.add('active');
    });

    // Submit Formulir (Tambah/Edit)
    formulirBarang.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const id = inputIdBarang.value;
        const barangBaru = {
            id: id ? id : Math.floor(Math.random() * 1000000).toString(),
            code: inputKodeBarang.value,
            name: inputNamaBarang.value,
            category: inputKategoriBarang.value,
            quantity: parseInt(inputJumlahBarang.value),
            unit: inputSatuanBarang.value,
            expiry: inputKedaluwarsaBarang.value
        };

        if (id) {
            // Edit - update data
            const indeks = daftarBarang.findIndex(b => b.id === id);
            if (indeks !== -1) {
                addToHistory('Edit', barangBaru.name, `Mengubah data barang: ${barangBaru.quantity} ${barangBaru.unit}`);
                daftarBarang[indeks] = barangBaru;
            }
        } else {
            // Tambah - push new data
            addToHistory('Tambah', barangBaru.name, `Menambahkan barang baru: ${barangBaru.quantity} ${barangBaru.unit}`);
            daftarBarang.push(barangBaru);
        }

        simpanKeLocalStorage();
        tampilkanTabel(inputPencarian.value);
        modalFormulir.classList.remove('active');
        formulirBarang.reset();
        inputIdBarang.value = '';
    });

    // Konfirmasi Hapus
    btnKonfirmasiHapus.addEventListener('click', () => {
        const id = inputIdHapusBarang.value;
        const barang = daftarBarang.find(b => b.id === id);
        if (barang) {
            addToHistory('Hapus', barang.name, `Menghapus barang: ${barang.quantity} ${barang.unit}`);
        }
        daftarBarang = daftarBarang.filter(b => b.id !== id);
        simpanKeLocalStorage();
        tampilkanTabel(inputPencarian.value);
        modalHapus.classList.remove('active');
        inputIdHapusBarang.value = '';
    });

    // Inisialisasi Tampilan Saat Load
    tampilkanTabel();
});
