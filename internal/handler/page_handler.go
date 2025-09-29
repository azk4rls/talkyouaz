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