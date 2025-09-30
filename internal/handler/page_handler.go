package handler

import (
	"net/http"
	"log"
	"os"
)

// PageHandler bertugas untuk menyajikan file-file HTML
type PageHandler struct{}

// NewPageHandler membuat instance PageHandler baru
func NewPageHandler() *PageHandler {
	return &PageHandler{}
}

// ShowAuthPage menyajikan halaman login/register
func (h *PageHandler) ShowAuthPage(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./ui/html/auth.html")
}
// ShowDashboardPage menyajikan halaman dashboard utama
func (h *PageHandler) ShowDashboardPage(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./ui/html/dashboard.html")
}
func (h *PageHandler) ShowKomunikasiPage(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./ui/html/komunikasi.html")
}
func (h *PageHandler) ShowPhrasesPage(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./ui/html/phrases.html")
}
func (h *PageHandler) ShowHistoryPage(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./ui/html/history.html")
}
func (h *PageHandler) ShowProfilePage(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./ui/html/profile.html")
}
func (h *PageHandler) ShowSoundAlertPage(w http.ResponseWriter, r *http.Request) {
    path := "./ui/html/sound-alert.html"
    log.Println("Load file:", path)
    if _, err := os.Stat(path); err != nil {
        log.Println("File error:", err)
    }
    http.ServeFile(w, r, path)
}
func (h *PageHandler) ShowLearningCenterPage(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./ui/html/learning-center.html")
}

func (h *PageHandler) ShowBodyLanguagePage(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./ui/html/body-language.html")
}
// func (h *PageHandler) ShowPengaturanPage(w http.ResponseWriter, r *http.Request) {
// 	http.ServeFile(w, r, "./ui/html/pages/pengaturan.html")
// }