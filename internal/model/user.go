package model

import "time"

// User merepresentasikan data pengguna di database
type User struct {
	ID                int       `json:"id"`
	Name              string    `json:"name"`
	Email             string    `json:"email"`
	PhoneNumber       *string   `json:"phone_number"` // Pointer agar bisa NULL
	HashedPassword    string    `json:"-"` // Jangan kirim password ke client
	IsEmailVerified   bool      `json:"is_email_verified"`
	IsPhoneVerified   bool      `json:"is_phone_verified"`
	CreatedAt         time.Time `json:"created_at"`
}