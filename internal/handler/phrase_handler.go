package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"talkyou/internal/model"

	"github.com/go-chi/chi/v5"
)

type PhraseHandler struct {
	DB *sql.DB
}

func NewPhraseHandler(db *sql.DB) *PhraseHandler {
	return &PhraseHandler{DB: db}
}

// GetAllPhrases mengambil semua frasa milik pengguna yang sedang login
func (h *PhraseHandler) GetAllPhrases(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)

	rows, err := h.DB.Query("SELECT id, phrase_text FROM phrases WHERE user_id = ? ORDER BY created_at DESC", userID)
	if err != nil {
		http.Error(w, "Gagal mengambil data frasa", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	phrases := []model.Phrase{}
	for rows.Next() {
		var p model.Phrase
		if err := rows.Scan(&p.ID, &p.Text); err != nil {
			http.Error(w, "Gagal memindai data frasa", http.StatusInternalServerError)
			return
		}
		phrases = append(phrases, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(phrases)
}

// CreatePhrase menambahkan frasa baru
func (h *PhraseHandler) CreatePhrase(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)
	
	var input struct {
		Text string `json:"text"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil || input.Text == "" {
		http.Error(w, "Teks frasa tidak boleh kosong", http.StatusBadRequest)
		return
	}

	stmt := "INSERT INTO phrases (user_id, phrase_text) VALUES (?, ?)"
	result, err := h.DB.Exec(stmt, userID, input.Text)
	if err != nil {
		http.Error(w, "Gagal menyimpan frasa", http.StatusInternalServerError)
		return
	}

	id, _ := result.LastInsertId()
	newPhrase := model.Phrase{
		ID:   int(id),
		Text: input.Text,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newPhrase)
}

// DeletePhrase menghapus sebuah frasa
func (h *PhraseHandler) DeletePhrase(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)
	phraseID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "ID frasa tidak valid", http.StatusBadRequest)
		return
	}

	// Pastikan frasa ini milik user yang sedang login sebelum menghapus
	stmt := "DELETE FROM phrases WHERE id = ? AND user_id = ?"
	result, err := h.DB.Exec(stmt, phraseID, userID)
	if err != nil {
		http.Error(w, "Gagal menghapus frasa", http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Frasa tidak ditemukan atau Anda tidak punya izin", http.StatusNotFound)
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}