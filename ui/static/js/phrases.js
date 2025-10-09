document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/';
        return;
    }

    // --- Ambil Elemen ---
    const addForm = document.getElementById('add-phrase-form');
    const textInput = document.getElementById('phrase-text');
    const phraseList = document.getElementById('phrase-list');
    const logoutButton = document.getElementById('logout-button');

    // --- Logika Logout ---
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            alert('Anda telah logout.');
            window.location.href = '/';
        });
    }

    // --- Fungsi Utama ---

    // Fungsi untuk mengambil dan menampilkan semua frasa
    const fetchAndDisplayPhrases = async () => {
        try {
            const response = await fetch('/api/v1/phrases', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                throw new Error('Gagal memuat data dari server.');
            }

            const phrases = await response.json();
            
            phraseList.innerHTML = ''; // Kosongkan daftar sebelum mengisi ulang
            
            if (phrases.length === 0) {
                phraseList.innerHTML = '<li class="empty-state">Belum ada frasa yang disimpan.</li>';
                return;
            }

            phrases.forEach(phrase => {
                const li = document.createElement('li');
                li.className = 'phrase-item';
                li.dataset.id = phrase.id;
                li.innerHTML = `
                    <p>${escapeHTML(phrase.text)}</p>
                    <button class="delete-btn"><i class="fas fa-trash-alt"></i></button>
                `;
                phraseList.appendChild(li);
            });
        } catch (error) {
            console.error("Error fetching phrases:", error);
            phraseList.innerHTML = '<li class="empty-state error">Gagal memuat frasa. Coba refresh halaman.</li>';
        }
    };

    // Event listener untuk menambah frasa
    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = textInput.value.trim();
        if (!text) return;

        try {
            const response = await fetch('/api/v1/phrases', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                throw new Error('Server menolak permintaan.');
            }

            textInput.value = '';
            fetchAndDisplayPhrases(); // Refresh daftar
        } catch (error) {
            console.error("Error creating phrase:", error);
            alert('Gagal menambahkan frasa.');
        }
    });

    // Event listener untuk menghapus frasa
    phraseList.addEventListener('click', async (e) => {
        if (e.target.closest('.delete-btn')) {
            const phraseItem = e.target.closest('.phrase-item');
            const id = phraseItem.dataset.id;
            
            if (confirm('Apakah Anda yakin ingin menghapus frasa ini?')) {
                try {
                    const response = await fetch(`/api/v1/phrases/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (!response.ok) {
                        throw new Error('Server gagal menghapus frasa.');
                    }

                    fetchAndDisplayPhrases(); // Refresh daftar
                } catch (error) {
                    console.error("Error deleting phrase:", error);
                    alert('Gagal menghapus frasa.');
                }
            }
        }
    });

    // Fungsi kecil untuk keamanan, mencegah XSS
    const escapeHTML = (str) => {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    };

    // Muat data pertama kali
    fetchAndDisplayPhrases();
});