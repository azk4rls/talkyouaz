document.addEventListener('DOMContentLoaded', () => {
    // Keamanan dasar & inisialisasi elemen
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

    // Elemen spesifik untuk halaman ini
    const startBtn = document.getElementById('start-listen-btn');
    const statusBox = document.getElementById('status');
    const alertOverlay = document.getElementById('alert-overlay');
    const alertIcon = document.getElementById('alert-icon');
    const alertText = document.getElementById('alert-text');
    
    const toggles = {
        clap: document.getElementById('alert-clap'),
        speech: document.getElementById('alert-speech'),
    };
    
    let recognizer;

    // Fungsi untuk menampilkan notifikasi visual
    const showVisualAlert = (label) => {
        let iconClass = 'fas fa-question-circle';
        let text = label;

        if (label.includes('Tepuk') || label.includes('Ketukan')) {
            iconClass = 'fas fa-sign-language';
            text = 'Tepukan / Ketukan Terdeteksi';
        } else if (label.includes('Bicara')) {
            iconClass = 'fas fa-comment-dots';
            text = 'Suara Bicara Terdeteksi';
        }

        alertIcon.className = `alert-icon ${iconClass}`;
        alertText.textContent = text;
        alertOverlay.style.display = 'flex';

        setTimeout(() => {
            alertOverlay.style.display = 'none';
        }, 3000);
    };

    // Fungsi utama untuk inisialisasi dan mendengarkan
    async function listen() {
        if (recognizer && recognizer.isListening()) {
            recognizer.stopListening();
            statusBox.textContent = 'Status: Tidak Aktif';
            statusBox.className = 'status-box status-idle';
            startBtn.innerHTML = '<i class="fas fa-play-circle"></i> Mulai Mendengarkan';
            recognizer = null;
            return;
        }

        try {
            statusBox.textContent = 'Status: Memuat model...';
            
            // Pakai bawaan TensorFlow.js (otomatis load model & metadata)
            recognizer = speechCommands.create('BROWSER_FFT');
            await recognizer.ensureModelLoaded();

            statusBox.textContent = 'Status: Aktif Mendengarkan...';
            statusBox.className = 'status-box status-active';
            startBtn.innerHTML = '<i class="fas fa-stop-circle"></i> Hentikan';

            const words = recognizer.wordLabels();
            
            recognizer.listen(result => {
                let maxScore = -1;
                let detectedWord = null;

                for (let i = 0; i < words.length; ++i) {
                    if (result.scores[i] > maxScore) {
                        maxScore = result.scores[i];
                        detectedWord = words[i];
                    }
                }
                
                if (detectedWord && detectedWord !== '_background_noise_') {
                    if (detectedWord === 'clap' && toggles.clap.checked) {
                        showVisualAlert('Tepuk Tangan');
                    } else if (detectedWord === 'speech' && toggles.speech.checked) {
                        showVisualAlert('Suara Bicara');
                    }
                }

            }, {
                includeSpectrogram: true,
                probabilityThreshold: 0.90
            });

        } catch (error) {
            console.error(error);
            statusBox.textContent = 'Error: Gagal memulai';
            statusBox.className = 'status-box status-error';
        }
    }

    if(startBtn) {
        startBtn.addEventListener('click', listen);
    }
});