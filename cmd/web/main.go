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
	"talkyou/internal/handler"
	appMiddleware "talkyou/internal/middleware" // Alias untuk middleware kita
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Peringatan: Tidak dapat menemukan file .env")
	}

	db, err := openDB()
	if err != nil {
		log.Fatalf("Gagal terhubung ke database: %v", err)
	}
	defer db.Close()
	log.Println("Berhasil terhubung ke database!")

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Inisialisasi semua handler
	authHandler := &handler.AuthHandler{DB: db}
	userHandler := &handler.UserHandler{DB: db}

	// --- Rute Publik ---
	r.Route("/api/v1/auth", func(r chi.Router) {
		r.Post("/register", authHandler.Register)
		r.Post("/login", authHandler.Login)
		r.Post("/verify", authHandler.Verify)

		// Rute placeholder untuk login sosial
		r.Get("/google/login", authHandler.GoogleLogin)
		r.Get("/google/callback", authHandler.GoogleCallback)
	})

	// --- Rute Terproteksi (Membutuhkan JWT) ---
	r.Group(func(r chi.Router) {
		r.Use(appMiddleware.JWTMiddleware)

		r.Get("/api/v1/me", userHandler.GetMyProfile)
		r.Put("/api/v1/me/password", userHandler.UpdatePassword)
		// Tambahkan rute untuk update email/no telp di sini
	})

	// --- Rute Frontend ---
	fs := http.FileServer(http.Dir("./ui/static"))
	r.Handle("/static/*", http.StripPrefix("/static/", fs))
	r.Get("/*", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./ui/html/index.html")
	})

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
	if err != nil {
		return nil, err
	}
	if err = db.Ping(); err != nil {
		return nil, err
	}
	return db, nil
}