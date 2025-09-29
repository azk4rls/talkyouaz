package handler

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"talkyou/internal/model"

	"golang.org/x/crypto/bcrypt"
)

type UserHandler struct {
	DB *sql.DB
}

// Struct untuk input saat update profil
type UpdateProfileInput struct {
	Name        string `json:"name"`
	PhoneNumber string `json:"phone_number"`
}

// Struct untuk input saat update password
type UpdatePasswordInput struct {
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}

func (h *UserHandler) GetMyProfile(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)

	var user model.User
	stmt := "SELECT id, name, email, phone_number FROM users WHERE id = ?"
	err := h.DB.QueryRow(stmt, userID).Scan(&user.ID, &user.Name, &user.Email, &user.PhoneNumber)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Pengguna tidak ditemukan", http.StatusNotFound)
			return
		}
		http.Error(w, "Gagal mengambil profil", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func (h *UserHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)

	var input UpdateProfileInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	if input.Name == "" {
		http.Error(w, "Nama tidak boleh kosong", http.StatusBadRequest)
		return
	}

	var phoneValue sql.NullString
	if input.PhoneNumber != "" {
		phoneValue = sql.NullString{String: input.PhoneNumber, Valid: true}
	} else {
		phoneValue = sql.NullString{Valid: false} // Ini akan disimpan sebagai NULL
	}

	stmt := `UPDATE users SET name = ?, phone_number = ? WHERE id = ?`
	_, err := h.DB.Exec(stmt, input.Name, phoneValue, userID)
	if err != nil {
		log.Printf("Gagal update profil untuk user ID %d: %v", userID, err)
		http.Error(w, "Gagal memperbarui profil", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Profil berhasil diperbarui"})
}

func (h *UserHandler) UpdatePassword(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)
	var input UpdatePasswordInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}
	var currentHashedPassword string
	err := h.DB.QueryRow("SELECT hashed_password FROM users WHERE id = ?", userID).Scan(&currentHashedPassword)
	if err != nil {
		http.Error(w, "Pengguna tidak ditemukan", http.StatusNotFound)
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(currentHashedPassword), []byte(input.OldPassword)); err != nil {
		http.Error(w, "Password lama salah", http.StatusUnauthorized)
		return
	}
	newHashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Gagal memproses password baru", http.StatusInternalServerError)
		return
	}
	_, err = h.DB.Exec("UPDATE users SET hashed_password = ? WHERE id = ?", string(newHashedPassword), userID)
	if err != nil {
		http.Error(w, "Gagal memperbarui password", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Password berhasil diperbarui"})
}