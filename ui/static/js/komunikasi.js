document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    const logoutButton = document.getElementById('logout-button');

    // Keamanan: Jika tidak ada token, tendang kembali ke halaman login.
    if (!token) {
        window.location.href = '/'; 
        return;
    }

    // Logika untuk tombol Logout di sidebar
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            alert('Anda telah logout.');
            window.location.href = '/';
        });
    }

    // === LOGIKA JEMBATAN KOMUNIKASI ===
    const speakBtn = document.getElementById('speak-btn');
    const listenBtn = document.getElementById('listen-btn');
    const userInput = document.getElementById('user-text-input');
    const transcriptArea = document.getElementById('transcript-area');
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');

    // Cek dukungan browser
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;
    if (recognition) {
        recognition.continuous = false;
        recognition.lang = 'id-ID';
        recognition.interimResults = false;
    }

    const appendToTranscript = (text, type) => {
        const entry = document.createElement('div');
        entry.className = `transcript-entry ${type}`;
        entry.textContent = text;
        transcriptArea.appendChild(entry);
        transcriptArea.scrollTop = transcriptArea.scrollHeight;
    };
    
    // --- Logika Text-to-Speech ---
    if (speakBtn) {
        speakBtn.addEventListener('click', () => {
            const textToSpeak = userInput.value;
            if (textToSpeak.trim() === '') return;
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = 'id-ID';
            utterance.onstart = () => {
                statusIndicator.className = 'status-indicator status-speaking';
                statusText.textContent = 'Berbicara...';
            };
            utterance.onend = () => {
                statusIndicator.className = 'status-indicator status-idle';
                statusText.textContent = 'Siap';
            };
            window.speechSynthesis.speak(utterance);
            appendToTranscript(textToSpeak, 'user');
            userInput.value = '';
        });
    }

    // --- Logika Speech-to-Text ---
    if (listenBtn && recognition) {
        listenBtn.addEventListener('click', () => {
            try {
                recognition.start();
            } catch(e) {
                statusText.textContent = 'Error: Mikrofon sudah aktif.';
            }
        });

        recognition.onstart = () => {
            statusIndicator.className = 'status-indicator status-listening';
            statusText.textContent = 'Mendengarkan...';
        };
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            appendToTranscript(transcript, 'interlocutor');
        };
        recognition.onerror = (event) => {
            statusText.textContent = `Error: ${event.error}`;
        };
        recognition.onend = () => {
            statusIndicator.className = 'status-indicator status-idle';
            statusText.textContent = 'Siap';
        };
    } else if (listenBtn) {
        listenBtn.disabled = true;
        listenBtn.innerHTML = '<i class="fas fa-microphone-slash"></i> Browser Tidak Mendukung';
    }
});

const saveBtn = document.getElementById('save-btn');

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
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ transcript: fullTranscript.join('\n') })
        });
        
        if (response.ok) {
            alert('Percakapan berhasil disimpan!');
            transcriptArea.innerHTML = ''; // Kosongkan transkrip setelah disimpan
        } else {
            alert('Gagal menyimpan percakapan.');
        }
    });
}