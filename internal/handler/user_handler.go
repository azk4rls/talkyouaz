package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

type UserHandler struct {
	DB *sql.DB
}

type UpdatePasswordInput struct {
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}

// GetMyProfile - Mendapatkan profil pengguna yang sedang login
func (h *UserHandler) GetMyProfile(w http.ResponseWriter, r *http.Request) {
	// ID pengguna diambil dari konteks setelah divalidasi oleh middleware JWT
	userID := r.Context().Value("userID").(int)

	// Ambil data user dari DB berdasarkan userID...
	// Kirim kembali sebagai JSON (tanpa password)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"message": "Endpoint profil berhasil diakses", "user_id": userID})
}

// UpdatePassword - Memperbarui password
func (h *UserHandler) UpdatePassword(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)
	var input UpdatePasswordInput

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	// 1. Ambil hashed_password saat ini dari DB
	var currentHashedPassword string
	stmt := `SELECT hashed_password FROM users WHERE id = ?`
	err := h.DB.QueryRow(stmt, userID).Scan(&currentHashedPassword)
	if err != nil {
		http.Error(w, "Pengguna tidak ditemukan", http.StatusNotFound)
		return
	}

	// 2. Verifikasi password lama
	if err := bcrypt.CompareHashAndPassword([]byte(currentHashedPassword), []byte(input.OldPassword)); err != nil {
		http.Error(w, "Password lama salah", http.StatusUnauthorized)
		return
	}

	// 3. Hash password baru
	newHashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Gagal memproses password baru", http.StatusInternalServerError)
		return
	}

	// 4. Update password di DB
	updateStmt := `UPDATE users SET hashed_password = ? WHERE id = ?`
	_, err = h.DB.Exec(updateStmt, string(newHashedPassword), userID)
	if err != nil {
		http.Error(w, "Gagal memperbarui password", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Password berhasil diperbarui"})
}