// internal/handler/auth_handler.go
package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

// AuthHandler akan menampung koneksi database
type AuthHandler struct {
	DB *sql.DB
}

// Input struct untuk data registrasi dari JSON
type RegisterInput struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Fungsi Register
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var input RegisterInput

	// 1. Decode JSON body ke dalam struct input
	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, "Body request tidak valid", http.StatusBadRequest)
		return
	}

	// 2. Validasi sederhana (bisa dikembangkan)
	if input.Email == "" || input.Password == "" || input.Name == "" {
		http.Error(w, "Nama, email, dan password tidak boleh kosong", http.StatusBadRequest)
		return
	}

	// 3. Hash password menggunakan bcrypt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Gagal memproses password", http.StatusInternalServerError)
		return
	}

	// 4. Masukkan pengguna baru ke database
	stmt := `INSERT INTO users (name, email, hashed_password) VALUES (?, ?, ?)`
	_, err = h.DB.Exec(stmt, input.Name, input.Email, string(hashedPassword))
	if err != nil {
		// (Di sini bisa ditambahkan pengecekan untuk email duplikat)
		http.Error(w, "Gagal mendaftarkan pengguna", http.StatusInternalServerError)
		return
	}

	// 5. Kirim respons sukses
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Registrasi berhasil"})
}