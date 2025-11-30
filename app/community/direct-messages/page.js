'use client'

import { useState, useRef } from 'react'
import Header from "@/components/shadcn-studio/blocks/hero-section-01/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

const navigationData = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Dashboard",
    href: "/user-dashboard",
  },
  {
    title: "Admin",
    href: "#",
  },
]

// Sample users in community
const COMMUNITY_USERS = [
  { id: 1, name: 'Alice Johnson', avatar: 'AJ', status: 'online' },
  { id: 2, name: 'Bob Smith', avatar: 'BS', status: 'online' },
  { id: 3, name: 'Charlie Brown', avatar: 'CB', status: 'offline' },
  { id: 4, name: 'Diana Prince', avatar: 'DP', status: 'online' },
  { id: 5, name: 'Ethan Hunt', avatar: 'EH', status: 'away' },
  { id: 6, name: 'Fiona Apple', avatar: 'FA', status: 'online' },
]

export default function DirectMessagesPage() {
  const [conversations, setConversations] = useState({})
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [attachments, setAttachments] = useState([])
  const [showUserList, setShowUserList] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef(null)

  const selectedUser = COMMUNITY_USERS.find(u => u.id === selectedUserId)
  const conversationMessages = selectedUserId ? (conversations[selectedUserId] || []) : []
  
  const filteredUsers = COMMUNITY_USERS.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeConversations = Object.keys(conversations).filter(
    userId => conversations[userId].length > 0
  ).map(userId => COMMUNITY_USERS.find(u => u.id === parseInt(userId)))

  const startConversation = (userId) => {
    setSelectedUserId(userId)
    if (!conversations[userId]) {
      setConversations(prev => ({ ...prev, [userId]: [] }))
    }
    setShowUserList(false)
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const fileData = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: event.target?.result,
          id: Math.random()
        }
        setAttachments(prev => [...prev, fileData])
      }
      reader.readAsDataURL(file)
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const sendMessage = () => {
    if (!selectedUserId || (!messageText.trim() && attachments.length === 0)) return

    const newMessage = {
      id: Math.random(),
      sender: 'You',
      senderId: 'current-user',
      content: messageText,
      timestamp: new Date(),
      attachments: attachments
    }

    setConversations(prev => ({
      ...prev,
      [selectedUserId]: [...(prev[selectedUserId] || []), newMessage]
    }))

    setMessageText('')
    setAttachments([])
  }

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      default: return 'bg-gray-400'
    }
  }

  const isImage = (type) => type.startsWith('image/')
  const isVideo = (type) => type.startsWith('video/')

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header navigationData={navigationData} />
      
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl mx-auto w-full">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Direct Messages</h1>
          <p className="text-muted-foreground">Connect with community members</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
          {/* Users Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg">Messages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 flex-1 flex flex-col overflow-hidden p-3">
                <div className="space-y-3">
                  <Button 
                    onClick={() => setShowUserList(!showUserList)}
                    variant={showUserList ? "default" : "outline"}
                    className="w-full"
                    size="sm"
                  >
                    {showUserList ? '👥 Browse Users' : '👥 Back to Browse'}
                  </Button>

                  {activeConversations.length > 0 && !showUserList && (
                    <>
                      <div className="text-xs font-semibold text-muted-foreground px-2 py-1">ACTIVE CONVERSATIONS</div>
                      <div className="space-y-1">
                        {activeConversations.map(user => (
                          <div
                            key={user.id}
                            className={`group p-2 rounded-lg cursor-pointer transition-all border-l-4 ${
                              selectedUserId === user.id
                                ? 'bg-blue-50 border-l-blue-600 text-blue-900 font-semibold'
                                : 'hover:bg-blue-100/40 border-l-transparent hover:border-l-blue-300'
                            }`}
                            onClick={() => setSelectedUserId(user.id)}
                          >
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center text-xs font-semibold text-white">
                                  {user.avatar}
                                </div>
                                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${getStatusColor(user.status)} rounded-full border border-white`}></div>
                              </div>
                              <span className="text-sm font-medium truncate flex-1">{user.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {showUserList && (
                  <>
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="text-sm"
                    />
                    <div className="text-xs font-semibold text-muted-foreground px-2 py-1">ALL USERS</div>
                    <ScrollArea className="flex-1">
                      <div className="space-y-1 pr-4">
                        {filteredUsers.map(user => (
                          <button
                            key={user.id}
                            onClick={() => startConversation(user.id)}
                            className="w-full p-2 rounded-lg hover:bg-blue-100/40 transition-all border-l-4 border-l-transparent hover:border-l-blue-400 text-left group"
                          >
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center text-xs font-semibold text-white">
                                  {user.avatar}
                                </div>
                                <div className={`absolute bottom-0 right-0 w-2 h-2 ${getStatusColor(user.status)} rounded-full border border-white`}></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.status}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Chat View */}
          <div className="lg:col-span-3">
            {selectedUser ? (
              <Card className="h-full flex flex-col">
                {/* User Header */}
                <CardHeader className="border-b pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-slate-400 flex items-center justify-center text-sm font-semibold text-white">
                          {selectedUser.avatar}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(selectedUser.status)} rounded-full border border-white`}></div>
                      </div>
                      <div>
                        <CardTitle>{selectedUser.name}</CardTitle>
                        <CardDescription className="capitalize">{selectedUser.status}</CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">⋮</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Block User</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {conversationMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-32">
                        <p className="text-muted-foreground text-center">
                          Start a conversation with {selectedUser.name}
                        </p>
                      </div>
                    ) : (
                      conversationMessages.map(msg => (
                        <div key={msg.id} className={`flex gap-3 ${msg.senderId === 'current-user' ? 'justify-end' : ''}`}>
                          {msg.senderId !== 'current-user' && (
                            <div className="w-8 h-8 rounded-full bg-slate-400 flex-shrink-0 flex items-center justify-center text-xs font-semibold text-white">
                              {selectedUser.avatar}
                            </div>
                          )}
                          <div className={`flex-1 max-w-xs ${msg.senderId === 'current-user' ? 'items-end' : ''}`}>
                            {msg.senderId !== 'current-user' && (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">{selectedUser.name}</span>
                                <span className="text-xs text-muted-foreground">{formatTime(msg.timestamp)}</span>
                              </div>
                            )}
                            {msg.content && (
                              <div className={`px-3 py-2 rounded-lg break-words ${
                                msg.senderId === 'current-user'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-slate-100 text-slate-900'
                              }`}>
                                <p className="text-sm">{msg.content}</p>
                              </div>
                            )}

                            {/* Attachments */}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {msg.attachments.map(att => (
                                  <div key={att.id}>
                                    {isImage(att.type) && (
                                      <img 
                                        src={att.data} 
                                        alt={att.name}
                                        className="max-w-xs max-h-64 rounded-lg"
                                      />
                                    )}
                                    {isVideo(att.type) && (
                                      <video 
                                        src={att.data}
                                        controls
                                        className="max-w-xs max-h-64 rounded-lg"
                                      />
                                    )}
                                    {!isImage(att.type) && !isVideo(att.type) && (
                                      <a
                                        href={att.data}
                                        download={att.name}
                                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
                                          msg.senderId === 'current-user'
                                            ? 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white'
                                            : 'bg-slate-200 hover:bg-slate-300 border-slate-200'
                                        }`}
                                      >
                                        <span>📎</span>
                                        <div>
                                          <p className="font-medium">{att.name}</p>
                                          <p className="text-xs opacity-75">{formatFileSize(att.size)}</p>
                                        </div>
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            {msg.senderId === 'current-user' && (
                              <span className="text-xs text-muted-foreground block text-right mt-1">{formatTime(msg.timestamp)}</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {/* Attachments Preview */}
                {attachments.length > 0 && (
                  <div className="border-t px-4 py-3 space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {attachments.map(att => (
                        <div key={att.id} className="relative group">
                          {isImage(att.type) ? (
                            <img 
                              src={att.data} 
                              alt={att.name}
                              className="w-full h-20 object-cover rounded border border-slate-200"
                            />
                          ) : isVideo(att.type) ? (
                            <div className="w-full h-20 bg-slate-200 rounded border border-slate-200 flex items-center justify-center">
                              <span className="text-2xl">🎥</span>
                            </div>
                          ) : (
                            <div className="w-full h-20 bg-slate-100 rounded border border-slate-200 flex items-center justify-center flex-col">
                              <span className="text-lg">📄</span>
                              <span className="text-xs text-center px-1 truncate">{att.name}</span>
                            </div>
                          )}
                          <button
                            onClick={() => removeAttachment(att.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <div className="border-t p-4 space-y-3">
                  <div className="flex gap-2">
                    <Input 
                      placeholder={`Message ${selectedUser.name}`}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                      className="flex-1"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach files"
                    >
                      📎
                    </Button>
                    <Button
                      onClick={sendMessage}
                      disabled={!messageText.trim() && attachments.length === 0}
                    >
                      Send
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Shift+Enter for new line
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="flex items-center justify-center min-h-64">
                <p className="text-muted-foreground">Select a user to start messaging</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
