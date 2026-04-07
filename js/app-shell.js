document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const openButton = document.querySelector('[data-sidebar-open]');
    const closeButton = document.querySelector('[data-sidebar-close]');
    const backdrop = document.querySelector('[data-sidebar-backdrop]');

    if (!sidebar || !openButton || !closeButton || !backdrop) {
        return;
    }

    const closeSidebar = () => {
        sidebar.classList.remove('is-open');
        backdrop.classList.remove('active');
        document.body.classList.remove('nav-open');
    };

    const openSidebar = () => {
        sidebar.classList.add('is-open');
        backdrop.classList.add('active');
        document.body.classList.add('nav-open');
    };

    openButton.addEventListener('click', openSidebar);
    closeButton.addEventListener('click', closeSidebar);
    backdrop.addEventListener('click', closeSidebar);

    window.addEventListener('resize', () => {
        if (window.innerWidth > 960) {
            closeSidebar();
        }
    });

    document.querySelectorAll('.sidebar .nav-item').forEach((item) => {
        item.addEventListener('click', closeSidebar);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeSidebar();
        }
    });
});
