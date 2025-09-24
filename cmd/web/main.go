// cmd/web/main.go
package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	_ "github.com/go-sql-driver/mysql" // Driver MySQL
	"github.com/joho/godotenv"         // Library untuk .env
	"talkyou/internal/handler"         // Import handler Anda
)

func main() {
	// 1. Memuat variabel dari file .env
	err := godotenv.Load()
	if err != nil {
		log.Println("Peringatan: Tidak dapat menemukan file .env")
	}

	// 2. Membuat koneksi ke database
	db, err := openDB()
	if err != nil {
		log.Fatalf("Gagal terhubung ke database: %v", err)
	}
	defer db.Close()
	log.Println("Berhasil terhubung ke database!")

	// 3. Setup Router
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// 4. Inisialisasi Handler dengan koneksi database
	authHandler := &handler.AuthHandler{DB: db}

	// 5. Daftarkan Rute-Rute API
	r.Route("/api/v1", func(r chi.Router) {
		r.Post("/auth/register", authHandler.Register)
		// r.Post("/auth/login", authHandler.Login) // Nanti kita buat ini
	})
	
	// (Kita akan tambahkan rute untuk frontend di sini nanti)

	fs := http.FileServer(http.Dir("./ui/static"))
	r.Handle("/static/*", http.StripPrefix("/static/", fs))

// Handler utama untuk menyajikan index.html untuk semua rute frontend lainnya
	r.Get("/*", func(w http.ResponseWriter, r *http.Request) {
    http.ServeFile(w, r, "./ui/html/index.html")
	})
	// 6. Jalankan Server
	port := ":8080"
	fmt.Printf("Server Talkyou berjalan di http://localhost%s\n", port)

	err = http.ListenAndServe(port, r)
	if err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}

// Fungsi untuk membuka koneksi database (tidak berubah)
func openDB() (*sql.DB, error) {
	dsn := fmt.Sprintf("%s:%s@tcp(localhost:3306)/%s?parseTime=true",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}

	err = db.Ping()
	if err != nil {
		return nil, err
	}

	return db, nil
}