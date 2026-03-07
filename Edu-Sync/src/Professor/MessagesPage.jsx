import React, { useState } from "react";
import { Search, Send, User } from "lucide-react";

const MessagesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeContactId, setActiveContactId] = useState(1);

  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: "Toufik Mamud",
      role: "CR",
      status: "Online",
      messages: [
        {
          id: 1,
          text: "Good morning Sir! Will tomorrow's lab be held in Lab 2 or Lab 3?",
          sender: "student",
          time: "10:00 AM",
        },
        {
          id: 2,
          text: "Good morning. It will be in Lab 3. Please inform the class.",
          sender: "professor",
          time: "10:05 AM",
        },
      ],
    },
    {
      id: 2,
      name: "Sahid AL",
      role: "Student",
      status: "Offline",
      messages: [
        {
          id: 1,
          text: "Thank you for the notes, Sir! They were very helpful.",
          sender: "student",
          time: "Yesterday",
        },
      ],
    },
    {
      id: 3,
      name: "Salman",
      role: "Student",
      status: "Online",
      messages: [
        {
          id: 1,
          text: "Sir, can we discuss the assignment after class today?",
          sender: "student",
          time: "09:15 AM",
        },
        {
          id: 2,
          text: "Yes, come to my cabin at 2 PM.",
          sender: "professor",
          time: "09:30 AM",
        },
      ],
    },
    {
      id: 4,
      name: "Tushar",
      role: "Student",
      status: "Offline",
      messages: [
        {
          id: 1,
          text: "I have submitted my file on the dashboard.",
          sender: "student",
          time: "Monday",
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
    if (currentMessage.trim() === "") return;

    const newMessage = {
      id: Date.now(),
      text: currentMessage,
      sender: "professor",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setContacts(
      contacts.map((contact) => {
        if (contact.id === activeContactId) {
          return { ...contact, messages: [...contact.messages, newMessage] };
        }
        return contact;
      }),
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
              placeholder="Search students..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setActiveContactId(contact.id)}
                className={`p-4 border-b border-slate-100 flex items-center cursor-pointer transition-colors ${
                  activeContactId === contact.id
                    ? "bg-blue-50/80 border-l-4 border-l-blue-600"
                    : "hover:bg-slate-50 border-l-4 border-l-transparent"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3 transition-colors ${
                    contact.status === "Online"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {contact.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 truncate">
                    {contact.name} ({contact.role})
                  </h4>
                  <p className="text-xs text-slate-500 truncate">
                    {contact.messages[contact.messages.length - 1]?.text ||
                      "No messages yet"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-slate-500">
              No students found.
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-50">
        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3 sm:hidden ${activeContact.status === "Online" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}
            >
              {activeContact.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-800">
                {activeContact.name}{" "}
                <span className="text-xs text-slate-500 font-normal ml-1">
                  ({activeContact.role})
                </span>
              </h3>
              <p
                className={`text-xs font-medium ${activeContact.status === "Online" ? "text-green-600" : "text-slate-400"}`}
              >
                {activeContact.status}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col">
          {activeContact.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "professor" ? "items-end" : "items-start"}`}
            >
              <div
                className={`p-3 max-w-[75%] text-sm shadow-sm ${msg.sender === "professor" ? "bg-blue-600 text-white rounded-lg rounded-tr-none" : "bg-white text-slate-700 border border-slate-100 rounded-lg rounded-tl-none"}`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 mx-1">
                {msg.time}
              </span>
            </div>
          ))}
          {activeContact.messages.length === 0 && (
            <div className="m-auto text-sm text-slate-400">
              Send a message to start the conversation.
            </div>
          )}
        </div>

        <form
          onSubmit={handleSendMessage}
          className="p-4 bg-white border-t border-slate-200 flex items-center"
        >
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder={`Message ${activeContact.name.split(" ")[0]}...`}
            className="flex-1 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 mr-3 text-sm"
          />
          <button
            type="submit"
            disabled={!currentMessage.trim()}
            className={`p-3 rounded-lg transition-colors ${currentMessage.trim() ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessagesPage;
