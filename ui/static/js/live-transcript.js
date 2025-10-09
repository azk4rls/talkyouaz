document.addEventListener('DOMContentLoaded', () => {
    // Keamanan dasar & logout
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

    // Elemen Halaman
    const toggleBtn = document.getElementById('toggle-listen-btn');
    const display = document.getElementById('live-transcript-display');
    let isListening = false;

    // Cek dukungan browser
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        toggleBtn.disabled = true;
        toggleBtn.innerHTML = '<i class="fas fa-microphone-slash"></i> Browser Tidak Mendukung';
        return;
    }
    
    const recognition = new SpeechRecognition();
    
    // Konfigurasi Kunci untuk Transkrip Live
    recognition.continuous = true;  // Terus mendengarkan
    recognition.interimResults = true; // Tampilkan hasil sementara saat berbicara
    recognition.lang = 'id-ID';

    let finalTranscript = '';

    recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript + '. ';
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        // Tampilkan gabungan teks final dan teks sementara
        display.innerHTML = finalTranscript + `<span style="color: #6c757d;">${interimTranscript}</span>`;
        // Auto-scroll
        display.scrollTop = display.scrollHeight;
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
        isListening = false;
        toggleBtn.classList.remove('listening');
        toggleBtn.innerHTML = '<i class="fas fa-microphone"></i> Mulai Transkrip';
    };

    toggleBtn.addEventListener('click', () => {
        if (isListening) {
            recognition.stop();
        } else {
            finalTranscript = ''; // Reset transkrip setiap kali mulai baru
            display.innerHTML = '<p class="placeholder">Mendengarkan...</p>';
            recognition.start();
            isListening = true;
            toggleBtn.classList.add('listening');
            toggleBtn.innerHTML = '<i class="fas fa-stop"></i> Hentikan';
        }
    });
});