/* eslint-env browser */

import { createClient } from "@supabase/supabase-js"

// @ts-check
// Optional JS type checking, powered by TypeScript.
/** @typedef {import("partykit/server").Room} Room */
/** @typedef {import("partykit/server").Server} Server */
/** @typedef {import("partykit/server").Connection} Connection */
/** @typedef {import("partykit/server").ConnectionContext} ConnectionContext */

/**
 * @implements {Server}
 */
class PartyServer {
  /**
   * @param {Room} room - The Room object.
   */
  constructor(room) {
    /** @type {Room} */
    this.room = room
    this.channelCache = new Map()
    this.supabase = createClient(
      this.room.env.NEXT_PUBLIC_SUPABASE_URL,
      this.room.env.SUPABASE_SERVICE_KEY
    )
  }

  /**
   * @param {Connection} conn - The connection object.
   * @param {ConnectionContext} ctx - The context object.
   */
  onConnect(conn, ctx) {
    // A websocket just connected!
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`
    )

    // Send a message to the connection
    conn.send("hello from server")
  }

  /**
   * @param {string} message
   * @param {Connection} sender
   */
  onMessage(message, sender) {
    console.log(`connection ${sender.id} sent message: `)
    console.log(message)
    // Broadcast the received message to all other connections in the room except the sender
    this.room.broadcast(message, [sender.id])
    this.saveMessage(message)
  }
  async saveMessage(message) {
    try {
      const data = JSON.parse(message)
      let channelId = this.channelCache.get(this.room.id)

      if (!channelId) {
        const { data: channel, error } = await this.supabase
          .from("chat_channels")
          .select("id")
          .eq("courseOfferedId", this.room.id)
          .single()

        if (!channel) {
          console.error("No channel found for course:", this.room.id, error)

          return
        }
        channelId = channel.id
        this.channelCache.set(this.room.id, channelId)
      }
      const { data: savedMessage, error: messageError } = await this.supabase
        .from("chat_messages")
        .insert({
          channelId: channelId,
          userId: data.userId,
          sender: data.sender,
          content: data.message,
          imageUrl: data.imageUrl || null,
          createdAt: data.timestamp,
        })
        .select()
        .single()

      if (messageError) {
        console.error("Error saving message:", messageError)
        return
      }

      console.log("Message saved successfully:", savedMessage.id)
    } catch (error) {}
  }
}

export default PartyServer
