"use client"
import React, { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { SendHorizonal } from "lucide-react"
import usePartySocket from "partysocket/react"
import { createClient } from "@/lib/supabase/client"

const ChatBox = ({ userProfile, activeCourseID }) => {
  const supabase = createClient()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true)
      try {
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
              course_offered_id
            )
  `
          )
          .eq("channel.course_offered_id", activeCourseID)
          .order("created_at", { ascending: true })
          .limit(50)
        if (error) throw error
        const formattedMessages = messagesData.map((msg) => ({
          id: msg.id,
          sender: msg.user.name,
          message: msg.content,
          timestamp: msg.created_at,
          userId: msg.user.id,
        }))

        setMessages(formattedMessages)
      } catch (error) {
        throw error
      } finally {
        setIsLoading(false)
      }
    }
    loadMessages()
  }, [activeCourseID])

  const ws = usePartySocket({
    // usePartySocket takes the same arguments as PartySocket.
    host: "localhost:1999", // or localhost:1999 in dev
    room: activeCourseID,

    // in addition, you can provide socket lifecycle event handlers
    // (equivalent to using ws.addEventListener in an effect hook)
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
      id: crypto.randomUUID(),
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
    <div className="h-full w-full grid grid-rows-[8fr_1fr] gap-2">
      <Card className="h-full bg-secondary-foreground rounded-2sm">
        <CardContent className="flex flex-col gap-3">
          {messages.map((m, idx) => {
            return (
              <div key={idx}>
                {m.sender === userProfile.name ? (
                  <div className="w-full h-full flex justify-end">
                    <span className="font-bold"></span>
                    <span>{m.message}</span>
                  </div>
                ) : (
                  <div className="w-full h-full flex justify-start">
                    <span className="font-bold">{m.sender}: </span>
                    <span>{m.message}</span>
                  </div>
                )}
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>
      <div className="flex items-end gap-2">
        <Textarea
          className="w-full min-h-1.5 rounded-xs"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button onClick={handleMessageSubmit}>
          <SendHorizonal />
        </Button>
      </div>
    </div>
  )
}

export default ChatBox
