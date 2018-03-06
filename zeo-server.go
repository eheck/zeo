package main

import (
	"os"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strings"
	"io/ioutil"
)

type Connection struct {
	user string
	channel chan string
}

type Message struct {
	user string
	data string
}

type Api struct {
	new chan Connection
	disconnected chan Connection
	users map[string]chan string
	messages chan Message
}

func newApi() *Api {
	api := new(Api)

	api.new = make(chan Connection)
	api.disconnected = make(chan Connection)
	api.users = make(map[string]chan string)
	api.messages = make(chan Message)

	return api
}

func (a *Api) start() {
	go func() {
		for {
			select {
			case c := <- a.new:
				_, used := a.users[c.user]

				if !used {
					a.users[c.user] = c.channel
					log.Printf("user added: %s ", c.user)
				} else {
					log.Printf("user not added: %s: conflict", c.user)
				}

			case c := <- a.disconnected:
				_, used := a.users[c.user]

				if used {
					delete(a.users, c.user)
					close(c.channel)
					log.Printf("user removed %s", c.user)
				} else {
					log.Printf("user not removed: %s: not found", c.user)
				}

			case m := <- a.messages:
				channel, used := a.users[m.user]

				if used {
					channel <- m.data
					log.Printf("message sent to %s", m.user)
				} else {
					log.Printf("message not sent to %s: not found", m.user)
				}
			}
		}
	}()
}

func (a *Api) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "" {
		http.HandlerFunc(indexHandler).ServeHTTP(w,r)
		return
	}

	connect := regexp.MustCompile("connect/([^/]+)")
	if connect.MatchString(r.URL.Path) {
		a.handleConnect(w,r)
		return
	}

	notifications := regexp.MustCompile("notifications/([^/]+)")
	if notifications.MatchString(r.URL.Path) {
		a.handleNotifications(w,r)
		return
	}

	w.WriteHeader(http.StatusNotFound)
}

func (a *Api) handleConnect(w http.ResponseWriter, r *http.Request) {
	to := strings.Split(r.URL.Path, "/")[1]
	_, used := a.users[to]

	if !used {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	defer r.Body.Close()
	body, _ := ioutil.ReadAll(r.Body)

	a.messages <- Message{to, string(body)}
	w.WriteHeader(http.StatusOK)
}

func (a *Api) handleNotifications(w http.ResponseWriter, r *http.Request) {
	flusher, ok := w.(http.Flusher)

	if !ok {
		w.WriteHeader(http.StatusNotImplemented)
		return
	}

	id := strings.Split(r.URL.Path, "/")[1]
	_, used := a.users[id]

	if used {
		w.WriteHeader(http.StatusConflict)
		return
	}

	connection := &Connection{id, make(chan string)}
	a.new <- *connection
	disconnect := w.(http.CloseNotifier).CloseNotify()

	go func() {
		<-disconnect
		a.disconnected <- *connection
	}()

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	for {
		msg, open := <- connection.channel

		if !open {
			break
		}

		fmt.Fprintf(w, "data: %s\n\n", msg)
		flusher.Flush()
	}
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "index.html")
}

func main() {
	api := newApi()
	web := http.FileServer(http.Dir("web"))

	api.start()

	http.Handle("/api/", http.StripPrefix("/api/", api))
	http.Handle("/", http.StripPrefix("/", web))
	http.ListenAndServe(":" + os.Args[1], nil)
}
