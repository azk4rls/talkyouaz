package handler

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	mathrand "math/rand"
	"net/http"
	"os"
	"talkyou/internal/model"
	"talkyou/internal/util"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	googleOAuth2 "google.golang.org/api/oauth2/v2"
	"google.golang.org/api/option"
)

var JWT_SECRET = []byte(os.Getenv("JWT_SECRET"))
var googleOAuthConfig *oauth2.Config

func init() {
	mathrand.New(mathrand.NewSource(time.Now().UnixNano()))
	googleOAuthConfig = &oauth2.Config{
		RedirectURL:  os.Getenv("GOOGLE_OAUTH_REDIRECT_URL"),
		ClientID:     os.Getenv("GOOGLE_OAUTH_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_OAUTH_CLIENT_SECRET"),
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
		Endpoint:     google.Endpoint,
	}
}

type AuthHandler struct {
	DB          *sql.DB
	OAuthConfig *oauth2.Config
}

type RegisterInput struct { Name string `json:"name"`; Email string `json:"email"`; Password string `json:"password"` }
type LoginInput struct { Email string `json:"email"`; Password string `json:"password"` }
type VerifyInput struct { Email string `json:"email"`; OtpCode string `json:"otp_code"` }

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
	otpCode := fmt.Sprintf("%06d", mathrand.Intn(1000000))
	expiresAt := time.Now().Add(5 * time.Minute)
	otpStmt := `INSERT INTO otps (user_id, otp_code, expires_at) VALUES (?, ?, ?)`
	_, err = h.DB.Exec(otpStmt, userID, otpCode, expiresAt)
	if err != nil {
		http.Error(w, "Gagal menyimpan OTP", http.StatusInternalServerError)
		return
	}
	err = util.SendEmailOTP(input.Email, otpCode)
	if err != nil {
		log.Printf("Gagal mengirim email OTP ke %s: %v", input.Email, err)
		http.Error(w, "Gagal mengirim email verifikasi", http.StatusInternalServerError)
		return
	}
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

func (h *AuthHandler) GoogleLogin(w http.ResponseWriter, r *http.Request) {
	b := make([]byte, 16)
	rand.Read(b)
	oauthStateString := base64.URLEncoding.EncodeToString(b)
	http.SetCookie(w, &http.Cookie{
		Name:    "oauthstate",
		Value:   oauthStateString,
		Expires: time.Now().Add(10 * time.Minute),
	})
	url := h.OAuthConfig.AuthCodeURL(oauthStateString)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func (h *AuthHandler) GoogleCallback(w http.ResponseWriter, r *http.Request) {
	oauthState, _ := r.Cookie("oauthstate")
	if r.FormValue("state") != oauthState.Value {
		log.Println("Invalid oauth google state")
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}
	code := r.FormValue("code")
	token, err := h.OAuthConfig.Exchange(context.Background(), code)
	if err != nil {
		log.Printf("Code exchange failed: %s\n", err.Error())
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}
	oauth2Service, err := googleOAuth2.NewService(context.Background(), option.WithTokenSource(h.OAuthConfig.TokenSource(context.Background(), token)))
	if err != nil {
		log.Printf("Failed to create oauth2 service: %s", err.Error())
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}
	userInfo, err := oauth2Service.Userinfo.Get().Do()
	if err != nil {
		log.Printf("Failed to get user info: %s", err.Error())
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}
	var user model.User
	err = h.DB.QueryRow("SELECT id, name, email FROM users WHERE email = ?", userInfo.Email).Scan(&user.ID, &user.Name, &user.Email)
	if err == sql.ErrNoRows {
		n, _ := rand.Int(rand.Reader, big.NewInt(100000000))
		randomPassword := fmt.Sprintf("social_login_%d", n)
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(randomPassword), bcrypt.DefaultCost)
		stmt := "INSERT INTO users (name, email, hashed_password, is_email_verified) VALUES (?, ?, ?, ?)"
		result, dbErr := h.DB.Exec(stmt, userInfo.Name, userInfo.Email, string(hashedPassword), true)
		if dbErr != nil {
			http.Error(w, "Gagal membuat akun", http.StatusInternalServerError)
			return
		}
		newID, _ := result.LastInsertId()
		user.ID = int(newID)
	} else if err != nil {
		http.Error(w, "Terjadi kesalahan database", http.StatusInternalServerError)
		return
	}
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"name":    userInfo.Name,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	}
	appToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	appTokenString, _ := appToken.SignedString(JWT_SECRET)
	redirectURL := fmt.Sprintf("/auth/callback?token=%s", appTokenString)
	http.Redirect(w, r, redirectURL, http.StatusTemporaryRedirect)
}