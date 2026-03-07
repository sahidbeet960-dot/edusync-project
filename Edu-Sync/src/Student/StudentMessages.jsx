import React, { useState } from "react";
import { Search, Send } from "lucide-react";

const StudentMessages = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeContactId, setActiveContactId] = useState(1);

  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: "Sarah J.",
      role: "CR",
      status: "Online",
      messages: [
        {
          id: 1,
          text: "Hey, do you know what the syllabus is for the OS test?",
          sender: "student",
          time: "10:00 AM",
        },
      ],
    },
    {
      id: 2,
      name: "Dr. Smith",
      role: "Professor",
      status: "Offline",
      messages: [
        {
          id: 1,
          text: "Your project abstract for JU-Sync looks good. Proceed with the frontend.",
          sender: "professor",
          time: "Yesterday",
        },
      ],
    },
  ]);

  const [currentMessage, setCurrentMessage] = useState("");
  const activeContact = contacts.find((c) => c.id === activeContactId);

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: currentMessage,
      sender: "student",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setContacts(
      contacts.map((c) =>
        c.id === activeContactId
          ? { ...c, messages: [...c.messages, newMessage] }
          : c,
      ),
    );
    setCurrentMessage("");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex h-[70vh] overflow-hidden">
      <div className="w-1/3 border-r border-slate-200 flex flex-col hidden sm:flex">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setActiveContactId(contact.id)}
              className={`p-4 border-b border-slate-100 flex items-center cursor-pointer transition-colors ${activeContactId === contact.id ? "bg-indigo-50 border-l-4 border-l-indigo-600" : "hover:bg-slate-50 border-l-4 border-l-transparent"}`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold mr-3">
                {contact.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  {contact.name}
                </h4>
                <p className="text-[10px] text-slate-500 uppercase">
                  {contact.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-50">
        <div className="p-4 bg-white border-b border-slate-200 shadow-sm z-10">
          <h3 className="font-bold text-slate-800">{activeContact.name}</h3>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {activeContact.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "student" ? "items-end" : "items-start"}`}
            >
              <div
                className={`p-3 max-w-[75%] text-sm shadow-sm ${msg.sender === "student" ? "bg-indigo-600 text-white rounded-lg rounded-tr-none" : "bg-white text-slate-700 border border-slate-100 rounded-lg rounded-tl-none"}`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 mx-1">
                {msg.time}
              </span>
            </div>
          ))}
        </div>
        <form
          onSubmit={handleSendMessage}
          className="p-4 bg-white border-t border-slate-200 flex items-center"
        >
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 mr-3 text-sm"
          />
          <button
            type="submit"
            disabled={!currentMessage.trim()}
            className={`p-3 rounded-lg transition-colors ${currentMessage.trim() ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentMessages;
