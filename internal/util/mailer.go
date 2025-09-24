// internal/util/mailer.go
package util

import (
	"fmt"
	"net/smtp"
	"os"
)

// SendEmailOTP adalah fungsi untuk mengirim email yang berisi kode OTP
func SendEmailOTP(recipientEmail, otpCode string) error {
	// Ambil konfigurasi dari environment variables
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")
	sender := os.Getenv("SMTP_SENDER_EMAIL")
	password := os.Getenv("SMTP_SENDER_PASSWORD")

	// Buat pesan email
	subject := "Subject: Kode Verifikasi Talkyou Anda\n"
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	body := fmt.Sprintf(`
	<html>
		<body>
			<h2>Verifikasi Akun Talkyou Anda</h2>
			<p>Gunakan kode di bawah ini untuk menyelesaikan pendaftaran:</p>
			<h1 style="font-size: 2rem; letter-spacing: 0.5em; color: #007BFF;">%s</h1>
			<p>Kode ini hanya berlaku selama 5 menit.</p>
		</body>
	</html>
	`, otpCode)

	msg := []byte(subject + mime + body)

	// Buat otentikasi
	auth := smtp.PlainAuth("", sender, password, host)

	// Kirim email
	addr := fmt.Sprintf("%s:%s", host, port)
	err := smtp.SendMail(addr, auth, sender, []string{recipientEmail}, msg)

	return err
}