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

   // --- DATA ALFABET & ANGKA DENGAN EMOJI DAN DETAIL ---
   const alphabetData = [
       {"char": "A", "emoji": "✊", "description": "Kepalan tangan tertutup", "detail": "Untuk huruf A, bentuk kepalan tangan dengan semua jari mengepal rapat. Ini adalah salah satu gesture paling dasar dalam bahasa isyarat."},
       {"char": "B", "emoji": "✋", "description": "Telapak tangan terbuka", "detail": "Untuk huruf B, buka telapak tangan dengan semua jari lurus ke atas. Pastikan jari-jari tidak menyentuh satu sama lain."},
       {"char": "C", "emoji": "🤏", "description": "Tangan membentuk huruf C", "detail": "Untuk huruf C, bentuk tangan seperti huruf C dengan jari-jari melengkung membentuk setengah lingkaran."},
       {"char": "D", "emoji": "👆", "description": "Jari telunjuk ke atas", "detail": "Untuk huruf D, angkat jari telunjuk ke atas sambil menekuk jari-jari lainnya ke dalam telapak tangan."},
       {"char": "E", "emoji": "✋", "description": "Empat jari ke atas", "detail": "Untuk huruf E, angkat empat jari (telunjuk, tengah, manis, kelingking) ke atas sambil menekuk jempol ke dalam."},
       {"char": "F", "emoji": "🤏", "description": "Jempol dan telunjuk bersentuhan", "detail": "Untuk huruf F, sentuhkan ujung jempol dan telunjuk sambil menekuk jari-jari lainnya ke dalam."},
       {"char": "G", "emoji": "👆", "description": "Jari telunjuk ke samping", "detail": "Untuk huruf G, arahkan jari telunjuk ke samping sambil menekuk jari-jari lainnya ke dalam telapak tangan."},
       {"char": "H", "emoji": "✌️", "description": "Jari telunjuk dan tengah", "detail": "Untuk huruf H, angkat jari telunjuk dan tengah ke atas sambil menekuk jari-jari lainnya ke dalam."},
       {"char": "I", "emoji": "☝️", "description": "Jari kelingking ke atas", "detail": "Untuk huruf I, angkat jari kelingking ke atas sambil menekuk jari-jari lainnya ke dalam telapak tangan."},
       {"char": "J", "emoji": "👈", "description": "Jari kelingking bergerak", "detail": "Untuk huruf J, bentuk seperti huruf I lalu gerakkan tangan ke kiri untuk membentuk huruf J."},
       {"char": "K", "emoji": "✌️", "description": "Jari telunjuk dan tengah", "detail": "Untuk huruf K, angkat jari telunjuk dan tengah ke atas sambil menekuk jari-jari lainnya ke dalam."},
       {"char": "L", "emoji": "🤟", "description": "Jari telunjuk dan jempol", "detail": "Untuk huruf L, bentuk tangan seperti huruf L dengan jari telunjuk ke atas dan jempol ke samping."},
       {"char": "M", "emoji": "🤘", "description": "Tiga jari ke bawah", "detail": "Untuk huruf M, tekuk tiga jari (telunjuk, tengah, manis) ke bawah sambil mengangkat jempol dan kelingking."},
       {"char": "N", "emoji": "✌️", "description": "Dua jari ke bawah", "detail": "Untuk huruf N, tekuk dua jari (telunjuk dan tengah) ke bawah sambil mengangkat jempol, manis, dan kelingking."},
       {"char": "O", "emoji": "👌", "description": "Semua jari melingkar", "detail": "Untuk huruf O, bentuk lingkaran dengan semua jari menyentuh ujung jempol."},
       {"char": "P", "emoji": "🤏", "description": "Jari telunjuk dan jempol", "detail": "Untuk huruf P, bentuk seperti huruf F lalu gerakkan tangan ke atas untuk membentuk huruf P."},
       {"char": "Q", "emoji": "👌", "description": "Jari telunjuk dan jempol", "detail": "Untuk huruf Q, bentuk lingkaran dengan jari telunjuk dan jempol sambil mengangkat jari-jari lainnya."},
       {"char": "R", "emoji": "✌️", "description": "Jari telunjuk dan tengah menyilang", "detail": "Untuk huruf R, silangkan jari telunjuk di atas jari tengah sambil menekuk jari-jari lainnya ke dalam."},
       {"char": "S", "emoji": "✊", "description": "Kepalan tangan tertutup", "detail": "Untuk huruf S, bentuk kepalan tangan dengan semua jari mengepal rapat, sama seperti huruf A."},
       {"char": "T", "emoji": "✋", "description": "Jari telunjuk di antara jari tengah", "detail": "Untuk huruf T, letakkan jari telunjuk di antara jari tengah dan manis sambil mengangkat jempol dan kelingking."},
       {"char": "U", "emoji": "✌️", "description": "Jari telunjuk dan tengah", "detail": "Untuk huruf U, angkat jari telunjuk dan tengah ke atas sambil menekuk jari-jari lainnya ke dalam."},
       {"char": "V", "emoji": "✌️", "description": "Jari telunjuk dan tengah", "detail": "Untuk huruf V, angkat jari telunjuk dan tengah ke atas membentuk huruf V sambil menekuk jari-jari lainnya ke dalam."},
       {"char": "W", "emoji": "🤟", "description": "Tiga jari ke atas", "detail": "Untuk huruf W, angkat tiga jari (telunjuk, tengah, manis) ke atas sambil menekuk jempol dan kelingking ke dalam."},
       {"char": "X", "emoji": "✌️", "description": "Jari telunjuk menyilang", "detail": "Untuk huruf X, tekuk jari telunjuk ke dalam sambil mengangkat jari-jari lainnya ke atas."},
       {"char": "Y", "emoji": "🤟", "description": "Jari kelingking dan jempol", "detail": "Untuk huruf Y, angkat jari kelingking dan jempol ke atas sambil menekuk jari-jari lainnya ke dalam."},
       {"char": "Z", "emoji": "👆", "description": "Jari telunjuk bergerak", "detail": "Untuk huruf Z, bentuk seperti huruf D lalu gerakkan tangan untuk membentuk huruf Z."}
   ];

   const numbersData = [
       {"char": "1", "emoji": "☝️", "description": "Jari telunjuk ke atas", "detail": "Untuk angka 1, angkat jari telunjuk ke atas sambil menekuk jari-jari lainnya ke dalam telapak tangan."},
       {"char": "2", "emoji": "✌️", "description": "Jari telunjuk dan tengah", "detail": "Untuk angka 2, angkat jari telunjuk dan tengah ke atas sambil menekuk jari-jari lainnya ke dalam."},
       {"char": "3", "emoji": "🤟", "description": "Tiga jari ke atas", "detail": "Untuk angka 3, angkat tiga jari (telunjuk, tengah, manis) ke atas sambil menekuk jempol dan kelingking ke dalam."},
       {"char": "4", "emoji": "✋", "description": "Empat jari ke atas", "detail": "Untuk angka 4, angkat empat jari (telunjuk, tengah, manis, kelingking) ke atas sambil menekuk jempol ke dalam."},
       {"char": "5", "emoji": "✋", "description": "Semua jari terbuka", "detail": "Untuk angka 5, buka semua jari ke atas dengan telapak tangan menghadap ke depan."},
       {"char": "6", "emoji": "🤙", "description": "Jempol dan lima jari", "detail": "Untuk angka 6, bentuk tangan seperti angka 5 lalu tekuk jari telunjuk ke dalam."},
       {"char": "7", "emoji": "🤏", "description": "Jempol dan telunjuk", "detail": "Untuk angka 7, bentuk tangan seperti angka 6 lalu tekuk jari tengah ke dalam."},
       {"char": "8", "emoji": "🤘", "description": "Jempol dan tiga jari", "detail": "Untuk angka 8, bentuk tangan seperti angka 7 lalu tekuk jari manis ke dalam."},
       {"char": "9", "emoji": "✋", "description": "Jempol dan empat jari", "detail": "Untuk angka 9, bentuk tangan seperti angka 8 lalu tekuk jari kelingking ke dalam."},
       {"char": "10", "emoji": "✊", "description": "Kepalan tangan tertutup", "detail": "Untuk angka 10, bentuk kepalan tangan dengan semua jari mengepal rapat, sama seperti huruf A."}
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
           card.style.cursor = 'pointer';
           
           // Visual area dengan emoji dan deskripsi
           const visualArea = document.createElement('div');
           visualArea.className = 'learning-card-visual';
           visualArea.innerHTML = `
               <div class="gesture-emoji">${item.emoji}</div>
               <div class="gesture-description">${item.description}</div>
           `;
           
           const content = document.createElement('div');
           content.className = 'learning-card-content';
           content.innerHTML = `<h3>${item.char}</h3>`;
           
           // Click handler untuk popup
           card.addEventListener('click', () => {
               showDetailPopup(item);
           });
           
           card.appendChild(visualArea);
           card.appendChild(content);
           gridElement.appendChild(card);
       });
   };

   // Fungsi untuk menampilkan popup detail
   const showDetailPopup = (item) => {
       // Buat modal overlay
       const overlay = document.createElement('div');
       overlay.className = 'popup-overlay';
       overlay.innerHTML = `
           <div class="popup-modal">
               <div class="popup-header">
                   <h2>${item.char}</h2>
                   <button class="popup-close">&times;</button>
               </div>
               <div class="popup-content">
                   <div class="popup-emoji">${item.emoji}</div>
                   <div class="popup-description">
                       <h3>${item.description}</h3>
                       <p>${item.detail}</p>
                   </div>
               </div>
           </div>
       `;
       
       document.body.appendChild(overlay);
       
       // Close button handler
       const closeBtn = overlay.querySelector('.popup-close');
       closeBtn.addEventListener('click', () => {
           document.body.removeChild(overlay);
       });
       
       // Overlay click handler
       overlay.addEventListener('click', (e) => {
           if (e.target === overlay) {
               document.body.removeChild(overlay);
           }
       });
       
       // ESC key handler
       const handleEsc = (e) => {
           if (e.key === 'Escape') {
               document.body.removeChild(overlay);
               document.removeEventListener('keydown', handleEsc);
           }
       };
       document.addEventListener('keydown', handleEsc);
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