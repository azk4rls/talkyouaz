package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"talkyou/internal/model"
)

// Catatan: JWT_SECRET harus diambil dari environment variable di produksi
var JWT_SECRET = []byte("jwt_secret_sangat_rahasia_dan_panjang")

type AuthHandler struct {
	DB *sql.DB
}

type RegisterInput struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var input RegisterInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	if input.Email == "" || input.Password == "" || input.Name == "" {
		http.Error(w, "Nama, email, dan password tidak boleh kosong", http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Gagal memproses password", http.StatusInternalServerError)
		return
	}

	stmt := `INSERT INTO users (name, email, hashed_password) VALUES (?, ?, ?)`
	_, err = h.DB.Exec(stmt, input.Name, input.Email, string(hashedPassword))
	if err != nil {
		// Seharusnya ada pengecekan error duplikat email di sini
		http.Error(w, "Gagal mendaftarkan pengguna", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Registrasi berhasil"})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var input LoginInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	user := &model.User{}
	stmt := `SELECT id, name, email, hashed_password FROM users WHERE email = ?`
	err := h.DB.QueryRow(stmt, input.Email).Scan(&user.ID, &user.Name, &user.Email, &user.HashedPassword)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Email atau password salah", http.StatusUnauthorized)
			return
		}
		http.Error(w, "Terjadi kesalahan server", http.StatusInternalServerError)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.HashedPassword), []byte(input.Password))
	if err != nil {
		http.Error(w, "Email atau password salah", http.StatusUnauthorized)
		return
	}

	// Buat token JWT
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"name":    user.Name,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(JWT_SECRET)
	if err != nil {
		http.Error(w, "Gagal membuat token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
}

// --- Placeholder untuk Login Sosial ---

func (h *AuthHandler) GoogleLogin(w http.ResponseWriter, r *http.Request) {
	// 1. Dapatkan URL redirect ke Google dari library OAuth2.
	// 2. Redirect pengguna ke URL tersebut.
	// Contoh: url := googleOauthConfig.AuthCodeURL("state-token")
	//         http.Redirect(w, r, url, http.StatusTemporaryRedirect)
	json.NewEncoder(w).Encode(map[string]string{"message": "Placeholder untuk redirect ke Google"})
}

func (h *AuthHandler) GoogleCallback(w http.ResponseWriter, r *http.Request) {
	// 1. Handle callback dari Google, dapatkan 'code'.
	// 2. Tukarkan 'code' dengan token akses Google.
	// 3. Gunakan token akses untuk mendapatkan info profil pengguna (email, nama).
	// 4. Cek apakah pengguna sudah ada di DB kita, jika tidak, daftarkan.
	// 5. Buat token JWT untuk sesi aplikasi kita.
	// 6. Kirim token JWT ke client.
	json.NewEncoder(w).Encode(map[string]string{"message": "Placeholder untuk callback Google"})
}

type VerifyInput struct {
	Email   string `json:"email"`
	OtpCode string `json:"otp_code"`
}

func (h *AuthHandler) Verify(w http.ResponseWriter, r *http.Request) {
	var input VerifyInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	// 1. Dapatkan user_id dan OTP yang benar dari DB
	var userID int
	var correctOtp string
	var expiresAt time.Time
	
	// Query JOIN untuk mendapatkan data OTP berdasarkan email pengguna
	stmt := `SELECT u.id, o.otp_code, o.expires_at FROM users u JOIN otps o ON u.id = o.user_id WHERE u.email = ? ORDER BY o.created_at DESC LIMIT 1`
	err := h.DB.QueryRow(stmt, input.Email).Scan(&userID, &correctOtp, &expiresAt)
	if err != nil {
		http.Error(w, "Email tidak ditemukan atau tidak ada permintaan OTP", http.StatusNotFound)
		return
	}

	// 2. Cek apakah OTP sudah kedaluwarsa
	if time.Now().After(expiresAt) {
		http.Error(w, "Kode OTP telah kedaluwarsa", http.StatusBadRequest)
		return
	}

	// 3. Cek apakah OTP cocok
	if input.OtpCode != correctOtp {
		http.Error(w, "Kode OTP salah", http.StatusBadRequest)
		return
	}

	// 4. Jika cocok, update status verifikasi user
	updateStmt := `UPDATE users SET is_email_verified = TRUE WHERE id = ?`
	_, err = h.DB.Exec(updateStmt, userID)
	if err != nil {
		http.Error(w, "Gagal memverifikasi akun", http.StatusInternalServerError)
		return
	}
	
	// (Opsional: hapus OTP yang sudah digunakan dari tabel otps)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Verifikasi berhasil"})
}