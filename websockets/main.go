package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/rs/cors"
)

// Estructura para manejar mensajes WebSocket
type Message struct {
	Event string      `json:"event"`
	Data  interface{} `json:"data,omitempty"`
	User  *User       `json:"user,omitempty"`
}

// Estructura del usuario (debe coincidir con tu API)
type User struct {
	ID       int    `json:"id"`
	Email    string `json:"email"`
	Username string `json:"username"`
	IsActive bool   `json:"is_active"`
}

// Estructura del cliente WebSocket
type Client struct {
	conn   *websocket.Conn
	send   chan Message
	hub    *Hub
	id     string
	active bool
}

// Hub maneja todas las conexiones WebSocket activas
type Hub struct {
	clients    map[*Client]bool
	broadcast  chan Message
	register   chan *Client
	unregister chan *Client
	mutex      sync.RWMutex
}

// Upgrader para WebSocket con configuración CORS
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Permitir todas las conexiones (ajustar según necesidades)
	},
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// Crear nueva instancia del Hub
func newHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan Message),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

// Ejecutar el Hub (goroutine principal)
func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.mutex.Lock()
			h.clients[client] = true
			h.mutex.Unlock()

			log.Printf("Cliente conectado. Total de conexiones: %d", len(h.clients))

			// Enviar mensaje de confirmación de conexión
			confirmationMsg := Message{
				Event: "connection_established",
				Data:  "Connected to WebSocket successfully",
			}

			select {
			case client.send <- confirmationMsg:
			default:
				close(client.send)
				h.mutex.Lock()
				delete(h.clients, client)
				h.mutex.Unlock()
			}

		case client := <-h.unregister:
			h.mutex.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				client.active = false
			}
			h.mutex.Unlock()

			log.Printf("Cliente desconectado. Total de conexiones: %d", len(h.clients))

		case message := <-h.broadcast:
			h.mutex.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					delete(h.clients, client)
					close(client.send)
					client.active = false
				}
			}
			h.mutex.RUnlock()
		}
	}
}

// Obtener número de conexiones activas
func (h *Hub) getConnectionCount() int {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	return len(h.clients)
}

// Leer mensajes del cliente WebSocket
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	// Configurar timeouts
	c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		var msg map[string]interface{}
		err := c.conn.ReadJSON(&msg)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Error inesperado de WebSocket: %v", err)
			}
			break
		}

		log.Printf("Mensaje recibido del cliente %s: %v", c.id, msg)

		// Procesar mensaje recibido
		response := Message{
			Event: "message_received",
			Data:  msg,
		}

		select {
		case c.send <- response:
		default:
			close(c.send)
			return
		}
	}
}

// Escribir mensajes al cliente WebSocket
func (c *Client) writePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.conn.WriteJSON(message); err != nil {
				log.Printf("Error escribiendo mensaje: %v", err)
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// Handler para conexiones WebSocket
func (h *Hub) wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Error al hacer upgrade de WebSocket: %v", err)
		return
	}

	clientID := fmt.Sprintf("client_%d", time.Now().UnixNano())
	client := &Client{
		conn:   conn,
		send:   make(chan Message, 256),
		hub:    h,
		id:     clientID,
		active: true,
	}

	client.hub.register <- client

	// Iniciar goroutines para lectura y escritura
	go client.writePump()
	go client.readPump()
}

// Handler para recibir notificaciones de creación de usuario desde FastAPI
func (h *Hub) userCreatedHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		log.Printf("Error decodificando usuario: %v", err)
		http.Error(w, "Error en formato JSON", http.StatusBadRequest)
		return
	}

	log.Printf("Usuario creado recibido: %+v", user)

	// Crear mensaje para broadcast
	message := Message{
		Event: "user_created",
		User:  &user,
	}

	// Enviar a todos los clientes conectados
	h.broadcast <- message

	// Responder confirmación
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"message": "Evento de usuario creado enviado a todos los clientes",
		"clients": h.getConnectionCount(),
	})
}

// Handler para obtener estadísticas de WebSocket
func (h *Hub) statsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"active_connections": h.getConnectionCount(),
		"status":             "running",
		"timestamp":          time.Now().Unix(),
	})
}

// Handler para health check
func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    "healthy",
		"service":   "websocket-server",
		"timestamp": time.Now().Unix(),
	})
}

func main() {
	// Crear Hub y ejecutar en goroutine
	hub := newHub()
	go hub.run()

	// Crear router
	router := mux.NewRouter()

	// Rutas WebSocket
	router.HandleFunc("/ws/users", hub.wsHandler)

	// Rutas HTTP para recibir eventos
	router.HandleFunc("/api/notify/user-created", hub.userCreatedHandler).Methods("POST")
	router.HandleFunc("/api/stats", hub.statsHandler).Methods("GET")
	router.HandleFunc("/health", healthHandler).Methods("GET")

	// Configurar CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:8000"}, // Ajustar según tus dominios
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	handler := c.Handler(router)

	// Configurar servidor
	server := &http.Server{
		Addr:         ":8080",
		Handler:      handler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	log.Println("🚀 Servidor WebSocket iniciado en puerto 8080")
	log.Println("📡 WebSocket disponible en: ws://localhost:8080/ws/users")
	log.Println("🔄 API para notificaciones: http://localhost:8080/api/notify/user-created")
	log.Println("📊 Estadísticas: http://localhost:8080/api/stats")
	log.Println("💚 Health check: http://localhost:8080/health")

	if err := server.ListenAndServe(); err != nil {
		log.Fatal("Error iniciando servidor:", err)
	}
}
