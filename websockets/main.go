package main

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gorilla/websocket"
)

var clients = make(map[*websocket.Conn]bool)

var broadcast = make(chan int)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func main() {
	http.HandleFunc("/ws", wsHandler)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "index.html")
	})

	go func() {
		for {
			msg := <-broadcast

			for clients := range clients {
				clients.WriteMessage(websocket.TextMessage, []byte(strconv.Itoa(msg)))
			}
		}
	}()

	http.ListenAndServe(":8080", nil)
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Error al hacer upgrade:", err)
		return
	}
	defer ws.Close()

	clients[ws] = true

	broadcast <- len(clients)

	for {
		_, msg, err := ws.ReadMessage()
		if err != nil {
			fmt.Println("Error al leer mensaje:", err)
			break
		}

		fmt.Printf("Mensaje recibido: %s\n", msg)

		err = ws.WriteMessage(websocket.TextMessage, []byte("Mensaje recibido"))

		if err != nil {
			ws.Close()
			delete(clients, ws)
			broadcast <- len(clients)
			break
		}
	}
}
