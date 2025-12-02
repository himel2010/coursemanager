'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
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
    title: "Thesis Groups",
    href: "/thesis-groups",
  },
  {
    title: "Opportunities",
    href: "/opportunities",
  },
  {
    title: "Admin",
    href: "#",
  },
]

// Sample users in channels
const CHANNEL_USERS = [
  { id: 1, name: 'Alice Johnson', avatar: 'AJ', status: 'online' },
  { id: 2, name: 'Bob Smith', avatar: 'BS', status: 'online' },
  { id: 3, name: 'Charlie Brown', avatar: 'CB', status: 'offline' },
  { id: 4, name: 'Diana Prince', avatar: 'DP', status: 'online' },
  { id: 5, name: 'Ethan Hunt', avatar: 'EH', status: 'away' },
]

export default function ChannelsPage() {
  const [channels, setChannels] = useState([
    { id: 1, name: 'general', description: 'General discussion' },
    { id: 2, name: 'announcements', description: 'Important announcements' },
    { id: 3, name: 'random', description: 'Off-topic conversations' },
  ])
  
  const [messages, setMessages] = useState({
    1: [
      { id: 1, author: 'You', userId: 'current-user', avatar: 'YU', content: 'Welcome to general!', timestamp: new Date(Date.now() - 3600000), type: 'text' },
    ],
    2: [],
    3: [],
  })
  
  const [selectedChannelId, setSelectedChannelId] = useState(1)
  const [messageText, setMessageText] = useState('')
  const [attachments, setAttachments] = useState([])
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelDesc, setNewChannelDesc] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingChannelId, setEditingChannelId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [selectedUserForDM, setSelectedUserForDM] = useState(null)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const fileInputRef = useRef(null)
  const scrollAreaRef = useRef(null)

  const selectedChannel = channels.find(c => c.id === selectedChannelId)
  const channelMessages = messages[selectedChannelId] || []

  const createChannel = () => {
    if (newChannelName.trim()) {
      const newChannel = {
        id: Math.max(...channels.map(c => c.id), 0) + 1,
        name: newChannelName.toLowerCase().replace(/\s+/g, '-'),
        description: newChannelDesc || 'No description'
      }
      setChannels([...channels, newChannel])
      setMessages(prev => ({ ...prev, [newChannel.id]: [] }))
      setSelectedChannelId(newChannel.id)
      setNewChannelName('')
      setNewChannelDesc('')
      setShowCreateModal(false)
    }
  }

  const renameChannel = (channelId, newName, newDesc) => {
    setChannels(channels.map(c => 
      c.id === channelId 
        ? { ...c, name: newName.toLowerCase().replace(/\s+/g, '-'), description: newDesc }
        : c
    ))
    setEditingChannelId(null)
  }

  const deleteChannel = (channelId) => {
    const updatedChannels = channels.filter(c => c.id !== channelId)
    setChannels(updatedChannels)
    const updatedMessages = { ...messages }
    delete updatedMessages[channelId]
    setMessages(updatedMessages)
    if (selectedChannelId === channelId) {
      setSelectedChannelId(updatedChannels[0]?.id || null)
    }
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
    if (!messageText.trim() && attachments.length === 0) return

    const newMessage = {
      id: Math.random(),
      author: 'You',
      userId: 'current-user',
      avatar: 'YU',
      content: messageText,
      timestamp: new Date(),
      type: attachments.length > 0 ? 'mixed' : 'text',
      attachments: attachments
    }

    setMessages(prev => ({
      ...prev,
      [selectedChannelId]: [...(prev[selectedChannelId] || []), newMessage]
    }))

    setMessageText('')
    setAttachments([])
  }

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }

  const handleUserClick = (user) => {
    setSelectedUserForDM(user)
    setShowUserProfile(true)
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
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Community Channels</h1>
          <p className="text-muted-foreground">Create and manage dedicated channels for your course sections</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
          {/* Channels Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg">Channels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 flex-1 flex flex-col overflow-hidden p-3">
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="w-full"
                  size="sm"
                >
                  + New Channel
                </Button>

                <ScrollArea className="flex-1">
                  <div className="space-y-2 pr-4">
                    {channels.map(channel => (
                      <div
                        key={channel.id}
                        className={`group p-3 rounded-lg cursor-pointer transition-all border-l-4 ${
                          selectedChannelId === channel.id
                            ? 'bg-blue-50 border-l-blue-600 text-blue-900 font-semibold'
                            : 'hover:bg-blue-100/40 border-l-transparent hover:border-l-blue-300'
                        }`}
                        onClick={() => setSelectedChannelId(channel.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">#{channel.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{channel.description}</p>
                          </div>
                          
                          {/* Channel Options Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button 
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-opacity flex-shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="text-xs">⋮</span>
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => {
                                setEditingChannelId(channel.id)
                                setEditName(channel.name)
                                setEditDesc(channel.description)
                              }}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => deleteChannel(channel.id)}
                                className="text-red-600"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Channel View */}
          <div className="lg:col-span-3">
            {selectedChannel ? (
              <Card className="h-full flex flex-col">
                {/* Channel Header */}
                <CardHeader className="border-b pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl">#{selectedChannel.name}</CardTitle>
                      <CardDescription className="mt-2">{selectedChannel.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">⋮</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setEditingChannelId(selectedChannel.id)
                          setEditName(selectedChannel.name)
                          setEditDesc(selectedChannel.description)
                        }}>
                          Edit Channel
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => deleteChannel(selectedChannel.id)}
                          className="text-red-600"
                        >
                          Delete Channel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {channelMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-32">
                        <p className="text-muted-foreground text-center">
                          This is the beginning of #{selectedChannel.name}. Start the conversation!
                        </p>
                      </div>
                    ) : (
                      channelMessages.map(msg => (
                        <div key={msg.id} className="flex gap-3 group hover:bg-blue-100/40 p-2 rounded-lg transition-all border-l-4 border-l-transparent hover:border-l-blue-300">
                          <button
                            onClick={() => handleUserClick(msg)}
                            className="w-10 h-10 rounded-full bg-blue-400 hover:bg-blue-500 flex-shrink-0 flex items-center justify-center text-sm font-semibold text-white hover:ring-2 hover:ring-blue-600 transition-all cursor-pointer"
                            title={`Click to message ${msg.author}`}
                          >
                            {msg.avatar}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUserClick(msg)}
                                className="font-semibold text-sm hover:text-blue-600 hover:underline transition-colors cursor-pointer"
                                title={`Click to message ${msg.author}`}
                              >
                                {msg.author}
                              </button>
                              <span className="text-xs text-muted-foreground">{formatTime(msg.timestamp)}</span>
                            </div>
                            {msg.content && (
                              <p className="text-sm mt-1 break-words">{msg.content}</p>
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
                                        className="max-w-xs max-h-96 rounded-lg border border-slate-200"
                                      />
                                    )}
                                    {isVideo(att.type) && (
                                      <video 
                                        src={att.data}
                                        controls
                                        className="max-w-xs max-h-96 rounded-lg border border-slate-200"
                                      />
                                    )}
                                    {!isImage(att.type) && !isVideo(att.type) && (
                                      <a
                                        href={att.data}
                                        download={att.name}
                                        className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm border border-slate-200 transition-colors"
                                      >
                                        <span>📎</span>
                                        <div>
                                          <p className="font-medium">{att.name}</p>
                                          <p className="text-xs text-muted-foreground">{formatFileSize(att.size)}</p>
                                        </div>
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
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
                      placeholder={`Message #${selectedChannel.name}`}
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
                    Shift+Enter for new line • Click on user avatar or name to send DM
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="flex items-center justify-center min-h-64">
                <p className="text-muted-foreground">Select a channel to start</p>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* User Profile & DM Modal */}
      {showUserProfile && selectedUserForDM && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-slate-400 flex items-center justify-center text-lg font-semibold text-white">
                    {selectedUserForDM.avatar}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-4 h-4 ${getStatusColor(selectedUserForDM.status)} rounded-full border-2 border-white`}></div>
                </div>
                <div>
                  <CardTitle>{selectedUserForDM.author}</CardTitle>
                  <CardDescription className="capitalize">{selectedUserForDM.status || 'online'}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-4">What would you like to do?</p>
              </div>
              <div className="flex gap-3 flex-col">
                <Link href="/community/direct-messages" className="w-full">
                  <Button className="w-full">
                    💬 Send Direct Message
                  </Button>
                </Link>
                <Button variant="outline" className="w-full">
                  👤 View Profile
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowUserProfile(false)
                    setSelectedUserForDM(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Channel Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Channel</CardTitle>
              <CardDescription>Add a new channel to your community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Channel Name</label>
                <Input 
                  placeholder="e.g., general, announcements"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description (Optional)</label>
                <Input 
                  placeholder="What is this channel about?"
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewChannelName('')
                    setNewChannelDesc('')
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={createChannel}>Create Channel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Channel Modal */}
      {editingChannelId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Channel</CardTitle>
              <CardDescription>Update channel information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Channel Name</label>
                <Input 
                  placeholder="Channel name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input 
                  placeholder="Channel description"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button 
                  variant="outline"
                  onClick={() => setEditingChannelId(null)}
                >
                  Cancel
                </Button>
                <Button onClick={() => renameChannel(editingChannelId, editName, editDesc)}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

