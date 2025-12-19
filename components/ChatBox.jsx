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

const ChatBox = ({ userProfile, activeCourseID, messageCache }) => {
  const supabase = createClient()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const loadMessages = async () => {
      let cacheMessage = messageCache.get(activeCourseID)
      console.log(cacheMessage)
      if (true) {
        console.log("No Cache")
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
            courseOfferedId
          )
        `
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
          messageCache.set(activeCourseID, formattedMessages)
        } catch (error) {
          throw error
        } finally {
          setIsLoading(false)
          console.log(messageCache)
        }
      } else {
        console.log("Getting Cached Message")
        setMessages(messageCache.get(activeCourseID))
        setIsLoading(false)
      }
    }
    console.log("loadings")
    loadMessages()
  }, [activeCourseID])

  const ws = usePartySocket({
    // usePartySocket takes the same arguments as PartySocket.
    host: "https://moodly-party.himel2010.partykit.dev/", // or localhost:1999 in dev
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
    // if (messages.length > 0) {
    //   messageCache.set(activeCourseID, messages)
    // }
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
