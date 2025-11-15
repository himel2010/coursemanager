import React from "react"
import { Avatar, AvatarFallback } from "./ui/avatar"

const ChatNameDisplay = ({ message }) => {
  const getInitials = (message) => {
    return message?.sender
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="w-full h-full flex flex-row justify-start items-center gap-3 hover:bg-muted/65  hover:rounded-md p-2 py-2">
      <div>
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="text-sm font-bold text-center flex justify-center items-center">
            {getInitials(message)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-primary text-sm">{message.sender}</span>
        <span className="">{message.message}</span>
      </div>
    </div>
  )
}

export default ChatNameDisplay
