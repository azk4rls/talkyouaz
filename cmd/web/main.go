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
	"golang.org/x/oauth2/facebook"
	"golang.org/x/oauth2/google"
	"talkyou/internal/handler"
	appMiddleware "talkyou/internal/middleware"
)

func main() {
	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error memuat file .env")
	}

	// Koneksi DB
	db, err := openDB()
	if err != nil {
		log.Fatalf("Gagal terhubung ke database: %v", err)
	}
	defer db.Close()
	log.Println("Berhasil terhubung ke database!")

	// Konfigurasi OAuth Google
	googleOAuthConfig := &oauth2.Config{
		RedirectURL:  os.Getenv("GOOGLE_OAUTH_REDIRECT_URL"),
		ClientID:     os.Getenv("GOOGLE_OAUTH_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_OAUTH_CLIENT_SECRET"),
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
		Endpoint:     google.Endpoint,
	}

	// Konfigurasi OAuth Facebook
	facebookOAuthConfig := &oauth2.Config{
		RedirectURL:  os.Getenv("FACEBOOK_OAUTH_REDIRECT_URL"),
		ClientID:     os.Getenv("FACEBOOK_OAUTH_CLIENT_ID"),
		ClientSecret: os.Getenv("FACEBOOK_OAUTH_CLIENT_SECRET"),
		Scopes:       []string{"email", "public_profile"},
		Endpoint:     facebook.Endpoint,
	}

	// Router
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Inisialisasi Handler
	authHandler := &handler.AuthHandler{
		DB:             db,
		GoogleConfig:   googleOAuthConfig,
		FacebookConfig: facebookOAuthConfig,
		JWTSecret:      []byte(os.Getenv("JWT_SECRET")),
	}
	userHandler := &handler.UserHandler{DB: db}
	pageHandler := &handler.PageHandler{}
	conversationHandler := &handler.ConversationHandler{DB: db}

	// ================== ROUTES ==================

	// --- Halaman Frontend ---
	r.Get("/", pageHandler.ShowAuthPage)
	r.Get("/auth/callback", pageHandler.ShowAuthPage)
	r.Get("/dashboard", pageHandler.ShowDashboardPage)
	r.Get("/komunikasi", pageHandler.ShowKomunikasiPage)
	r.Get("/frasa-cepat", pageHandler.ShowPhrasesPage)
	r.Get("/riwayat", pageHandler.ShowHistoryPage)
	r.Get("/profil", pageHandler.ShowProfilePage)
	// r.Get("/pengaturan", pageHandler.ShowPengaturanPage)

	r.Group(func(r chi.Router) {
	r.Use(appMiddleware.JWTMiddleware)
    r.Get("/api/v1/conversations", conversationHandler.GetAllConversations)
    r.Post("/api/v1/conversations", conversationHandler.SaveConversation)
    r.Delete("/api/v1/conversations/{id}", conversationHandler.DeleteConversation)
	})


	// --- API Publik: Auth ---
	r.Route("/api/v1/auth", func(r chi.Router) {
		r.Post("/register", authHandler.Register)
		r.Post("/login", authHandler.Login)
		r.Post("/verify", authHandler.Verify)

		// OAuth Google
		r.Get("/google/login", authHandler.GoogleLogin)
		r.Get("/google/callback", authHandler.GoogleCallback)

		// OAuth Facebook
		r.Get("/facebook/login", authHandler.FacebookLogin)
		r.Get("/facebook/callback", authHandler.FacebookCallback)
	})

	// --- API Terproteksi: User ---
	r.Route("/api/v1/me", func(r chi.Router) {
		r.Use(appMiddleware.JWTMiddleware)
		r.Get("/", userHandler.GetMyProfile)
		r.Put("/", userHandler.UpdateProfile) // <-- PASTIKAN BARIS INI ADA
		r.Put("/password", userHandler.UpdatePassword)
	})

	// --- Static Files ---
	fs := http.FileServer(http.Dir("./ui/static"))
	r.Handle("/static/*", http.StripPrefix("/static/", fs))

	// --- Catch-All ke Frontend ---
	r.Get("/*", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./ui/html/index.html")
	})

	// ================== START SERVER ==================
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	addr := ":" + port
	fmt.Printf("Server Talkyou berjalan di http://localhost:%s\n", port)

	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}

// Koneksi Database
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
