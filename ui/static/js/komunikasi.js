document.addEventListener('DOMContentLoaded', () => {
    // Keamanan & Elemen Dasar
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
    const saveBtn = document.getElementById('save-btn');
    
    // Elemen untuk Frasa Cepat
    const showPhrasesBtn = document.getElementById('show-phrases-btn');
    const phrasesModal = document.getElementById('phrases-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalPhraseList = document.getElementById('modal-phrase-list');
    let savedPhrases = [];

    // Cek dukungan browser untuk Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;
    if (recognition) {
        recognition.continuous = false;
        recognition.lang = 'id-ID';
        recognition.interimResults = false;
    } else {
        if(listenBtn) {
            listenBtn.disabled = true;
            listenBtn.innerHTML = '<i class="fas fa-microphone-slash"></i> Browser Tidak Mendukung';
        }
    }

    // --- FUNGSI BANTUAN ---
    const appendToTranscript = (text, type) => {
        if (!transcriptArea) return;
        const entry = document.createElement('div');
        entry.className = `transcript-entry ${type}`;
        entry.textContent = text;
        transcriptArea.appendChild(entry);
        transcriptArea.scrollTop = transcriptArea.scrollHeight;
    };
    
    const speakText = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
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
        appendToTranscript(text, 'user');
    };

    // --- LOGIKA UTAMA ---

    // 1. Logika Text-to-Speech (dari tombol Ucapkan)
    if (speakBtn) {
        speakBtn.addEventListener('click', () => {
            const textToSpeak = userInput.value;
            if (textToSpeak.trim() === '') return;
            speakText(textToSpeak);
            userInput.value = '';
        });
    }

    // 2. Logika Speech-to-Text
    if (listenBtn && recognition) {
        listenBtn.addEventListener('click', () => {
            try {
                recognition.start();
            } catch(e) {
                console.error("Error saat memulai recognition:", e);
                statusText.textContent = 'Error: Coba lagi.';
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
        recognition.onend = () => {
            statusIndicator.className = 'status-indicator status-idle';
            statusText.textContent = 'Siap';
        };
        recognition.onerror = (event) => {
            let errorMessage = `Error: ${event.error}`;
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                errorMessage = "Error: Izin mikrofon ditolak.";
                alert("Anda perlu memberikan izin akses mikrofon di browser untuk menggunakan fitur ini.");
            }
            statusText.textContent = errorMessage;
        };
    }

    // 3. Logika Tombol Simpan
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
                transcriptArea.innerHTML = '';
            } else {
                alert('Gagal menyimpan percakapan.');
            }
        });
    }

    // 4. Logika Frasa Cepat
    const fetchPhrases = async () => {
        try {
            // PERBAIKAN: Tambahkan header Authorization di sini
            const response = await fetch('/api/v1/phrases', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                console.error("Gagal mengambil data frasa dari server.");
                return;
            };
            savedPhrases = await response.json();
        } catch (e) {
            console.error("Error saat fetch frasa:", e);
        }
    };

    if (showPhrasesBtn) {
        showPhrasesBtn.addEventListener('click', () => {
            modalPhraseList.innerHTML = '';
            if (savedPhrases.length === 0) {
                modalPhraseList.innerHTML = '<li>Anda belum punya frasa. Tambahkan di menu Frasa Cepat.</li>';
            } else {
                savedPhrases.forEach(phrase => {
                    const li = document.createElement('li');
                    li.textContent = phrase.text;
                    li.dataset.text = phrase.text;
                    modalPhraseList.appendChild(li);
                });
            }
            phrasesModal.style.display = 'flex';
        });
    }

    const hideModal = () => { if (phrasesModal) phrasesModal.style.display = 'none'; };
    if (closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
    if (phrasesModal) phrasesModal.addEventListener('click', (e) => {
        if (e.target === phrasesModal) hideModal();
    });

    if (modalPhraseList) {
        modalPhraseList.addEventListener('click', (e) => {
            if (e.target.tagName === 'LI' && e.target.dataset.text) {
                const text = e.target.dataset.text;
                speakText(text);
                hideModal();
            }
        });
    }

    // Panggil fungsi untuk mengambil data frasa saat halaman dimuat
    fetchPhrases();
});