package handler

import "net/http"

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
// func (h *PageHandler) ShowPengaturanPage(w http.ResponseWriter, r *http.Request) {
// 	http.ServeFile(w, r, "./ui/html/pages/pengaturan.html")
// }