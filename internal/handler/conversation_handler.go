package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"talkyou/internal/model"
	"time" // tetap dipakai

	"github.com/go-chi/chi/v5"
)

type ConversationHandler struct {
	DB *sql.DB
}

func NewConversationHandler(db *sql.DB) *ConversationHandler {
	return &ConversationHandler{DB: db}
}

// SaveConversation menyimpan transkrip percakapan baru
func (h *ConversationHandler) SaveConversation(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)

	var input struct {
		Transcript string `json:"transcript"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil || input.Transcript == "" {
		http.Error(w, "Transkrip tidak boleh kosong", http.StatusBadRequest)
		return
	}

	// Buat judul otomatis dari beberapa kata pertama transkrip
	words := strings.Fields(input.Transcript)
	title := "Percakapan Baru"
	if len(words) > 0 {
		title = strings.Join(words[:min(5, len(words))], " ") + "..."
	}

	createdAt := time.Now() // ✅ supaya import time terpakai

	stmt := "INSERT INTO conversations (user_id, title, transcript, created_at) VALUES (?, ?, ?, ?)"
	_, err := h.DB.Exec(stmt, userID, title, input.Transcript, createdAt)
	if err != nil {
		http.Error(w, "Gagal menyimpan percakapan", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Percakapan berhasil disimpan"})
}

// GetAllConversations mengambil semua riwayat percakapan pengguna
func (h *ConversationHandler) GetAllConversations(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)

	rows, err := h.DB.Query("SELECT id, title, transcript, created_at FROM conversations WHERE user_id = ? ORDER BY created_at DESC", userID)
	if err != nil {
		http.Error(w, "Gagal mengambil riwayat", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	conversations := []model.Conversation{}
	for rows.Next() {
		var c model.Conversation
		if err := rows.Scan(&c.ID, &c.Title, &c.Transcript, &c.CreatedAt); err != nil {
			http.Error(w, "Gagal memindai data", http.StatusInternalServerError)
			return
		}
		conversations = append(conversations, c)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(conversations)
}

// DeleteConversation menghapus sebuah percakapan
func (h *ConversationHandler) DeleteConversation(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)
	convoID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "ID percakapan tidak valid", http.StatusBadRequest)
		return
	}

	stmt := "DELETE FROM conversations WHERE id = ? AND user_id = ?"
	result, err := h.DB.Exec(stmt, convoID, userID)
	if err != nil {
		http.Error(w, "Gagal menghapus percakapan", http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Percakapan tidak ditemukan", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Helper function
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
