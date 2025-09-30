document.addEventListener('DOMContentLoaded', () => {
    // Keamanan dasar & inisialisasi
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/';
        return;
    }
    const logoutButton = document.getElementById('logout-button');
    if(logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            alert('Anda telah logout.');
            window.location.href = '/';
        });
    }

    // Data untuk galeri, disimpan langsung di frontend
    const bodyLanguageData = [
        {
            title: 'Menyilangkan Tangan',
            gif_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2RtaHhvdjJmdjVscXlsczQ0NWZtZ2o4Zm45aG5md2pncjh1eDlwZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKSjRrfOfvADfIA/giphy.gif',
            description: 'Bisa menunjukkan sikap defensif, tidak setuju, atau merasa tidak nyaman. Terkadang juga hanya karena dingin.'
        },
        {
            title: 'Kontak Mata Langsung',
            gif_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYzJ2M2F0cnZ2MWcwaWFtbjI4ZG04NXJ3MDRoY2lpb3h4czN0d3VzNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26ufk6A3hg3gE1A2Y/giphy.gif',
            description: 'Menunjukkan kepercayaan diri, kejujuran, dan ketertarikan pada percakapan.'
        },
        {
            title: 'Mengangguk',
            gif_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2F4c2R2cWR3cTluNmR0bWk2dmR4ZzV5cG1rNjE2cGV2cHNuc3M4cyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kFgzrD4n2b1DETWNF4/giphy.gif',
            description: 'Tanda setuju, mengerti, dan mendorong lawan bicara untuk terus berbicara.'
        },
        {
            title: 'Mengangkat Bahu',
            gif_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGI3amVlMnZ5M3Q3dm1pNGFqYWx5d3I0Nmc2azFjZHVtaW9icHhjbSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKU8i3B8jftw62I/giphy.gif',
            description: 'Umumnya berarti "Saya tidak tahu" atau ketidakpedulian.'
        }
        // Tambahkan data lainnya di sini
    ];

    const learningGrid = document.getElementById('learning-grid');
    if (learningGrid) {
        bodyLanguageData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'learning-card';
            card.innerHTML = `
                <img src="${item.gif_url}" alt="${item.title}" class="learning-card-gif">
                <div class="learning-card-content">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                </div>
            `;
            learningGrid.appendChild(card);
        });
    }
});