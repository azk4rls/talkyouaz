// Fungsi untuk pindah antar view (login, register, otp)
function switchView(viewName) {
    const views = {
        login: document.getElementById('login-view'),
        register: document.getElementById('register-view'),
        otp: document.getElementById('otp-view')
    };
    Object.values(views).forEach(view => {
        if (view) view.style.display = 'none';
    });
    if (views[viewName]) {
        views[viewName].style.display = 'block';
    }
}

// Fungsi untuk menangani callback dari login sosial (Google / Facebook)
const handleAuthCallback = () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
        localStorage.setItem('authToken', token);
        window.history.replaceState({}, document.title, "/");
        window.location.href = "/dashboard"; // redirect ke dashboard.html
    }
};

// Panggil fungsi callback segera saat script dimuat
handleAuthCallback();

// Jalankan sisa script setelah DOM siap
document.addEventListener('DOMContentLoaded', () => {
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
    const socialButtons = {
        googleLogin: document.getElementById('login-google-btn'),
        facebookLogin: document.getElementById('login-facebook-btn'),
        googleRegister: document.getElementById('register-google-btn'),
        facebookRegister: document.getElementById('register-facebook-btn')
    };
    const logoutButton = document.getElementById('logout-button');
    const otpEmailDisplay = document.getElementById('otp-email-display');

    let emailForVerification = '';

    // --- Link untuk pindah view ---
    if (links.showRegister) {
        links.showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('register');
        });
    }
    if (links.showLogin) {
        links.showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('login');
        });
    }

    // --- Tombol login sosial ---
    if (socialButtons.googleLogin) {
        socialButtons.googleLogin.addEventListener('click', () => {
            window.location.href = '/api/v1/auth/google/login';
        });
    }
    if (socialButtons.facebookLogin) {
        socialButtons.facebookLogin.addEventListener('click', () => {
            window.location.href = '/api/v1/auth/facebook/login';
        });
    }
    if (socialButtons.googleRegister) {
        socialButtons.googleRegister.addEventListener('click', () => {
            window.location.href = '/api/v1/auth/google/login';
        });
    }
    if (socialButtons.facebookRegister) {
        socialButtons.facebookRegister.addEventListener('click', () => {
            window.location.href = '/api/v1/auth/facebook/login';
        });
    }

    // --- Registrasi ---
    if (forms.register) {
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
                emailForVerification = email;
                if (otpEmailDisplay) otpEmailDisplay.textContent = email;
                alert('Registrasi tahap 1 berhasil! Silakan cek email Anda untuk kode OTP.');
                switchView('otp');
            } catch (error) {
                alert(error.message);
            }
        });
    }

    // --- OTP ---
    if (forms.otp) {
        forms.otp.addEventListener('submit', async (e) => {
            e.preventDefault();
            const otp_code = document.getElementById('otp-code').value;
            if (!emailForVerification) {
                alert('Terjadi kesalahan. Silakan coba registrasi ulang.');
                switchView('register');
                return;
            }
            try {
                const response = await fetch('/api/v1/auth/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailForVerification, otp_code })
                });
                if (!response.ok) throw new Error('Kode OTP salah atau telah kedaluwarsa.');

                alert('Verifikasi berhasil! Silakan login untuk melanjutkan.');
                forms.login.reset();
                document.getElementById('login-email').value = emailForVerification;
                switchView('login');
            } catch (error) {
                alert(error.message);
            }
        });
    }

    // --- Login ---
    if (forms.login) {
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
                if (!response.ok) {
                    const contentType = response.headers.get('content-type') || '';
                    const errorBody = contentType.includes('application/json')
                        ? (await response.json())
                        : { message: await response.text() };
                    if (response.status === 403) {
                        emailForVerification = email;
                        if (otpEmailDisplay) otpEmailDisplay.textContent = email;
                        alert('Akun belum diverifikasi. Silakan masukkan kode OTP yang telah dikirim.');
                        switchView('otp');
                    } else {
                        alert(errorBody.message || 'Email atau password salah.');
                    }
                    return;
                }
                const data = await response.json();
                if (data && data.token) {
                    localStorage.setItem('authToken', data.token);
                    window.location.href = "/dashboard"; // redirect ke halaman dashboard.html
                } else {
                    console.error('Unexpected login response', data);
                    alert('Login gagal: respons tidak valid dari server.');
                }
            } catch (error) {
                console.error('Login error', error);
                alert(error.message || 'Terjadi kesalahan saat login.');
            }
        });
    }

    // --- Logout ---
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            alert('Anda telah logout.');
            switchView('login');
        });
    }

    // --- Inisialisasi ---
    const token = localStorage.getItem('authToken');
    const params = new URLSearchParams(window.location.search);

    if (token && !params.has('token')) {
        window.location.href = '/dashboard'; // langsung ke dashboard kalau sudah login
    } else if (!token) {
        switchView('login');
    }
});
