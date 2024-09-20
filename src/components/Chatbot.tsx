import React from "react";
import { Input, Button, Spin } from "antd";
import axios from "axios";
import "./Chatbot.css";

interface Message {
  text: string;
  sender: "user" | "bot";
  timestamp: string;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const chatWindowRef = React.useRef<HTMLDivElement>(null);

  const getCurrentTimestamp = (): string => {
    const date = new Date();
    return date.toLocaleTimeString();
  };

  const handleSend = async () => {
    if (inputValue.trim() !== "") {
      const userMessage: Message = { text: inputValue, sender: "user", timestamp: getCurrentTimestamp() };
      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsLoading(true);

      try {
        const response = await axios.post("http://localhost:5000/api/chat", { message: inputValue });
        const botMessage: Message = { text: response.data.reply, sender: "bot", timestamp: getCurrentTimestamp() };
        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        console.error("Error sending message:", error);
        const botMessage: Message = { text: "Sorry, something went wrong.", sender: "bot", timestamp: getCurrentTimestamp() };
        setMessages((prev) => [...prev, botMessage]);
      }

      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  // Auto-scroll to the bottom when a new message is added
  React.useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chatbot-container full-height-chat">
      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.sender === "user" ? "user-message" : "bot-message"}`}
          >
            <p>{msg.text}</p>
          </div>
        ))}
        {isLoading && <Spin tip="Bot is typing..." />}
      </div>
      <div className="chat-input">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleSend}
          placeholder="Type a message..."
        />
        <Button onClick={handleSend} type="primary">
          Send
        </Button>
        <Button onClick={handleClear} type="default" style={{ marginRight: "3%" }}>
          Clear
        </Button>
      </div>
    </div>
  );
};

export default Chatbot;
