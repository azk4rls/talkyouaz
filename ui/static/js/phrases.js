document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/';
        return;
    }

    const addForm = document.getElementById('add-phrase-form');
    const textInput = document.getElementById('phrase-text');
    const phraseList = document.getElementById('phrase-list');

    // Fungsi untuk mengambil dan menampilkan semua frasa
    const fetchAndDisplayPhrases = async () => {
        const response = await fetch('/api/v1/phrases', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const phrases = await response.json();
        
        phraseList.innerHTML = ''; // Kosongkan daftar sebelum mengisi ulang
        phrases.forEach(phrase => {
            const li = document.createElement('li');
            li.className = 'phrase-item';
            li.dataset.id = phrase.id;
            li.innerHTML = `
                <p>${phrase.text}</p>
                <button class="delete-btn"><i class="fas fa-trash-alt"></i></button>
            `;
            phraseList.appendChild(li);
        });
    };

    // Event listener untuk menambah frasa
    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = textInput.value;
        if (!text) return;

        await fetch('/api/v1/phrases', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ text })
        });
        textInput.value = '';
        fetchAndDisplayPhrases(); // Refresh daftar
    });

    // Event listener untuk menghapus frasa (event delegation)
    phraseList.addEventListener('click', async (e) => {
        if (e.target.closest('.delete-btn')) {
            const phraseItem = e.target.closest('.phrase-item');
            const id = phraseItem.dataset.id;
            
            if (confirm('Apakah Anda yakin ingin menghapus frasa ini?')) {
                await fetch(`/api/v1/phrases/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                fetchAndDisplayPhrases(); // Refresh daftar
            }
        }
    });

    // Muat data pertama kali
    fetchAndDisplayPhrases();
});