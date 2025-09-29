package model

import "time"

type Conversation struct {
	ID         int       `json:"id"`
	Title      string    `json:"title"`
	Transcript string    `json:"transcript"`
	CreatedAt  time.Time `json:"created_at"`
}