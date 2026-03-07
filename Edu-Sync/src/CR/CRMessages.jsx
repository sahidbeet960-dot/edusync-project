import React, { useState } from "react";
import { Search, Send, User } from "lucide-react";

const CRMessages = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeContactId, setActiveContactId] = useState(1);

  const [contacts] = useState([
    {
      id: 1,
      name: "Dr. Smith",
      role: "Professor",
      messages: [
        {
          id: 1,
          text: "Can you inform the class about the schedule change?",
          sender: "professor",
          time: "10:00 AM",
        },
      ],
    },
    {
      id: 2,
      name: "Rousan Jamil",
      role: "Student",
      messages: [
        {
          id: 1,
          text: "Did you talk to the professor about the assignment?",
          sender: "student",
          time: "Yesterday",
        },
      ],
    },
  ]);

  const [currentMessage, setCurrentMessage] = useState("");
  const activeContact = contacts.find((c) => c.id === activeContactId);

  // --- ACTIVE SEARCH LOGIC ---
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex h-[70vh] overflow-hidden">
      <div className="w-1/3 border-r border-slate-200 flex flex-col">
        {/* --- ACTIVE SEARCH BAR --- */}
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setActiveContactId(contact.id)}
              className={`p-4 border-b border-slate-100 flex items-center cursor-pointer transition-colors ${activeContactId === contact.id ? "bg-teal-50/80 border-l-4 border-l-teal-600" : "hover:bg-slate-50 border-l-4 border-l-transparent"}`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold mr-3">
                {contact.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 truncate">
                  {contact.name} ({contact.role})
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-50">
        <div className="p-4 bg-white border-b border-slate-200">
          <h3 className="font-bold text-slate-800">{activeContact.name}</h3>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {activeContact.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "cr" ? "items-end" : "items-start"}`}
            >
              <div
                className={`p-3 max-w-[75%] text-sm shadow-sm ${msg.sender === "cr" ? "bg-teal-600 text-white rounded-lg rounded-tr-none" : "bg-white text-slate-700 border border-slate-100 rounded-lg rounded-tl-none"}`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-white border-t border-slate-200 flex items-center">
          <input
            type="text"
            placeholder="Message..."
            className="flex-1 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 mr-3 text-sm"
          />
          <button className="p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CRMessages;
