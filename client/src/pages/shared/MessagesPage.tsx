import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { apiFetch, getFileUrl } from '../../services/api';
import {
  MessageSquare,
  Send,
  Users,
  Hash,
  Lock,
  Plus,
  UserPlus,
  X,
  Paperclip,
  FileText,
  Download,
  Check,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [showNewDirectModal, setShowNewDirectModal] = useState(false);

  // File Attachment State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    loadFacultyDirectory();
  }, [user?._id]);

  useEffect(() => {
    if (activeConv) {
      loadMessages(activeConv._id);
      if (socket) {
        socket.emit('join_conversation', activeConv._id);
      }
    }
  }, [activeConv?._id]);

  // Real-time socket message handler with deduplication guard
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: any) => {
      if (activeConv && data.conversationId === activeConv._id) {
        setMessages((prev) => {
          // Prevent any duplicate message from rendering
          const alreadyExists = prev.some((m) => m._id === data.message._id);
          if (alreadyExists) return prev;
          return [...prev, data.message];
        });
        scrollToBottom();
      }
      loadConversations();
    };

    const handleUserTyping = (data: any) => {
      if (activeConv && data.conversationId === activeConv._id) {
        setTypingUser(data.user.fullName);
        setTimeout(() => setTypingUser(null), 3000);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
    };
  }, [socket, activeConv?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const res = await apiFetch('/chat/conversations');
      if (res.success && res.data) {
        setConversations(res.data);
        if (res.data.length > 0 && !activeConv) {
          setActiveConv(res.data[0]);
        }
      }
    } catch {
      // Ignore
    }
  };

  const loadFacultyDirectory = async () => {
    try {
      const res = await apiFetch('/users/faculty');
      if (res.success && res.data) {
        setFacultyList(res.data.filter((f: any) => f._id !== user?._id));
      }
    } catch {
      // Ignore
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const res = await apiFetch(`/chat/messages/${convId}`);
      if (res.success && res.data) {
        setMessages(res.data);
      }
    } catch {
      // Ignore
    }
  };

  const handleStartDirectChat = async (targetUserId: string) => {
    try {
      const res = await apiFetch('/chat/conversations', {
        method: 'POST',
        body: JSON.stringify({
          type: 'DIRECT',
          participantIds: [targetUserId]
        })
      });

      if (res.success && res.data) {
        setShowNewDirectModal(false);
        await loadConversations();
        setActiveConv(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Could not start private chat.');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedFile) || !activeConv) return;

    try {
      let attachments: any[] = [];

      // If document is selected, upload it first
      if (selectedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await apiFetch('/upload', {
          method: 'POST',
          body: formData
        });

        if (uploadRes.success && uploadRes.data) {
          attachments.push(uploadRes.data);
        }
        setUploading(false);
      }

      const res = await apiFetch('/chat/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: activeConv._id,
          content: inputText,
          attachments
        })
      });

      if (res.success && res.data) {
        const newMsg = res.data;

        // Deduplication: Only append if not already in state
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });

        // Broadcast to other participant sockets
        if (socket) {
          socket.emit('send_message', {
            conversationId: activeConv._id,
            message: newMsg
          });
        }

        setInputText('');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        loadConversations();
      }
    } catch (err: any) {
      alert(err.message || 'Message dispatch failed');
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-xl border border-[#E6E8ED] bg-white shadow-sm overflow-hidden max-w-7xl mx-auto">
      {/* Left Chat Channels Sidebar */}
      <div className={`${activeConv ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-[#E6E8ED] bg-[#F7F8FA] flex-col shrink-0`}>
        <div className="p-3.5 border-b border-[#E6E8ED] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#24232B] flex items-center space-x-1.5">
            <Lock className="w-4 h-4 text-[#7051C8]" />
            <span>My Private Chats</span>
          </h2>
          <button
            onClick={() => setShowNewDirectModal(true)}
            className="p-1 rounded-md text-[#7051C8] hover:bg-purple-100/60"
            title="Start Private 1-on-1 Chat"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#E6E8ED]">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#737784]">
              No active private chats. Click the <strong>+</strong> button above to start a conversation with a colleague.
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = activeConv?._id === conv._id;
              const isDirect = conv.type === 'DIRECT';
              const otherUser = conv.participants?.find((p: any) => p._id !== user._id);
              const displayName = isDirect ? (otherUser?.fullName || 'Faculty Member') : conv.name;

              return (
                <div
                  key={conv._id}
                  onClick={() => setActiveConv(conv)}
                  className={`p-3 cursor-pointer transition-colors ${
                    isActive ? 'bg-white border-l-4 border-l-[#7051C8] shadow-sm' : 'hover:bg-gray-100/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#382044] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {isDirect ? displayName.charAt(0) : <Hash className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#24232B] truncate">{displayName}</span>
                        {isDirect && (
                          <span className="text-[9px] bg-gray-200/70 text-gray-700 px-1 py-0.5 rounded ml-1">
                            Direct
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#737784] truncate mt-0.5">
                        {conv.lastMessage?.text || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Messaging Area */}
      <div className={`${activeConv ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white min-w-0`}>
        {activeConv ? (
          <>
            {/* Chat header */}
            <div className="h-14 border-b border-[#E6E8ED] px-4 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center space-x-2 min-w-0">
                <button
                  onClick={() => setActiveConv(null)}
                  className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 shrink-0"
                  title="Back to all chats"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#24232B] flex items-center space-x-1.5 truncate">
                    <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">
                      {activeConv.type === 'GROUP'
                        ? activeConv.name
                        : activeConv.participants?.find((p: any) => p._id !== user._id)?.fullName || 'Private Chat'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#737784] truncate">
                    {activeConv.type === 'GROUP'
                      ? `Private Department Group • ${activeConv.participants?.length || 0} participants`
                      : `Direct confidential chat with ${activeConv.participants?.find((p: any) => p._id !== user._id)?.fullName || 'colleague'}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7F8FA]">
              {messages.length === 0 && (
                <div className="text-center py-12 text-xs text-[#737784]">
                  🔒 End-to-end access restricted: Only participants in this conversation can view these messages.
                </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.senderId?._id === user._id;
                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    {!isMe && (
                      <span className="text-[10px] text-gray-500 font-semibold mb-0.5 ml-1">
                        {msg.senderId?.fullName}
                      </span>
                    )}
                    <div
                      className={`max-w-md p-3 rounded-xl text-xs shadow-sm leading-relaxed ${
                        isMe
                          ? 'bg-[#7051C8] text-white rounded-br-none'
                          : 'bg-white text-[#24232B] border border-[#E6E8ED] rounded-bl-none'
                      }`}
                    >
                      {/* Attached Documents */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mb-2 space-y-1">
                          {msg.attachments.map((file: any, idx: number) => (
                            <a
                              key={idx}
                              href={getFileUrl(file.fileUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className={`flex items-center space-x-2 p-2 rounded border text-xs font-medium transition-colors ${
                                isMe
                                  ? 'bg-purple-800/50 border-purple-400 text-white hover:bg-purple-800'
                                  : 'bg-gray-50 border-gray-200 text-[#7051C8] hover:bg-gray-100'
                              }`}
                            >
                              <FileText className="w-4 h-4 shrink-0" />
                              <span className="truncate flex-1">{file.fileName}</span>
                              <Download className="w-3.5 h-3.5 shrink-0 opacity-80" />
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Text content */}
                      {msg.content && <p className="whitespace-pre-line">{msg.content}</p>}

                      <span
                        className={`text-[9px] block mt-1 text-right ${
                          isMe ? 'text-white/70' : 'text-gray-400'
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
              {typingUser && (
                <div className="text-[11px] italic text-[#7051C8]">
                  {typingUser} is typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer with Document Attachment */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-[#E6E8ED] bg-white flex flex-col space-y-2">
              {/* Selected File Chip */}
              {selectedFile && (
                <div className="flex items-center justify-between bg-purple-50 p-2 rounded-lg border border-purple-200 text-xs text-[#7051C8]">
                  <div className="flex items-center space-x-2 truncate">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span className="truncate font-semibold">{selectedFile.name}</span>
                    <span className="text-[10px] text-gray-500">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-gray-400 hover:text-red-500 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center space-x-2">
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {/* Attach File Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-lg border border-gray-300 text-gray-600 hover:text-[#7051C8] hover:bg-purple-50 transition-colors"
                  title="Attach academic document or image"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Text Input */}
                <input
                  type="text"
                  placeholder="Type message or attach document..."
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    if (socket && activeConv) {
                      socket.emit('typing_start', { conversationId: activeConv._id, user });
                    }
                  }}
                  className="flex-1 text-xs p-2.5 border border-[#E6E8ED] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7051C8]"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={uploading}
                  className="p-2.5 bg-[#7051C8] hover:bg-[#50305F] text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="m-auto text-center text-xs text-[#737784]">
            Select a conversation on the left, or click <strong>+</strong> to start a direct message with a colleague.
          </div>
        )}
      </div>

      {/* Start Direct Private Chat Modal */}
      {showNewDirectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-[#E6E8ED] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#24232B] flex items-center space-x-1.5">
                <UserPlus className="w-4 h-4 text-[#7051C8]" />
                <span>Start Confidential Direct Message</span>
              </h3>
              <button
                onClick={() => setShowNewDirectModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#737784] my-3">
              Select any faculty member, coordinator, or HOD to initiate a 1-on-1 private chat. Only you and the chosen recipient will have access.
            </p>

            <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-lg">
              {facultyList.map((f) => (
                <div
                  key={f._id}
                  onClick={() => handleStartDirectChat(f._id)}
                  className="p-2.5 hover:bg-purple-50 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <h4 className="text-xs font-bold text-[#24232B]">{f.fullName}</h4>
                    <span className="text-[10px] text-[#737784] block">
                      {f.designation} • {f.role}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#7051C8] bg-purple-100/60 px-2 py-0.5 rounded">
                    Message
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
