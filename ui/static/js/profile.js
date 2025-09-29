document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/';
        return;
    }

    // --- Logika Sidebar Aktif ---
    // Mencari link di sidebar yang cocok dengan URL saat ini dan memberinya kelas 'active'
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.href === window.location.href) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // --- Ambil Elemen ---
    const profileForm = document.getElementById('profile-form');
    const changePasswordForm = document.getElementById('change-password-form');
    const userNameInput = document.getElementById('profile-name');
    const userEmailInput = document.getElementById('profile-email');
    const userPhoneInput = document.getElementById('profile-phone');
    
    // --- Logika Tab ---
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            tabLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const tabId = link.dataset.tab;
            tabContents.forEach(content => {
                content.style.display = content.id === tabId ? 'block' : 'none';
                if(content.id === tabId) content.classList.add('active');
                else content.classList.remove('active');
            });
        });
    });

    // --- Ambil dan Tampilkan Data Profil ---
    const fetchProfile = async () => {
        const response = await fetch('/api/v1/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) return;
        const user = await response.json();
        userNameInput.value = user.name;
        userEmailInput.value = user.email;
        userPhoneInput.value = user.phone_number || '';
    };

    // --- Logika Update Profil ---
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const response = await fetch('/api/v1/me', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                name: userNameInput.value,
                phone_number: userPhoneInput.value
            })
        });
        if (response.ok) {
            alert('Profil berhasil diperbarui!');
            // Update nama di pesan selamat datang jika ada
            const nameInToken = JSON.parse(atob(token.split('.')[1])).name;
            if(nameInToken !== userNameInput.value) {
                alert("Nama Anda akan diperbarui sepenuhnya setelah Anda login kembali.");
            }
        } else {
            alert('Gagal memperbarui profil.');
        }
    });

    // --- Logika Ganti Password (tidak berubah) ---
    changePasswordForm.addEventListener('submit', async (e) => {
         // ... (Salin-tempel logika form ganti password dari jawaban sebelumnya) ...
    });
    
    // Panggil fetchProfile saat halaman dimuat
    fetchProfile();
});