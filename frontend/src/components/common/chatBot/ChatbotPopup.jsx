import React, { useState, useEffect, useRef } from "react";
import { sendChatMessage } from "../../../utils/api";
import "./ChatbotPopup.css";

const ChatbotPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [userRole, setUserRole] = useState("patient");
  const [userId, setUserId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserId(parsedUser._id || parsedUser.id || null);

      if (parsedUser.role === "admin") setUserRole("admin");
      else if (parsedUser.role === "doctor") setUserRole("doctor");
      else setUserRole("patient");
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessageObj = { role: "user", content: inputValue };
    const updatedMessages = [...messages, userMessageObj];

    setMessages(updatedMessages); // show user message
    setInputValue("");

    try {
      const response = await sendChatMessage({
        messages: updatedMessages,
        userRole,
        userId,
        userMessage: inputValue,
      });

      // Backend now returns object with content field
      if (response?.content) {
        const botMessage = { role: "assistant", content: response.content };
        setMessages((prev) => [...prev, botMessage]);
      } else if (response?.reply) {
        // fallback if older version returns reply
        const botMessage = { role: "assistant", content: response.reply };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong." },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  return (
    <div className={`chatbot-container ${isOpen ? "open" : ""}`}>
      <div className="chatbot-header" onClick={() => setIsOpen(!isOpen)}>
        Chatbot
      </div>

      {isOpen && (
        <div className="chatbot-body">
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.role}`}>
                {msg.content}
              </div>
            ))}
            <div ref={messagesEndRef}></div>
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              value={inputValue}
              placeholder="Type a message..."
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotPopup;
