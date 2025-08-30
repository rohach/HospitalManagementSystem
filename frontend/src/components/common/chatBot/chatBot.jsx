import React, { useState } from "react";
import { fetchData } from "../../../utils/api";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetchData("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.content },
      ]);
    } catch (error) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Error contacting AI." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: 10,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div style={{ flex: 1, overflowY: "auto", marginBottom: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ margin: "5px 0" }}>
            <b>{m.role === "user" ? "You" : "AI"}:</b> {m.content}
          </div>
        ))}
        {loading && <div>AI is typing...</div>}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Type a message..."
        style={{ padding: 10 }}
      />
      <button onClick={sendMessage} style={{ marginTop: 5 }}>
        Send
      </button>
    </div>
  );
};

export default Chatbot;
