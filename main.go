// Open Friday — Go App
package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"
)

type Config struct {
	Port string
	Env  string
}

func loadConfig() Config {
	p := os.Getenv("PORT")
	if p == "" {
		p = "3000"
	}
	e := os.Getenv("APP_ENV")
	if e == "" {
		e = "development"
	}
	return Config{p, e}
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    "ok",
		"service":   "open-friday",
		"timestamp": time.Now().UTC(),
	})
}

func main() {
	cfg := loadConfig()
	mux := http.NewServeMux()
	mux.HandleFunc("/health", healthHandler)

	log.Printf("🚀 Open Friday Go service starting on port %s [%s]", cfg.Port, cfg.Env)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, mux))
}
