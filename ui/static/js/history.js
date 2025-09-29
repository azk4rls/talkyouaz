document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/';
        return;
    }

    const historyListContainer = document.getElementById('history-list-container');
    const logoutButton = document.getElementById('logout-button');

    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const fetchAndDisplayHistory = async () => {
        try {
            const response = await fetch('/api/v1/conversations', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Gagal memuat riwayat.');
            }

            const conversations = await response.json();
            historyListContainer.innerHTML = ''; 

            if (!conversations || conversations.length === 0) {
                historyListContainer.innerHTML = '<p>Belum ada riwayat percakapan yang disimpan.</p>';
                return;
            }

            conversations.forEach(convo => {
                const item = document.createElement('div');
                item.className = 'history-item';
                item.dataset.id = convo.id;
                
                const transcriptPreview = convo.transcript.length > 150 
                    ? convo.transcript.substring(0, 150) + '...' 
                    : convo.transcript;

                item.innerHTML = `
                    <div class="history-header">
                        <div>
                            <h3>${convo.title}</h3>
                            <span>${formatDate(convo.created_at)}</span>
                        </div>
                        <button class="delete-btn"><i class="fas fa-trash-alt"></i></button>
                    </div>
                    <div class="history-transcript">
                        ${transcriptPreview.replace(/\n/g, '<br>')}
                    </div>
                `;
                historyListContainer.appendChild(item);
            });

        } catch (error) {
            historyListContainer.innerHTML = `<p>${error.message}</p>`;
        }
    };

    historyListContainer.addEventListener('click', async (e) => {
        if (e.target.closest('.delete-btn')) {
            const historyItem = e.target.closest('.history-item');
            const id = historyItem.dataset.id;
            
            if (confirm('Apakah Anda yakin ingin menghapus percakapan ini secara permanen?')) {
                const response = await fetch(`/api/v1/conversations/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    fetchAndDisplayHistory();
                } else {
                    alert('Gagal menghapus percakapan.');
                }
            }
        }
    });
    
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            alert('Anda telah logout.');
            window.location.href = '/';
        });
    }

    fetchAndDisplayHistory();
});
