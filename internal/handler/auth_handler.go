// internal/handler/auth_handler.go
package handler

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"talkyou/internal/model"
	"talkyou/internal/util"
	"time"

	"github.com/golang-jwt/jwt/v5" // <-- Path yang sudah diperbaiki
	"golang.org/x/crypto/bcrypt"
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

type VerifyInput struct {
	Email   string `json:"email"`
	OtpCode string `json:"otp_code"`
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

	// 1. Simpan user dengan status belum terverifikasi
	stmt := `INSERT INTO users (name, email, hashed_password, is_email_verified) VALUES (?, ?, ?, ?)`
	result, err := h.DB.Exec(stmt, input.Name, input.Email, string(hashedPassword), false)
	if err != nil {
		http.Error(w, "Gagal mendaftarkan pengguna (email mungkin sudah ada)", http.StatusInternalServerError)
		return
	}

	userID, err := result.LastInsertId()
	if err != nil {
		http.Error(w, "Gagal mendapatkan ID pengguna", http.StatusInternalServerError)
		return
	}

	// 2. Generate kode OTP 6 digit
	otpCode := fmt.Sprintf("%06d", rand.Intn(1000000))
	expiresAt := time.Now().Add(5 * time.Minute)

	// 3. Simpan OTP ke database
	otpStmt := `INSERT INTO otps (user_id, otp_code, expires_at) VALUES (?, ?, ?)`
	_, err = h.DB.Exec(otpStmt, userID, otpCode, expiresAt)
	if err != nil {
		http.Error(w, "Gagal menyimpan OTP", http.StatusInternalServerError)
		return
	}

	// 4. Kirim Email OTP
	err = util.SendEmailOTP(input.Email, otpCode)
	if err != nil {
		log.Printf("Gagal mengirim email OTP ke %s: %v", input.Email, err)
		http.Error(w, "Gagal mengirim email verifikasi", http.StatusInternalServerError)
		return
	}

	// 5. Kirim respons sukses ke frontend
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Registrasi berhasil, silakan cek email untuk kode verifikasi."})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var input LoginInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	user := &model.User{}
	stmt := `SELECT id, name, email, hashed_password, is_email_verified FROM users WHERE email = ?`
	err := h.DB.QueryRow(stmt, input.Email).Scan(&user.ID, &user.Name, &user.Email, &user.HashedPassword, &user.IsEmailVerified)
	if err != nil {
		http.Error(w, "Email atau password salah", http.StatusUnauthorized)
		return
	}

	if !user.IsEmailVerified {
		http.Error(w, "Akun belum diverifikasi. Silakan cek email Anda untuk OTP.", http.StatusForbidden)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.HashedPassword), []byte(input.Password))
	if err != nil {
		http.Error(w, "Email atau password salah", http.StatusUnauthorized)
		return
	}

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

func (h *AuthHandler) Verify(w http.ResponseWriter, r *http.Request) {
	var input VerifyInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	var userID int
	var correctOtp string
	var expiresAt time.Time

	stmt := `SELECT u.id, o.otp_code, o.expires_at FROM users u JOIN otps o ON u.id = o.user_id WHERE u.email = ? ORDER BY o.created_at DESC LIMIT 1`
	err := h.DB.QueryRow(stmt, input.Email).Scan(&userID, &correctOtp, &expiresAt)
	if err != nil {
		http.Error(w, "Email tidak ditemukan atau tidak ada permintaan OTP", http.StatusNotFound)
		return
	}

	if time.Now().After(expiresAt) {
		http.Error(w, "Kode OTP telah kedaluwarsa", http.StatusBadRequest)
		return
	}

	if input.OtpCode != correctOtp {
		http.Error(w, "Kode OTP salah", http.StatusBadRequest)
		return
	}

	updateStmt := `UPDATE users SET is_email_verified = TRUE WHERE id = ?`
	_, err = h.DB.Exec(updateStmt, userID)
	if err != nil {
		http.Error(w, "Gagal memverifikasi akun", http.StatusInternalServerError)
		return
	}

	deleteStmt := `DELETE FROM otps WHERE user_id = ?`
	h.DB.Exec(deleteStmt, userID)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Verifikasi berhasil"})
}

// --- Placeholder untuk Login Sosial ---

func (h *AuthHandler) GoogleLogin(w http.ResponseWriter, r *http.Request) {
	// Logika untuk redirect ke Google akan ada di sini nanti.
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Placeholder: Redirect ke Google"})
}

func (h *AuthHandler) GoogleCallback(w http.ResponseWriter, r *http.Request) {
	// Logika untuk handle callback dari Google akan ada di sini nanti.
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Placeholder: Menerima callback dari Google"})
}