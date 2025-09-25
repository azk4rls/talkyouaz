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
	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"talkyou/internal/handler"
	appMiddleware "talkyou/internal/middleware"
)

func main() {
	// 1. Memuat variabel dari file .env (SEKARANG PALING PERTAMA)
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error memuat file .env")
	}

	// 2. Membuat koneksi ke database
	db, err := openDB()
	if err != nil {
		log.Fatalf("Gagal terhubung ke database: %v", err)
	}
	defer db.Close()
	log.Println("Berhasil terhubung ke database!")

	// 3. Setup Konfigurasi OAuth Google (PINDAH KE SINI)
	googleOAuthConfig := &oauth2.Config{
		RedirectURL:  os.Getenv("GOOGLE_OAUTH_REDIRECT_URL"),
		ClientID:     os.Getenv("GOOGLE_OAUTH_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_OAUTH_CLIENT_SECRET"),
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
		Endpoint:     google.Endpoint,
	}

	// 4. Setup Router
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// 5. Inisialisasi Handler dengan DB dan Konfigurasi OAuth
	authHandler := &handler.AuthHandler{
		DB:          db,
		OAuthConfig: googleOAuthConfig,
	}
	// userHandler := &handler.UserHandler{DB: db} // (Jika Anda punya userHandler)

	// --- Rute Publik ---
	r.Route("/api/v1/auth", func(r chi.Router) {
		r.Post("/register", authHandler.Register)
		r.Post("/login", authHandler.Login)
		r.Post("/verify", authHandler.Verify) // Pastikan rute verify ada

		// Rute untuk login sosial
		r.Get("/google/login", authHandler.GoogleLogin)
		r.Get("/google/callback", authHandler.GoogleCallback)
	})

	// --- Rute Terproteksi ---
	r.Group(func(r chi.Router) {
		r.Use(appMiddleware.JWTMiddleware)
		// ... rute terproteksi Anda ...
	})

	// --- Rute Frontend ---
	fs := http.FileServer(http.Dir("./ui/static"))
	r.Handle("/static/*", http.StripPrefix("/static/", fs))
	r.Get("/*", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./ui/html/index.html")
	})

	// 6. Jalankan Server
	port := ":8080"
	fmt.Printf("Server Talkyou berjalan di http://localhost%s\n", port)
	if err := http.ListenAndServe(port, r); err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}

func openDB() (*sql.DB, error) {
	dsn := fmt.Sprintf("%s:%s@tcp(localhost:3306)/%s?parseTime=true",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)
	db, err := sql.Open("mysql", dsn)
	if err != nil { return nil, err }
	if err = db.Ping(); err != nil { return nil, err }
	return db, nil
}