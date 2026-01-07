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
    this.groupChannelCache = new Map()
    this.roomTypeCache = new Map() // Cache to store room type (course or group)
    this.supabase = createClient(
      this.room.env.NEXT_PUBLIC_SUPABASE_URL,
      this.room.env.SUPABASE_SERVICE_KEY,
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
  url: ${new URL(ctx.request.url).pathname}`,
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

      // Determine if this is a group chat or course chat
      const isGroupChat = await this.isGroupChat(this.room.id)

      if (isGroupChat) {
        // Handle group chat
        await this.saveGroupMessage(data)
      } else {
        // Handle course chat
        await this.saveCourseMessage(data)
      }
    } catch (error) {
      console.error("Error saving message:", error)
    }
  }

  async isGroupChat(roomId) {
    // Check cache first
    if (this.roomTypeCache.has(roomId)) {
      return this.roomTypeCache.get(roomId)
    }

    // Check if it's a group by querying group_chat_channels
    const { data: groupChannel, error: groupError } = await this.supabase
      .from("group_chat_channels")
      .select("id")
      .eq("groupId", roomId)
      .maybeSingle()

    if (groupChannel) {
      this.roomTypeCache.set(roomId, true)
      return true
    }

    // Check if it's a course by querying chat_channels
    const { data: courseChannel, error: courseError } = await this.supabase
      .from("chat_channels")
      .select("id")
      .eq("courseOfferedId", roomId)
      .maybeSingle()

    if (courseChannel) {
      this.roomTypeCache.set(roomId, false)
      return false
    }

    // Default to course chat if neither found (shouldn't happen)
    console.warn(
      `Room ${roomId} not found in either chat_channels or group_chat_channels`,
    )
    this.roomTypeCache.set(roomId, false)
    return false
  }

  async saveCourseMessage(data) {
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
      console.error("Error saving course message:", messageError)
      return
    }

    console.log("Course message saved successfully:", savedMessage.id)
  }

  async saveGroupMessage(data) {
    let channelId = this.groupChannelCache.get(this.room.id)

    if (!channelId) {
      const { data: channel, error } = await this.supabase
        .from("group_chat_channels")
        .select("id")
        .eq("groupId", this.room.id)
        .single()

      if (!channel) {
        console.error("No channel found for group:", this.room.id, error)
        return
      }
      channelId = channel.id
      this.groupChannelCache.set(this.room.id, channelId)
    }

    const { data: savedMessage, error: messageError } = await this.supabase
      .from("group_chat_messages")
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
      console.error("Error saving group message:", messageError)
      return
    }

    console.log("Group message saved successfully:", savedMessage.id)
  }
}

export default PartyServer
