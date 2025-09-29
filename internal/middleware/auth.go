package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

var JWT_SECRET = []byte("jwt_secret_sangat_rahasia_dan_panjang") // Harus sama dengan di auth_handler

func JWTMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Header Authorization dibutuhkan", http.StatusUnauthorized)
			return
		}

		// Pecah jadi 2 bagian: "Bearer" dan token
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			http.Error(w, "Format Authorization salah", http.StatusUnauthorized)
			return
		}
		tokenString := strings.TrimSpace(parts[1])

		// Parse token dengan cek signing method
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return JWT_SECRET, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Token tidak valid", http.StatusUnauthorized)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			http.Error(w, "Gagal memproses token", http.StatusUnauthorized)
			return
		}

		// Ambil user_id dari token
		userIDFloat, ok := claims["user_id"].(float64)
		if !ok {
			http.Error(w, "Data token tidak valid", http.StatusUnauthorized)
			return
		}

		// Simpan ke context
		ctx := context.WithValue(r.Context(), "userID", int(userIDFloat))
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
