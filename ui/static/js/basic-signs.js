document.addEventListener('DOMContentLoaded', () => {
   // Keamanan dasar - untuk halaman belajar, kita tidak perlu token ketat
   const token = localStorage.getItem('authToken');
   if (!token) {
       console.log('No auth token found, but continuing for learning page');
   }
   
   const logoutButton = document.getElementById('logout-button');
   if(logoutButton) {
       logoutButton.addEventListener('click', () => {
           localStorage.removeItem('authToken');
           alert('Anda telah logout.');
           window.location.href = '/';
       });
   }

   // Ambil elemen grid dari HTML
   const alphabetGrid = document.getElementById('alphabet-grid');
   const numberGrid = document.getElementById('number-grid');

   // --- DATA ALFABET & ANGKA (LANGSUNG DI DALAM JS) ---
   const alphabetData = [
       {"char": "A", "gif_url": "https://bisindo.id/storage/videos/A.gif"},
       {"char": "B", "gif_url": "https://bisindo.id/storage/videos/B.gif"},
       {"char": "C", "gif_url": "https://bisindo.id/storage/videos/C.gif"},
       {"char": "D", "gif_url": "https://bisindo.id/storage/videos/D.gif"},
       {"char": "E", "gif_url": "https://bisindo.id/storage/videos/E.gif"},
       {"char": "F", "gif_url": "https://bisindo.id/storage/videos/F.gif"},
       {"char": "G", "gif_url": "https://bisindo.id/storage/videos/G.gif"},
       {"char": "H", "gif_url": "https://bisindo.id/storage/videos/H.gif"},
       {"char": "I", "gif_url": "https://bisindo.id/storage/videos/I.gif"},
       {"char": "J", "gif_url": "https://bisindo.id/storage/videos/J.gif"},
       {"char": "K", "gif_url": "https://bisindo.id/storage/videos/K.gif"},
       {"char": "L", "gif_url": "https://bisindo.id/storage/videos/L.gif"},
       {"char": "M", "gif_url": "https://bisindo.id/storage/videos/M.gif"},
       {"char": "N", "gif_url": "https://bisindo.id/storage/videos/N.gif"},
       {"char": "O", "gif_url": "https://bisindo.id/storage/videos/O.gif"},
       {"char": "P", "gif_url": "https://bisindo.id/storage/videos/P.gif"},
       {"char": "Q", "gif_url": "https://bisindo.id/storage/videos/Q.gif"},
       {"char": "R", "gif_url": "https://bisindo.id/storage/videos/R.gif"},
       {"char": "S", "gif_url": "https://bisindo.id/storage/videos/S.gif"},
       {"char": "T", "gif_url": "https://bisindo.id/storage/videos/T.gif"},
       {"char": "U", "gif_url": "https://bisindo.id/storage/videos/U.gif"},
       {"char": "V", "gif_url": "https://bisindo.id/storage/videos/V.gif"},
       {"char": "W", "gif_url": "https://bisindo.id/storage/videos/W.gif"},
       {"char": "X", "gif_url": "https://bisindo.id/storage/videos/X.gif"},
       {"char": "Y", "gif_url": "https://bisindo.id/storage/videos/Y.gif"},
       {"char": "Z", "gif_url": "https://bisindo.id/storage/videos/Z.gif"}
   ];

   const numbersData = [
       {"char": "1", "gif_url": "https://bisindo.id/storage/videos/1.gif"},
       {"char": "2", "gif_url": "https://bisindo.id/storage/videos/2.gif"},
       {"char": "3", "gif_url": "https://bisindo.id/storage/videos/3.gif"},
       {"char": "4", "gif_url": "https://bisindo.id/storage/videos/4.gif"},
       {"char": "5", "gif_url": "https://bisindo.id/storage/videos/5.gif"},
       {"char": "6", "gif_url": "https://bisindo.id/storage/videos/6.gif"},
       {"char": "7", "gif_url": "https://bisindo.id/storage/videos/7.gif"},
       {"char": "8", "gif_url": "https://bisindo.id/storage/videos/8.gif"},
       {"char": "9", "gif_url": "https://bisindo.id/storage/videos/9.gif"},
       {"char": "10", "gif_url": "https://bisindo.id/storage/videos/10.gif"}
   ];

   /**
    * Fungsi untuk merender (menampilkan) kartu ke dalam sebuah grid.
    * @param {Array} data - Array berisi data (misal: data alfabet).
    * @param {HTMLElement} gridElement - Elemen div grid tempat kartu akan ditampilkan.
    */
   const renderGrid = (data, gridElement) => {
       if (!gridElement) {
           console.error('Grid element not found');
           return;
       }
       gridElement.innerHTML = '';

       data.forEach(item => {
           const card = document.createElement('div');
           card.className = 'learning-card';
           
           const img = document.createElement('img');
           img.src = item.gif_url;
           img.alt = `Isyarat untuk ${item.char}`;
           img.className = 'learning-card-gif';
           
           // Fallback jika gambar gagal dimuat
           img.onerror = () => {
               img.src = `https://via.placeholder.com/120x120/4a90e2/ffffff?text=${item.char}`;
               img.style.backgroundColor = '#f8f9fa';
           };
           
           const content = document.createElement('div');
           content.className = 'learning-card-content';
           content.innerHTML = `<h3>${item.char}</h3>`;
           
           card.appendChild(img);
           card.appendChild(content);
           gridElement.appendChild(card);
       });
   };

   // --- Inisialisasi Halaman ---
   console.log('Initializing basic signs page...');
   console.log('Alphabet grid:', alphabetGrid);
   console.log('Number grid:', numberGrid);
   
   // Langsung panggil fungsi render dengan data yang sudah ada di atas
   renderGrid(alphabetData, alphabetGrid);
   renderGrid(numbersData, numberGrid);
   
   console.log('Page initialized successfully');
});