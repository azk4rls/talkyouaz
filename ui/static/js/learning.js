document.addEventListener('DOMContentLoaded', async () => {
    // Keamanan dasar & inisialisasi
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

    // Data untuk galeri, dengan 50 entri teks dan link GIF langsung
    const bodyLanguageData = [
        { title: "Menyilangkan Tangan", gif_url: "https://media.giphy.com/media/l1J9RNBh3Q22m62m4/giphy.gif", description: "Bisa menunjukkan sikap defensif, tidak setuju, atau merasa tidak nyaman." },
        { title: "Kontak Mata Langsung", gif_url: "https://media.giphy.com/media/3o7527pa7qs9kCG78A/giphy.gif", description: "Menunjukkan kepercayaan diri, kejujuran, dan ketertarikan." },
        { title: "Mengangguk", gif_url: "https://media.giphy.com/media/kFgzrD4n2b1DETWNF4/giphy.gif", description: "Tanda setuju, mengerti, dan mendorong lawan bicara untuk terus berbicara." },
        { title: "Mengangkat Bahu", gif_url: "https://media.giphy.com/media/3o7TKU8i3B8jftw62I/giphy.gif", description: "Umumnya berarti \"Saya tidak tahu\" atau ketidakpedulian." },
        { title: "Menghindari Kontak Mata", gif_url: "https://media.giphy.com/media/a93jwI0wkWTQs/giphy.gif", description: "Bisa menandakan rasa malu, tidak nyaman, atau sedang menyembunyikan sesuatu." },
        { title: "Tersenyum Tulus", gif_url: "https://media.giphy.com/media/3_p5hQ2EYT2Qo/giphy.gif", description: "Senyum yang tulus biasanya melibatkan otot di sekitar mata, menunjukkan kebahagiaan sejati." },
        { title: "Mencondongkan Tubuh", gif_url: "https://media.giphy.com/media/l0NwNTEhrb22i256E/giphy.gif", description: "Menunjukkan ketertarikan dan perhatian pada apa yang dikatakan lawan bicara." },
        { title: "Mengetuk-ngetuk Jari", gif_url: "https://media.giphy.com/media/13g2s83k2m2I5G/giphy.gif", description: "Seringkali menandakan ketidaksabaran, kebosanan, atau kegelisahan." },
        { title: "Meniru Gerakan (Mirroring)", gif_url: "https://media.giphy.com/media/iGpkO05xWTl17Vhq9Y/giphy.gif", description: "Secara tidak sadar meniru lawan bicara. Ini adalah tanda hubungan baik." },
        { title: "Menyentuh Wajah atau Leher", gif_url: "https://media.giphy.com/media/LRcstfUhS2s3sFpDX9/giphy.gif", description: "Bisa menjadi tanda stres, ketidaknyamanan, atau keraguan." },
        { title: "Tangan di Saku", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z0OXBzbGZqdTlqc3ZldmNqNGR4MXhsbGlzZ2F6MG5xdzhzc3o0eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l1J9RNBh3Q22m62m4/giphy.gif", description: "Dapat mengindikasikan rasa tidak aman atau tidak ingin berpartisipasi." },
        { title: "Kaki Menyilang", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExajM0bXp5Z29uZHpxMGN4dTFtb2Q5bmF5dXZqOHpmNHl6bmM1MWFqYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0NwNTEhrb22i256E/giphy.gif", description: "Kaki yang menyilang menjauhi lawan bicara bisa menjadi tanda penolakan." },
        { title: "Alis Terangkat", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGI3amVlMnZ5M3Q3dm1pNGFqYWx5d3I0Nmc2azFjZHVtaW9icHhjbSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKU8i3B8jftw62I/giphy.gif", description: "Bisa berarti terkejut, ragu, atau tidak percaya dengan apa yang didengar." },
        { title: "Menggigit Bibir", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY3hncGF3M3N0a2l4c3A5ODU5c3d2MTZmaDRtY2ZkaGZvZzNmMjhyNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LRcstfUhS2s3sFpDX9/giphy.gif", description: "Tanda umum dari kecemasan, stres, atau sedang berpikir keras." },
        { title: "Postur Terbuka", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Vub3VnZGNjaG9oZzY0MDF2aGZmMmZ1N3p5emg3aXNvb3RkNnphcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3_p5hQ2EYT2Qo/giphy.gif", description: "Menunjukkan keterbukaan dan kemauan untuk berkomunikasi." },
        { title: "Mengucek Mata", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzdrNmZqdW03ejI0eGJjM2RscXJmdzdsMWF1ZHRyMDllMWFjc2M4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/a93jwI0wkWTQs/giphy.gif", description: "Bisa berarti tidak percaya, ragu, atau lelah dengan percakapan." },
        { title: "Tangan di Pinggang", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzB1a3h5d21tMHN0dGhzNHJ5aTJyZnZodDN0d2Z6a2VvN2t4NTV6bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKOqO7yL gauging/giphy.gif", description: "Menunjukkan sikap siap, terkadang juga bisa terlihat agresif atau ingin mendominasi." },
        { title: "Kepala Miring", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWY1aXN5dGNmejB4OHdneDdnMGw5b2NpcWRqOG8wZjBwczQ1cHZ5MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7btUgk9D4I40o3p6/giphy.gif", description: "Tanda bahwa seseorang sedang mendengarkan dengan saksama dan tertarik." },
        { title: "Memainkan Rambut", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2d0bHR1Z3gybDl6d3ZxbzJwbjEzeDVpZXZlMzZ0aHludXo2MXh1dSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1iTpxrnE2i8G4/giphy.gif", description: "Bisa menjadi tanda kegelisahan, rasa tidak aman, atau terkadang genit." },
        { title: "Menutup Mulut dengan Tangan", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbTBsYmg1cmZkdnRqcXV0emZrdzVqa3BpbjUzZDJkZ2JtbnJ4M2ZpMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0MYEqEzwMWFCg8b6/giphy.gif", description: "Refleks saat terkejut atau menahan diri untuk tidak mengatakan sesuatu." },
        { title: "Berjabat Tangan Erat", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzltdXQ2bW9jMjl5M2E4eTdiNXFudXFocDE0a2F6eHo2ZTBmYjhoayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7527pa7qs9kCG78A/giphy.gif", description: "Menunjukkan kepercayaan diri dan dominasi." },
        { title: "Berjabat Tangan Lemah", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGI3amVlMnZ5M3Q3dm1pNGFqYWx5d3I0Nmc2azFjZHVtaW9icHhjbSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKU8i3B8jftw62I/giphy.gif", description: "Bisa diartikan sebagai kurangnya minat atau rasa tidak aman." },
        { title: "Dahi Mengernyit", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3NlNHB3eXFpa2hvcDFudXgya2NjaWp4dTVka2Z4Z2V3bjJtNG42aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/13g2s83k2m2I5G/giphy.gif", description: "Menunjukkan kebingungan, konsentrasi, atau ketidaksetujuan." },
        { title: "Berdiri Tegak", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Vub3VnZGNjaG9oZzY0MDF2aGZmMmZ1N3p5emg3aXNvb3RkNnphcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3_p5hQ2EYT2Qo/giphy.gif", description: "Postur yang baik menunjukkan rasa percaya diri dan energi positif." },
        { title: "Membungkuk", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzdrNmZqdW03ejI0eGJjM2RscXJmdzdsMWF1ZHRyMDllMWFjc2M4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/a93jwI0wkWTQs/giphy.gif", description: "Menandakan rasa tidak percaya diri, sedih, atau lelah." },
        { title: "Jari Menunjuk", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z0OXBzbGZqdTlqc3ZldmNqNGR4MXhsbGlzZ2F6MG5xdzhzc3o0eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l1J9RNBh3Q22m62m4/giphy.gif", description: "Dianggap sebagai gestur yang agresif atau menuduh di banyak budaya." },
        { title: "Telapak Tangan Terbuka", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Vub3VnZGNjaG9oZzY0MDF2aGZmMmZ1N3p5emg3aXNvb3RkNnphcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3_p5hQ2EYT2Qo/giphy.gif", description: "Menunjukkan kejujuran, keterbukaan, dan tidak ada yang disembunyikan." },
        { title: "Mengetuk Kaki", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3NlNHB3eXFpa2hvcDFudXgya2NjaWp4dTVka2Z4Z2V3bjJtNG42aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/13g2s83k2m2I5G/giphy.gif", description: "Sama seperti mengetuk jari, ini menunjukkan kegelisahan atau ketidaksabaran." },
        { title: "Jarak Fisik Dekat", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExajM0bXp5Z29uZHpxMGN4dTFtb2Q5bmF5dXZqOHpmNHl6bmM1MWFqYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0NwNTEhrb22i256E/giphy.gif", description: "Menunjukkan kedekatan atau keintiman. Jika tidak diinginkan, bisa terasa mengancam." },
        { title: "Jarak Fisik Jauh", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z0OXBzbGZqdTlqc3ZldmNqNGR4MXhsbGlzZ2F6MG5xdzhzc3o0eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l1J9RNBh3Q22m62m4/giphy.gif", description: "Menciptakan penghalang emosional, menunjukkan ketidaknyamanan." },
        { title: "Tangan Mengepal", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzdrNmZqdW03ejI0eGJjM2RscXJmdzdsMWF1ZHRyMDllMWFjc2M4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/a93jwI0wkWTQs/giphy.gif", description: "Tanda dari kemarahan, frustrasi, atau tekad yang kuat." },
        { title: "Menggosok Tangan", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Vub3VnZGNjaG9oZzY0MDF2aGZmMmZ1N3p5emg3aXNvb3RkNnphcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3_p5hQ2EYT2Qo/giphy.gif", description: "Bisa berarti sedang bersemangat atau menantikan sesuatu yang positif." },
        { title: "Menyilangkan Kaki di Pergelangan", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExajM0bXp5Z29uZHpxMGN4dTFtb2Q5bmF5dXZqOHpmNHl6bmM1MWFqYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0NwNTEhrb22i256E/giphy.gif", description: "Saat duduk, ini bisa menjadi tanda bahwa seseorang sedang menahan emosi." },
        { title: "Bibir Mengerucut", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3NlNHB3eXFpa2hvcDFudXgya2NjaWp4dTVka2Z4Z2V3bjJtNG42aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/13g2s83k2m2I5G/giphy.gif", description: "Menunjukkan ketidaksetujuan, kemarahan yang ditahan, atau ketidaksukaan." },
        { title: "Menggaruk Leher", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY3hncGF3M3N0a2l4c3A5ODU5c3d2MTZmaDRtY2ZkaGZvZzNmMjhyNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LRcstfUhS2s3sFpDX9/giphy.gif", description: "Tanda keraguan atau ketidakpastian terhadap apa yang dikatakan." },
        { title: "Melirik ke Samping", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzdrNmZqdW03ejI0eGJjM2RscXJmdzdsMWF1ZHRyMDllMWFjc2M4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/a93jwI0wkWTQs/giphy.gif", description: "Bisa berarti tidak percaya atau curiga terhadap lawan bicara." },
        { title: "Tangan di Belakang Punggung", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzltdXQ2bW9jMjl5M2E4eTdiNXFudXFocDE0a2F6eHo2ZTBmYjhoayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7527pa7qs9kCG78A/giphy.gif", description: "Menunjukkan kepercayaan diri, superioritas, atau sedang menyembunyikan kegelisahan." },
        { title: "Mata Melotot", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGI3amVlMnZ5M3Q3dm1pNGFqYWx5d3I0Nmc2azFjZHVtaW9icHhjbSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKU8i3B8jftw62I/giphy.gif", description: "Menunjukkan keterkejutan atau ketertarikan yang sangat kuat." },
        { title: "Bernapas Dalam-dalam", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Vub3VnZGNjaG9oZzY0MDF2aGZmMmZ1N3p5emg3aXNvb3RkNnphcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3_p5hQ2EYT2Qo/giphy.gif", description: "Upaya untuk menenangkan diri saat merasa cemas atau marah." },
        { title: "Kaki Bergetar", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3NlNHB3eXFpa2hvcDFudXgya2NjaWp4dTVka2Z4Z2V3bjJtNG42aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/13g2s83k2m2I5G/giphy.gif", description: "Tanda klasik dari kecemasan, kegelisahan, atau kelebihan energi." },
        { title: "Menjulurkan Lidah", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2F4c2R2cWR3cTluNmR0bWk2dmR4ZzV5cG1rNjE2cGV2cHNuc3M4cyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kFgzrD4n2b1DETWNF4/giphy.gif", description: "Bisa berarti bercanda, menggoda, atau menolak sesuatu." },
        { title: "Mengedipkan Sebelah Mata", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Vub3VnZGNjaG9oZzY0MDF2aGZmMmZ1N3p5emg3aXNvb3RkNnphcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3_p5hQ2EYT2Qo/giphy.gif", description: "Tanda adanya rahasia, lelucon internal, atau ajakan genit." },
        { title: "Memainkan Objek (Pena, dll.)", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3NlNHB3eXFpa2hvcDFudXgya2NjaWp4dTVka2Z4Z2V3bjJtNG42aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/13g2s83k2m2I5G/giphy.gif", description: "Bisa menunjukkan kebosanan atau menjadi cara untuk menyalurkan energi gugup." },
        { title: "Merapikan Pakaian", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNG11eG53dW85NHMzd2FzNjBtbWp4dGl6ZG01Mm1hYjdycjE5NmQ0MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/iGpkO05xWTl17Vhq9Y/giphy.gif", description: "Tanda bahwa seseorang peduli dengan penampilannya, sering dilakukan saat merasa dinilai." },
        { title: "Menyentuh Lengan Lawan Bicara", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExajM0bXp5Z29uZHpxMGN4dTFtb2Q5bmF5dXZqOHpmNHl6bmM1MWFqYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0NwNTEhrb22i256E/giphy.gif", description: "Gestur untuk menekankan sebuah poin, membangun hubungan, atau menunjukkan simpati." },
        { title: "Berpaling", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzdrNmZqdW03ejI0eGJjM2RscXJmdzdsMWF1ZHRyMDllMWFjc2M4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/a93jwI0wkWTQs/giphy.gif", description: "Tanda penolakan, tidak hormat, atau ingin mengakhiri percakapan." },
        { title: "Tangan Terbuka di Meja", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Vub3VnZGNjaG9oZzY0MDF2aGZmMmZ1N3p5emg3aXNvb3RkNnphcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3_p5hQ2EYT2Qo/giphy.gif", description: "Menunjukkan kesiapan untuk bernegosiasi atau berdiskusi secara terbuka." },
        { title: "Mata Berputar", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGI3amVlMnZ5M3Q3dm1pNGFqYWx5d3I0Nmc2azFjZHVtaW9icHhjbSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKU8i3B8jftw62I/giphy.gif", description: "Tanda sinis, tidak sabar, atau tidak setuju dengan apa yang didengar." },
        { title: "Memegang Dagu", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExajM0bXp5Z29uZHpxMGN4dTFtb2Q5bmF5dXZqOHpmNHl6bmM1MWFqYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0NwNTEhrb22i256E/giphy.gif", description: "Menunjukkan bahwa seseorang sedang berpikir atau membuat keputusan." },
        { title: "Tangan di Atas Kepala", gif_url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z0OXBzbGZqdTlqc3ZldmNqNGR4MXhsbGlzZ2F6MG5xdzhzc3o0eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l1J9RNBh3Q22m62m4/giphy.gif", description: "Bisa menandakan keterbukaan dan relaksasi, atau frustrasi dan keputusasaan." }
    ];

    const learningGrid = document.getElementById('learning-grid');
    if (learningGrid) {
        learningGrid.innerHTML = '';
        bodyLanguageData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'learning-card';
            card.innerHTML = `
                <img src="${item.gif_url}" alt="${item.title}" class="learning-card-gif">
                <div class="learning-card-content">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                </div>
            `;
            learningGrid.appendChild(card);
        });
    }
});