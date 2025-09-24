package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

var JWT_SECRET = []byte("jwt_secret_sangat_rahasia_dan_panjang") // Pastikan ini sama

func JWTMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Header Authorization dibutuhkan", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
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

		// Ambil user_id dari token dan masukkan ke context
		userIDFloat, ok := claims["user_id"].(float64)
		if !ok {
			http.Error(w, "Data token tidak valid", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), "userID", int(userIDFloat))
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}