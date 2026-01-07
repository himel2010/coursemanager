"use client"
import React, { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { SendHorizonal } from "lucide-react"
import usePartySocket from "partysocket/react"
import { createClient } from "@/lib/supabase/client"
import ChatNameDisplay from "./ChatNameDisplay"
import { ScrollArea } from "./ui/scroll-area"
import axios from "axios"

const ChatBox = ({
  userProfile,
  activeCourseID,
  messageCache,
  chatType = "course",
}) => {
  const supabase = createClient()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true)
      try {
        if (chatType === "course") {
          // Load course chat messages
          const { data: messagesData, error } = await supabase
            .from("chat_messages")
            .select(
              `
          *,
          user:users!inner (
            id,
            name
          ),
          chat_channels!inner (
            courseOfferedId
          )
        `,
            )
            .eq("chat_channels.courseOfferedId", activeCourseID)
            .order("createdAt", { ascending: true })
            .limit(50)

          if (error) throw error

          const formattedMessages = messagesData.map((msg) => ({
            id: msg.id,
            sender: msg.user.name,
            message: msg.content,
            timestamp: msg.createdAt,
            userId: msg.user.id,
          }))

          setMessages(formattedMessages)
        } else {
          // Load group chat messages
          const response = await axios.get(
            `/api/group-chat/messages?groupId=${activeCourseID}`,
          )
          setMessages(response.data)
        }
      } catch (error) {
        console.error("Error loading messages:", error)
        setMessages([])
      } finally {
        setIsLoading(false)
      }
    }

    loadMessages()
  }, [activeCourseID, chatType])

  const ws = usePartySocket({
    host: "http://localhost:1999",
    room: activeCourseID,
    onOpen() {
      console.log("connected")
    },
    onMessage(e) {
      try {
        const incoming_message = JSON.parse(e.data)
        console.log("message", incoming_message)
        newMessage(incoming_message)
      } catch {
        console.warn("Received non-JSON message:", e.data)
      }
    },
    onClose() {
      console.log("closed")
    },
    onError(e) {
      console.log("error")
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const newMessage = (newmessage) => {
    console.log("Setting Message")
    console.log(newmessage)
    setMessages((prev) => [...prev, newmessage])
  }

  const handleMessageSubmit = async () => {
    if (!message.trim()) return

    const newMsg = {
      sender: userProfile.name,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      userId: userProfile.id,
    }
    setMessages((prev) => [...prev, newMsg])

    ws.send(JSON.stringify(newMsg))

    setMessage("")
  }

  return (
    <div className="h-full w-full grid grid-rows-[7fr_1fr] gap-2">
      <Card className="bg-muted/30 rounded-2sm border-none overflow-hidden min-h-0">
        <ScrollArea className="h-full w-full">
          <CardContent className="">
            {messages.map((m, idx) => {
              return (
                <div key={idx}>
                  <div className="w-full h-full flex justify-start">
                    <ChatNameDisplay message={m} />
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </CardContent>
        </ScrollArea>
      </Card>
      <div className="h-full w-full flex items-end gap-2">
        <Textarea
          className="w-full rounded-xs"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(event) => {
            if (event.key == "Enter" && !event.shiftKey) {
              event.preventDefault()
              handleMessageSubmit()
            }
          }}
        />
        <Button onClick={handleMessageSubmit}>
          <SendHorizonal />
        </Button>
      </div>
    </div>
  )
}

export default ChatBox
