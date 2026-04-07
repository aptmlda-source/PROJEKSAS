document.addEventListener('DOMContentLoaded', () => {
    const TOUR_STORAGE_KEY = 'GUDANGKU_DEMO_TOUR_STATE';

    const currentPath = window.location.pathname;
    const isPagesPath = currentPath.includes('/pages/');

    const resolveUrl = page => {
        if (page === 'index') {
            return isPagesPath ? '../index.html' : './index.html';
        }

        return isPagesPath ? `./${page}.html` : `./pages/${page}.html`;
    };

    const closeFormModal = () => {
        const modal = document.getElementById('formModal');
        const form = document.getElementById('itemForm');
        const itemId = document.getElementById('itemId');
        if (!modal) {
            return;
        }

        modal.classList.remove('active');
        if (form) {
            form.reset();
        }
        if (itemId) {
            itemId.value = '';
        }
    };

    const openAddModal = () => {
        closeFormModal();
        const modalTitle = document.getElementById('modalTitle');
        const trigger = document.getElementById('openAddModalBtn');
        if (modalTitle) {
            modalTitle.innerText = 'Tambah Barang Baru';
        }
        if (trigger) {
            trigger.click();
        }
    };

    const openEditModal = () => {
        closeFormModal();
        const editBtn = document.getElementById('demo-first-edit-btn');
        if (editBtn) {
            editBtn.click();
        }
    };

    const steps = [
        {
            page: 'index',
            selector: '#demo-dashboard-nav',
            title: 'Navigasi Utama GudangKu',
            description: 'Sidebar ini adalah pusat perpindahan antar halaman. Dari sini pengguna bisa membuka dashboard, data stok, riwayat aktivitas, dan pengaturan sistem.',
            placement: 'right'
        },
        {
            page: 'index',
            selector: '#demo-dashboard-stats',
            title: 'Ringkasan Kondisi Gudang',
            description: 'Empat kartu ini memberi gambaran cepat tentang total barang, stok aman, stok menipis, dan item yang perlu segera dicek karena mendekati kedaluwarsa.',
            placement: 'bottom'
        },
        {
            page: 'index',
            selector: '#demo-dashboard-table',
            title: 'Operasional Harian',
            description: 'Bagian ini dipakai untuk mencari barang, melihat tabel persediaan, lalu menambah, mengubah, atau menghapus data stok langsung dari dashboard.',
            placement: 'top'
        },
        {
            page: 'index',
            selector: '#demo-first-status-badge',
            title: 'Status Barang',
            description: 'Badge ini menjelaskan kondisi stok setiap barang. Hijau berarti aman, kuning menandakan stok menipis, dan merah menunjukkan barang perlu perhatian karena mendekati atau melewati batas kedaluwarsa.',
            placement: 'left'
        },
        {
            page: 'index',
            selector: '#openAddModalBtn',
            title: 'Mulai Tambah Barang',
            description: 'Tombol ini dipakai untuk membuka form input barang baru kapan saja dari dashboard.',
            placement: 'left',
            onLeave: closeFormModal
        },
        {
            page: 'index',
            selector: '#demo-item-modal',
            title: 'Form Tambah Barang',
            description: 'Di form ini admin mengisi data inti barang: kode, nama, kategori, jumlah, satuan, dan tanggal kedaluwarsa. Semua data disimpan langsung ke stok utama setelah dikonfirmasi.',
            placement: 'left',
            onEnter: openAddModal,
            onLeave: closeFormModal
        },
        {
            page: 'index',
            selector: '#demo-first-edit-btn',
            title: 'Edit Barang',
            description: 'Setiap baris punya tombol edit agar data stok bisa diperbarui tanpa harus menghapus dan membuat ulang barang.',
            placement: 'left',
            onLeave: closeFormModal
        },
        {
            page: 'index',
            selector: '#demo-item-modal',
            title: 'Form Edit Barang',
            description: 'Saat mode edit dibuka, form yang sama akan terisi otomatis dengan data barang yang dipilih. Ini memudahkan koreksi jumlah, kategori, atau tanggal kedaluwarsa.',
            placement: 'left',
            onEnter: openEditModal,
            onLeave: closeFormModal
        },
        {
            page: 'data-stok',
            selector: '#demo-stock-summary',
            title: 'Analisis Data Stok',
            description: 'Halaman Data Stok menampilkan ringkasan inventaris yang lebih fokus, sehingga pengguna bisa memantau kondisi stok tanpa harus kembali ke dashboard utama.',
            placement: 'bottom'
        },
        {
            page: 'data-stok',
            selector: '#demo-stock-filters',
            title: 'Filter dan Export',
            description: 'Di sini pengguna dapat menyaring data berdasarkan kata kunci, kategori, dan status, lalu menyiapkan export data untuk kebutuhan laporan.',
            placement: 'bottom'
        },
        {
            page: 'data-stok',
            selector: '#demo-stock-table',
            title: 'Daftar Inventaris Lengkap',
            description: 'Tabel ini memuat seluruh barang beserta statusnya. Aksi edit dan hapus berada di kolom paling kanan agar perubahan data tetap cepat dilakukan.',
            placement: 'top'
        },
        {
            page: 'riwayat',
            selector: '#demo-history-stats',
            title: 'Audit Aktivitas',
            description: 'Halaman Riwayat dipakai untuk melacak berapa kali data ditambah, diubah, atau dihapus. Ini membantu menunjukkan bahwa sistem mencatat setiap aktivitas penting.',
            placement: 'bottom'
        },
        {
            page: 'riwayat',
            selector: '#demo-history-filters',
            title: 'Pelacakan yang Mudah',
            description: 'Pencarian, filter aksi, dan filter tanggal memudahkan admin menemukan perubahan tertentu tanpa membaca semua log secara manual.',
            placement: 'bottom'
        },
        {
            page: 'riwayat',
            selector: '#demo-history-timeline',
            title: 'Timeline Aktivitas',
            description: 'Semua aktivitas ditampilkan sebagai timeline yang mudah dibaca, jadi alur perubahan data stok bisa dijelaskan secara kronologis.',
            placement: 'top'
        },
        {
            page: 'pengaturan',
            selector: '#demo-settings-grid',
            title: 'Konfigurasi Sistem',
            description: 'Halaman Pengaturan merangkum preferensi notifikasi, threshold stok, opsi tampilan, import-export data, dan aksi pemeliharaan aplikasi.',
            placement: 'top'
        },
        {
            page: 'pengaturan',
            selector: '#demo-settings-save',
            title: 'Simpan dan Selesai',
            description: 'Setelah semua preferensi diubah, admin cukup menekan tombol ini untuk menyimpan konfigurasi. Tour dapat dijalankan ulang kapan saja saat perlu presentasi lagi.',
            placement: 'top'
        }
    ];

    const overlay = document.createElement('div');
    overlay.className = 'demo-tour-overlay';

    const highlight = document.createElement('div');
    highlight.className = 'demo-tour-highlight';

    const popover = document.createElement('div');
    popover.className = 'demo-tour-popover';
    popover.innerHTML = `
        <div class="demo-tour-progress"></div>
        <h3 class="demo-tour-title"></h3>
        <p class="demo-tour-description"></p>
        <div class="demo-tour-actions">
            <button type="button" class="demo-tour-btn demo-tour-btn-secondary" data-demo-action="close">Tutup</button>
            <button type="button" class="demo-tour-btn demo-tour-btn-secondary" data-demo-action="prev">Kembali</button>
            <button type="button" class="demo-tour-btn demo-tour-btn-primary" data-demo-action="next">Lanjut</button>
        </div>
    `;

    const progressEl = popover.querySelector('.demo-tour-progress');
    const titleEl = popover.querySelector('.demo-tour-title');
    const descriptionEl = popover.querySelector('.demo-tour-description');
    const prevBtn = popover.querySelector('[data-demo-action="prev"]');
    const nextBtn = popover.querySelector('[data-demo-action="next"]');

    let isMounted = false;
    let activeStepIndex = null;

    const getTourState = () => {
        try {
            return JSON.parse(sessionStorage.getItem(TOUR_STORAGE_KEY)) || null;
        } catch (error) {
            return null;
        }
    };

    const setTourState = state => {
        sessionStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(state));
    };

    const clearTourState = () => {
        sessionStorage.removeItem(TOUR_STORAGE_KEY);
    };

    const mountTour = () => {
        if (isMounted) {
            return;
        }

        document.body.appendChild(overlay);
        document.body.appendChild(highlight);
        document.body.appendChild(popover);
        isMounted = true;
    };

    const unmountTour = () => {
        if (!isMounted) {
            return;
        }

        overlay.remove();
        highlight.remove();
        popover.remove();
        isMounted = false;
        activeStepIndex = null;
    };

    const findElement = selector => document.querySelector(selector);

    const placePopover = (targetRect, placement) => {
        const popoverRect = popover.getBoundingClientRect();
        const spacing = 20;
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let top = targetRect.top + scrollY;
        let left = targetRect.left + scrollX;

        if (placement === 'left') {
            top += targetRect.height / 2 - popoverRect.height / 2;
            left -= popoverRect.width + spacing;
        } else if (placement === 'right') {
            top += targetRect.height / 2 - popoverRect.height / 2;
            left += targetRect.width + spacing;
        } else if (placement === 'top') {
            top -= popoverRect.height + spacing;
            left += targetRect.width / 2 - popoverRect.width / 2;
        } else {
            top += targetRect.height + spacing;
            left += targetRect.width / 2 - popoverRect.width / 2;
        }

        const minLeft = scrollX + 16;
        const maxLeft = scrollX + viewportWidth - popoverRect.width - 16;
        const minTop = scrollY + 16;
        const maxTop = scrollY + viewportHeight - popoverRect.height - 16;

        popover.style.left = `${Math.min(Math.max(left, minLeft), maxLeft)}px`;
        popover.style.top = `${Math.min(Math.max(top, minTop), maxTop)}px`;
    };

    const updateStepPosition = stepIndex => {
        const step = steps[stepIndex];
        const target = findElement(step.selector);

        if (!target) {
            return false;
        }

        mountTour();
        activeStepIndex = stepIndex;

        window.requestAnimationFrame(() => {
            const rect = target.getBoundingClientRect();
            highlight.style.top = `${rect.top + window.scrollY - 8}px`;
            highlight.style.left = `${rect.left + window.scrollX - 8}px`;
            highlight.style.width = `${rect.width + 16}px`;
            highlight.style.height = `${rect.height + 16}px`;

            progressEl.textContent = `Langkah ${stepIndex + 1} dari ${steps.length}`;
            titleEl.textContent = step.title;
            descriptionEl.textContent = step.description;
            prevBtn.disabled = stepIndex === 0;
            nextBtn.textContent = stepIndex === steps.length - 1 ? 'Selesai' : 'Lanjut';

            placePopover(rect, step.placement || 'bottom');
        });

        return true;
    };

    const renderStep = stepIndex => {
        const step = steps[stepIndex];
        if (typeof step.onEnter === 'function') {
            step.onEnter();
        }

        const target = findElement(step.selector);
        if (!target) {
            return false;
        }

        setTourState({ active: true, stepIndex });
        target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

        window.setTimeout(() => updateStepPosition(stepIndex), 180);
        return true;
    };

    const runStepExit = stepIndex => {
        const step = steps[stepIndex];
        if (step && typeof step.onLeave === 'function') {
            step.onLeave();
        }
    };

    const currentPageMatches = page => {
        if (page === 'index') {
            return currentPath.endsWith('/index.html') || currentPath === '/' || currentPath.endsWith('/sts-crud/');
        }

        return currentPath.endsWith(`/${page}.html`);
    };

    const goToStep = stepIndex => {
        if (stepIndex < 0 || stepIndex >= steps.length) {
            clearTourState();
            closeFormModal();
            unmountTour();
            return;
        }

        const currentState = getTourState();
        if (currentState && Number.isInteger(currentState.stepIndex)) {
            runStepExit(currentState.stepIndex);
        }

        const step = steps[stepIndex];
        if (currentPageMatches(step.page)) {
            renderStep(stepIndex);
            return;
        }

        setTourState({ active: true, stepIndex });
        window.location.href = resolveUrl(step.page);
    };

    const closeTour = () => {
        if (activeStepIndex !== null) {
            runStepExit(activeStepIndex);
        }
        clearTourState();
        closeFormModal();
        unmountTour();
    };

    popover.addEventListener('click', event => {
        const button = event.target.closest('[data-demo-action]');
        if (!button || activeStepIndex === null) {
            return;
        }

        const action = button.getAttribute('data-demo-action');

        if (action === 'close') {
            closeTour();
            return;
        }

        if (action === 'prev') {
            goToStep(activeStepIndex - 1);
            return;
        }

        if (action === 'next') {
            if (activeStepIndex === steps.length - 1) {
                closeTour();
                return;
            }
            goToStep(activeStepIndex + 1);
        }
    });

    overlay.addEventListener('click', closeTour);

    window.addEventListener('resize', () => {
        if (activeStepIndex !== null) {
            updateStepPosition(activeStepIndex);
        }
    });

    window.addEventListener('scroll', () => {
        if (activeStepIndex !== null) {
            updateStepPosition(activeStepIndex);
        }
    }, { passive: true });

    window.addEventListener('keydown', event => {
        if (event.key === 'Escape' && activeStepIndex !== null) {
            closeTour();
            return;
        }

        const isShortcut = (event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'b';
        if (!isShortcut) {
            return;
        }

        event.preventDefault();
        closeFormModal();
        goToStep(0);
    });

    const savedState = getTourState();
    if (savedState?.active && Number.isInteger(savedState.stepIndex)) {
        goToStep(savedState.stepIndex);
    }
});
