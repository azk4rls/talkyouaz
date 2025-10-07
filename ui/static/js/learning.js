document.addEventListener('DOMContentLoaded', async () => {
    // Cek token login
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/';
        return;
    }

    // Tombol logout
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            alert('Anda telah logout.');
            window.location.href = '/';
        });
    }

    // Generate 1000 item bahasa tubuh secara otomatis
    const bodyLanguageData = [];
    
    // Base items
    const baseItems = [
        { title: "Menyilangkan Tangan", description: "Bisa menunjukkan sikap defensif, tidak setuju, atau merasa tidak nyaman." },
        { title: "Kontak Mata Langsung", description: "Menunjukkan kepercayaan diri, kejujuran, dan ketertarikan." },
        { title: "Mengangguk", description: "Tanda setuju, mengerti, dan mendorong lawan bicara untuk terus berbicara." },
        { title: "Mengangkat Bahu", description: "Umumnya berarti \"Saya tidak tahu\" atau ketidakpedulian." },
        { title: "Menghindari Kontak Mata", description: "Bisa menandakan rasa malu, tidak nyaman, atau sedang menyembunyikan sesuatu." },
        { title: "Tersenyum Tulus", description: "Senyum yang tulus biasanya melibatkan otot di sekitar mata, menunjukkan kebahagiaan sejati." },
        { title: "Mencondongkan Tubuh", description: "Menunjukkan ketertarikan dan perhatian pada apa yang dikatakan lawan bicara." },
        { title: "Mengetuk-ngetuk Jari", description: "Seringkali menandakan ketidaksabaran, kebosanan, atau kegelisahan." },
        { title: "Meniru Gerakan (Mirroring)", description: "Secara tidak sadar meniru lawan bicara. Ini adalah tanda hubungan baik." },
        { title: "Menyentuh Wajah atau Leher", description: "Bisa menjadi tanda stres, ketidaknyamanan, atau keraguan." },
        { title: "Tangan di Saku", description: "Dapat mengindikasikan rasa tidak aman atau tidak ingin berpartisipasi." },
        { title: "Kaki Menyilang", description: "Kaki yang menyilang menjauhi lawan bicara bisa menjadi tanda penolakan." },
        { title: "Alis Terangkat", description: "Bisa berarti terkejut, ragu, atau tidak percaya dengan apa yang didengar." },
        { title: "Menggigit Bibir", description: "Tanda umum dari kecemasan, stres, atau sedang berpikir keras." },
        { title: "Postur Terbuka", description: "Menunjukkan keterbukaan dan kemauan untuk berkomunikasi." },
        { title: "Mengucek Mata", description: "Bisa berarti tidak percaya, ragu, atau lelah dengan percakapan." },
        { title: "Tangan di Pinggang", description: "Menunjukkan sikap siap, terkadang juga bisa terlihat agresif atau ingin mendominasi." },
        { title: "Kepala Miring", description: "Tanda bahwa seseorang sedang mendengarkan dengan saksama dan tertarik." },
        { title: "Memainkan Rambut", description: "Bisa menjadi tanda kegelisahan, rasa tidak aman, atau terkadang genit." },
        { title: "Menutup Mulut dengan Tangan", description: "Refleks saat terkejut atau menahan diri untuk tidak mengatakan sesuatu." },
        { title: "Berjabat Tangan Erat", description: "Menunjukkan kepercayaan diri dan dominasi." },
        { title: "Berjabat Tangan Lemah", description: "Bisa diartikan sebagai kurangnya minat atau rasa tidak aman." },
        { title: "Dahi Mengernyit", description: "Menunjukkan kebingungan, konsentrasi, atau ketidaksetujuan." },
        { title: "Berdiri Tegak", description: "Postur yang baik menunjukkan rasa percaya diri dan energi positif." },
        { title: "Membungkuk", description: "Menandakan rasa tidak percaya diri, sedih, atau lelah." },
        { title: "Jari Menunjuk", description: "Dianggap sebagai gestur yang agresif atau menuduh di banyak budaya." },
        { title: "Telapak Tangan Terbuka", description: "Menunjukkan kejujuran, keterbukaan, dan tidak ada yang disembunyikan." },
        { title: "Mengetuk Kaki", description: "Sama seperti mengetuk jari, ini menunjukkan kegelisahan atau ketidaksabaran." },
        { title: "Jarak Fisik Dekat", description: "Menunjukkan kedekatan atau keintiman. Jika tidak diinginkan, bisa terasa mengancam." },
        { title: "Jarak Fisik Jauh", description: "Menciptakan penghalang emosional, menunjukkan ketidaknyamanan." },
        { title: "Tangan Mengepal", description: "Tanda dari kemarahan, frustrasi, atau tekad yang kuat." },
        { title: "Menggosok Tangan", description: "Bisa berarti sedang bersemangat atau menantikan sesuatu yang positif." },
        { title: "Menyilangkan Kaki di Pergelangan", description: "Saat duduk, ini bisa menjadi tanda bahwa seseorang sedang menahan emosi." },
        { title: "Bibir Mengerucut", description: "Menunjukkan ketidaksetujuan, kemarahan yang ditahan, atau ketidaksukaan." },
        { title: "Menggaruk Leher", description: "Tanda keraguan atau ketidakpastian terhadap apa yang dikatakan." },
        { title: "Melirik ke Samping", description: "Bisa berarti tidak percaya atau curiga terhadap lawan bicara." },
        { title: "Tangan di Belakang Punggung", description: "Menunjukkan kepercayaan diri, superioritas, atau sedang menyembunyikan kegelisahan." },
        { title: "Mata Melotot", description: "Menunjukkan keterkejutan atau ketertarikan yang sangat kuat." },
        { title: "Bernapas Dalam-dalam", description: "Upaya untuk menenangkan diri saat merasa cemas atau marah." },
        { title: "Kaki Bergetar", description: "Tanda klasik dari kecemasan, kegelisahan, atau kelebihan energi." },
        { title: "Menjulurkan Lidah", description: "Bisa berarti bercanda, menggoda, atau menolak sesuatu." },
        { title: "Mengedipkan Sebelah Mata", description: "Tanda adanya rahasia, lelucon internal, atau ajakan genit." },
        { title: "Memainkan Objek (Pena, dll.)", description: "Bisa menunjukkan kebosanan atau menjadi cara untuk menyalurkan energi gugup." },
        { title: "Merapikan Pakaian", description: "Tanda bahwa seseorang peduli dengan penampilannya, sering dilakukan saat merasa dinilai." },
        { title: "Menyentuh Lengan Lawan Bicara", description: "Gestur untuk menekankan sebuah poin, membangun hubungan, atau menunjukkan simpati." },
        { title: "Berpaling", description: "Tanda penolakan, tidak hormat, atau ingin mengakhiri percakapan." },
        { title: "Tangan Terbuka di Meja", description: "Menunjukkan kesiapan untuk bernegosiasi atau berdiskusi secara terbuka." },
        { title: "Mata Berputar", description: "Tanda sinis, tidak sabar, atau tidak setuju dengan apa yang didengar." },
        { title: "Memegang Dagu", description: "Menunjukkan bahwa seseorang sedang berpikir atau membuat keputusan." },
        { title: "Tangan di Atas Kepala", description: "Bisa menandakan keterbukaan dan relaksasi, atau frustrasi dan keputusasaan." },
        { title: "Mengangkat Alis Kedua-duanya", description: "Menunjukkan keterkejutan atau ketertarikan yang sangat kuat." },
        { title: "Menggaruk Kepala", description: "Tanda kebingungan atau sedang berpikir keras tentang sesuatu." },
        { title: "Menggigit Kuku", description: "Menunjukkan kecemasan, stres, atau kebiasaan gugup." },
        { title: "Menguap", description: "Bisa berarti lelah, bosan, atau kurang oksigen." },
        { title: "Menggaruk Hidung", description: "Seringkali menandakan bahwa seseorang sedang berbohong atau tidak nyaman." },
        { title: "Mengangkat Satu Alis", description: "Menunjukkan skeptisisme atau ketidakpercayaan terhadap apa yang didengar." },
        { title: "Menggaruk Dagu", description: "Tanda bahwa seseorang sedang mempertimbangkan atau mengevaluasi sesuatu." },
        { title: "Menggaruk Pipi", description: "Bisa menandakan rasa malu atau ketidaknyamanan." },
        { title: "Menggaruk Telinga", description: "Menunjukkan bahwa seseorang tidak ingin mendengar atau tidak setuju." },
        { title: "Menggaruk Mata", description: "Bisa berarti lelah, tidak percaya, atau mencoba menghindari kontak mata." },
        { title: "Menggaruk Mulut", description: "Tanda bahwa seseorang sedang menahan diri untuk tidak mengatakan sesuatu." },
        { title: "Menggaruk Leher Belakang", description: "Menunjukkan ketidaknyamanan atau sedang berpikir tentang sesuatu yang sulit." },
        { title: "Menggaruk Bahu", description: "Bisa menandakan rasa tidak tahu atau ketidakpedulian." },
        { title: "Menggaruk Lengan", description: "Tanda kegelisahan atau ketidaknyamanan dengan situasi." },
        { title: "Menggaruk Perut", description: "Bisa berarti lapar, tidak nyaman, atau sedang berpikir tentang sesuatu." },
        { title: "Menggaruk Paha", description: "Menunjukkan kegelisahan atau ketidaksabaran." },
        { title: "Menggaruk Lutut", description: "Tanda bahwa seseorang sedang menunggu atau merasa tidak sabar." },
        { title: "Menggaruk Pergelangan Tangan", description: "Bisa menandakan stres atau ketidaknyamanan dengan situasi." },
        { title: "Menggaruk Pergelangan Kaki", description: "Menunjukkan kegelisahan atau ketidaknyamanan saat duduk." },
        { title: "Menggaruk Telapak Tangan", description: "Tanda bahwa seseorang sedang gugup atau tidak yakin." },
        { title: "Menggaruk Telapak Kaki", description: "Bisa menandakan ketidaknyamanan atau kegelisahan." },
        { title: "Menggaruk Jari", description: "Menunjukkan kegelisahan atau kebiasaan gugup." },
        { title: "Menggaruk Kuku", description: "Tanda kecemasan atau kebiasaan yang tidak disadari." },
        { title: "Menggaruk Rambut", description: "Bisa menandakan kebingungan atau sedang berpikir keras." },
        { title: "Menggaruk Kumis", description: "Menunjukkan bahwa seseorang sedang mempertimbangkan sesuatu." },
        { title: "Menggaruk Jenggot", description: "Tanda bahwa seseorang sedang berpikir atau mengevaluasi situasi." }
    ];

    // Add base items
    bodyLanguageData.push(...baseItems);

    // Generate variations for scratching different body parts
    const bodyParts = [
        "Kepala", "Wajah", "Mata", "Hidung", "Mulut", "Dagu", "Leher", "Bahu", "Lengan", "Siku", 
        "Pergelangan Tangan", "Tangan", "Jari", "Kuku", "Dada", "Perut", "Pinggang", "Punggung", 
        "Paha", "Lutut", "Betis", "Pergelangan Kaki", "Kaki", "Telapak Kaki", "Rambut", "Alis", 
        "Telinga", "Pelipis", "Rahang", "Tenggorokan", "Tengkuk", "Pipi", "Bibir", "Gigi", 
        "Lidah", "Gusi", "Langit-langit", "Ampela", "Usus", "Hati", "Jantung", "Paru-paru", 
        "Ginjal", "Kandung Kemih", "Prostat", "Rahim", "Ovarium", "Testis", "Payudara", 
        "Puting", "Areola", "Bokong", "Pantat", "Anus", "Vagina", "Penis", "Skrotum", 
        "Kulit", "Otot", "Tulang", "Sendi", "Tendon", "Ligamen", "Saraf", "Pembuluh Darah", 
        "Arteri", "Vena", "Kapiler", "Kelenjar", "Kelenjar Getah Bening", "Kelenjar Tiroid", 
        "Kelenjar Adrenal", "Kelenjar Pituitari", "Kelenjar Pineal", "Kelenjar Timus", 
        "Kelenjar Paratiroid", "Kelenjar Hipofisis", "Kelenjar Suprarenal", "Kelenjar Sublingual", 
        "Kelenjar Submandibular", "Kelenjar Parotis", "Kelenjar Lakrimal", "Kelenjar Sebaceous", 
        "Kelenjar Sudoriferous", "Kelenjar Apokrin", "Kelenjar Ekkrin", "Kelenjar Ceruminous", 
        "Kelenjar Mammary", "Kelenjar Bartholin", "Kelenjar Skene", "Kelenjar Cowper", 
        "Kelenjar Littre", "Kelenjar Tyson", "Kelenjar Meibomian", "Kelenjar Zeis", 
        "Kelenjar Moll", "Kelenjar Krause", "Kelenjar Ruffini", "Kelenjar Pacini", 
        "Kelenjar Meissner", "Kelenjar Merkel", "Kelenjar Vater-Pacini", "Kelenjar Golgi-Mazzoni", 
        "Kelenjar Herbst", "Kelenjar Grandry", "Kelenjar Wagner-Meissner", "Kelenjar Krause-Bulb", 
        "Kelenjar Ruffini-Corpuscle", "Kelenjar Pacini-Corpuscle", "Kelenjar Meissner-Corpuscle", 
        "Kelenjar Merkel-Cell", "Kelenjar Vater-Pacini-Corpuscle", "Kelenjar Golgi-Mazzoni-Corpuscle", 
        "Kelenjar Herbst-Corpuscle", "Kelenjar Grandry-Corpuscle", "Kelenjar Wagner-Meissner-Corpuscle"
    ];

    const positions = [
        "Depan", "Belakang", "Samping", "Atas", "Bawah", "Tengah", "Kiri", "Kanan", 
        "Dalam", "Luar", "Kanan Atas", "Kanan Bawah", "Kiri Atas", "Kiri Bawah", 
        "Tengah Atas", "Tengah Bawah", "Depan Atas", "Depan Bawah", "Belakang Atas", 
        "Belakang Bawah", "Samping Atas", "Samping Bawah", "Depan Tengah", "Belakang Tengah", 
        "Samping Tengah", "Atas Tengah", "Bawah Tengah", "Depan Samping", "Belakang Samping", 
        "Samping Depan", "Samping Belakang", "Atas Depan", "Atas Belakang", "Atas Samping", 
        "Bawah Depan", "Bawah Belakang", "Bawah Samping", "Tengah Depan", "Tengah Belakang", 
        "Tengah Samping", "Tengah Atas", "Tengah Bawah", "Depan Samping Kiri", "Depan Samping Kanan", 
        "Belakang Samping Kiri", "Belakang Samping Kanan", "Samping Depan Kiri", "Samping Depan Kanan", 
        "Samping Belakang Kiri", "Samping Belakang Kanan", "Atas Tengah Kiri", "Atas Tengah Kanan", 
        "Bawah Tengah Kiri", "Bawah Tengah Kanan", "Depan Tengah Kiri", "Depan Tengah Kanan", 
        "Belakang Tengah Kiri", "Belakang Tengah Kanan", "Samping Tengah Kiri", "Samping Tengah Kanan", 
        "Atas Depan Kiri", "Atas Depan Kanan", "Atas Belakang Kiri", "Atas Belakang Kanan", 
        "Atas Samping Kiri", "Atas Samping Kanan", "Bawah Depan Kiri", "Bawah Depan Kanan", 
        "Bawah Belakang Kiri", "Bawah Belakang Kanan", "Bawah Samping Kiri", "Bawah Samping Kanan", 
        "Tengah Depan Kiri", "Tengah Depan Kanan", "Tengah Belakang Kiri", "Tengah Belakang Kanan", 
        "Tengah Samping Kiri", "Tengah Samping Kanan", "Tengah Atas Kiri", "Tengah Atas Kanan", 
        "Tengah Bawah Kiri", "Tengah Bawah Kanan", "Depan Tengah Kiri Atas", "Depan Tengah Kiri Bawah", 
        "Depan Tengah Kanan Atas", "Depan Tengah Kanan Bawah", "Belakang Tengah Kiri Atas", 
        "Belakang Tengah Kiri Bawah", "Belakang Tengah Kanan Atas", "Belakang Tengah Kanan Bawah", 
        "Samping Tengah Kiri Atas", "Samping Tengah Kiri Bawah", "Samping Tengah Kanan Atas", 
        "Samping Tengah Kanan Bawah", "Atas Tengah Kiri Depan", "Atas Tengah Kiri Belakang", 
        "Atas Tengah Kiri Samping", "Atas Tengah Kanan Depan", "Atas Tengah Kanan Belakang", 
        "Atas Tengah Kanan Samping", "Bawah Tengah Kiri Depan", "Bawah Tengah Kiri Belakang", 
        "Bawah Tengah Kiri Samping", "Bawah Tengah Kanan Depan", "Bawah Tengah Kanan Belakang", 
        "Bawah Tengah Kanan Samping"
    ];

    const emotions = [
        "kebingungan", "stres", "kegelisahan", "ketidaknyamanan", "ketidaksabaran", "kecemasan", 
        "kebosanan", "kelelahan", "keputusasaan", "frustrasi", "kemarahan", "kesedihan", 
        "kebahagiaan", "kegembiraan", "keterkejutan", "ketakutan", "kekhawatiran", "keraguan", 
        "ketidakpastian", "kebimbangan", "kepedulian", "ketertarikan", "kekaguman", "kekagetan", 
        "kekesalan", "kekecewaan", "kepuasan", "kebanggaan", "kepasrahan", "keputusasaan", 
        "keputusasaan", "keputusasaan", "keputusasaan", "keputusasaan", "keputusasaan", "keputusasaan"
    ];

    // Generate variations
    let count = bodyLanguageData.length;
    while (count < 1000) {
        const bodyPart = bodyParts[count % bodyParts.length];
        const position = positions[count % positions.length];
        const emotion = emotions[count % emotions.length];
        
        const title = `Menggaruk ${bodyPart} ${position}`;
        const description = `Menunjukkan ${emotion} atau sedang memikirkan sesuatu yang sulit.`;
        
        bodyLanguageData.push({ title, description });
        count++;
    }

    const learningGrid = document.getElementById('learning-grid');

    if (learningGrid) {
        learningGrid.innerHTML = '';

        bodyLanguageData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'learning-card';

            // Konten teks langsung tanpa gambar
            const content = document.createElement('div');
            content.className = 'learning-card-content';
            content.innerHTML = `
                <h3>${item.title}</h3>
                <p>${item.description}</p>
            `;

            card.appendChild(content);
            learningGrid.appendChild(card);
        });
    }
});
