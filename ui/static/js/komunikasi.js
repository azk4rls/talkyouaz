document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/'; 
        return;
    }

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            alert('Anda telah logout.');
            window.location.href = '/';
        });
    }

    // === ELEMEN JEMBATAN KOMUNIKASI ===
    const speakBtn = document.getElementById('speak-btn');
    const listenBtn = document.getElementById('listen-btn');
    const userInput = document.getElementById('user-text-input');
    const transcriptArea = document.getElementById('transcript-area');
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    const saveBtn = document.getElementById('save-btn'); // Pindahkan ke sini

    // Cek dukungan browser
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;
    if (recognition) {
        recognition.continuous = false;
        recognition.lang = 'id-ID';
        recognition.interimResults = false;
    }

    const appendToTranscript = (text, type) => {
        // ... (fungsi appendToTranscript tidak berubah)
    };
    
    // --- Logika Text-to-Speech ---
    if (speakBtn) {
        // ... (logika speakBtn tidak berubah)
    }

    // --- Logika Speech-to-Text ---
    if (listenBtn && recognition) {
        // ... (logika listenBtn tidak berubah)
    }

    // ==========================================================
    // INI BAGIAN YANG DIPERBAIKI
    // ==========================================================
    // --- Logika Tombol Simpan ---
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const entries = transcriptArea.querySelectorAll('.transcript-entry');
            if (entries.length === 0) {
                alert('Tidak ada percakapan untuk disimpan.');
                return;
            }

            let fullTranscript = [];
            entries.forEach(entry => {
                const prefix = entry.classList.contains('user') ? 'Saya: ' : 'Lawan Bicara: ';
                fullTranscript.push(prefix + entry.textContent);
            });

            const response = await fetch('/api/v1/conversations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // 'token' sekarang dikenal
                },
                body: JSON.stringify({ transcript: fullTranscript.join('\n') })
            });
            
            if (response.ok) {
                alert('Percakapan berhasil disimpan!');
                transcriptArea.innerHTML = '';
            } else {
                alert('Gagal menyimpan percakapan.');
            }
        });
    }

}); // <-- Pastikan semua kode ada di dalam penutup ini