document.addEventListener('DOMContentLoaded', () => {
    // === Ambil semua elemen yang dibutuhkan ===
    const views = {
        login: document.getElementById('login-view'),
        register: document.getElementById('register-view'),
        otp: document.getElementById('otp-view'),
        dashboard: document.getElementById('dashboard-view')
    };
    const forms = {
        login: document.getElementById('login-form'),
        register: document.getElementById('register-form'),
        otp: document.getElementById('otp-form')
    };
    const links = {
        showRegister: document.getElementById('show-register'),
        showLogin: document.getElementById('show-login'),
        resendOtp: document.getElementById('resend-otp')
    };
    const logoutButton = document.getElementById('logout-button');
    const otpEmailDisplay = document.getElementById('otp-email-display');

    // Variabel untuk menyimpan email sementara saat verifikasi
    let emailForVerification = '';

    // === Fungsi untuk pindah antar view ===
    const switchView = (viewName) => {
        Object.values(views).forEach(view => view.style.display = 'none');
        views[viewName].style.display = 'block';
    };

    // === Event Listeners untuk Link Pindah View ===
    links.showRegister.addEventListener('click', (e) => { e.preventDefault(); switchView('register'); });
    links.showLogin.addEventListener('click', (e) => { e.preventDefault(); switchView('login'); });
    links.resendOtp.addEventListener('click', (e) => {
        e.preventDefault();
        // (Logika untuk kirim ulang OTP bisa ditambahkan di sini)
        alert('Fitur kirim ulang OTP belum diimplementasikan.');
    });

    // === LOGIKA UTAMA: Registrasi, Verifikasi, Login, Logout ===

    // 1. Registrasi
    forms.register.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const response = await fetch('/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            if (!response.ok) throw new Error('Registrasi gagal. Email mungkin sudah terdaftar.');
            
            // Simpan email untuk proses verifikasi
            emailForVerification = email;
            otpEmailDisplay.textContent = email; // Tampilkan email di halaman OTP
            
            alert('Registrasi tahap 1 berhasil! Silakan cek email Anda untuk kode OTP.');
            switchView('otp'); // Pindah ke halaman verifikasi OTP
        } catch (error) {
            alert(error.message);
        }
    });

    // 2. Verifikasi OTP
    forms.otp.addEventListener('submit', async (e) => {
        e.preventDefault();
        const otp_code = document.getElementById('otp-code').value;

        if (!emailForVerification) {
            alert('Terjadi kesalahan. Silakan coba registrasi ulang.');
            switchView('register');
            return;
        }

        try {
            // Kita akan buat endpoint ini di backend nanti
            const response = await fetch('/api/v1/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailForVerification, otp_code })
            });

            if (!response.ok) throw new Error('Kode OTP salah atau telah kedaluwarsa.');

            alert('Verifikasi berhasil! Silakan login untuk melanjutkan.');
            forms.login.reset(); // Bersihkan form login
            document.getElementById('login-email').value = emailForVerification; // Isi email otomatis
            switchView('login'); // Pindah ke halaman login
        } catch (error) {
            alert(error.message);
        }
    });

    // 3. Login
    forms.login.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            if (!response.ok) throw new Error('Email atau password salah.');

            const data = await response.json();
            localStorage.setItem('authToken', data.token);
            
            switchView('dashboard');
        } catch(error) {
            alert(error.message);
        }
    });
    
    // 4. Logout
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        alert('Anda telah logout.');
        switchView('login');
    });
    
    // --- Inisialisasi Aplikasi ---
    const token = localStorage.getItem('authToken');
    if (token) {
        switchView('dashboard');
    } else {
        switchView('login');
    }
});