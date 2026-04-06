import React, { useState, useEffect, useRef } from "react";

function Home() {
  const [messages, setMessages] = useState([
    { text: "Hey 👋 I'm your AI assistant", sender: "bot" },
  ]);

  const [input, setInput] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ ADDED: history state
  const [history, setHistory] = useState(() => {
    return JSON.parse(localStorage.getItem("chatHistory")) || [];
  });

  const chatEndRef = useRef(null);

  // ✅ ADDED: save history
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(history));
  }, [history]);

  // existing scroll (UNCHANGED)
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;

    const newMessages = [
      ...messages,
      { text: userMessage, sender: "user" },
    ];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // ✅ ADDED: save immediately
    setHistory((prev) => [
      {
        id: Date.now(),
        title: userMessage.slice(0, 25),
        chat: newMessages,
      },
      ...prev,
    ]);

    try {
      const res = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      let cleanText = data.reply || "No response";
      cleanText = cleanText.replace(/[*#]/g, "");
      cleanText = cleanText.replace(/\n\s*\n/g, "\n");

      const updatedMessages = [
        ...newMessages,
        { text: cleanText.trim(), sender: "bot" },
      ];

      setMessages(updatedMessages);

      // ✅ ADDED: update history with bot reply
      setHistory((prev) => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[0].chat = updatedMessages;
        }
        return updated;
      });

    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: "Error connecting to server ❌", sender: "bot" },
      ]);
    }

    setLoading(false);
  };

  // ✅ ADDED: load chat
  const loadChat = (chat) => {
    setMessages(chat);
  };

  // ✅ ADDED: clear history
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("chatHistory");
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-200 overflow-hidden">

      {/* 🔹 Background (UNCHANGED) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="w-72 h-72 bg-purple-500 opacity-20 blur-3xl rounded-full absolute top-10 left-10 animate-pulse"></div>
        <div className="w-72 h-72 bg-blue-500 opacity-20 blur-3xl rounded-full absolute bottom-10 right-10 animate-pulse"></div>
      </div>

      {/* 🔹 Sidebar (ADDED ONLY) */}
      <div className="w-64 bg-gray-900/80 backdrop-blur-lg border-r border-gray-700 p-4 hidden md:flex flex-col z-10">
        <h2 className="text-xl font-bold mb-4">🕘 History</h2>

        <div className="flex-1 overflow-y-auto space-y-2">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => loadChat(item.chat)}
              className="p-2 bg-gray-800 rounded cursor-pointer hover:bg-gray-700 text-sm truncate"
            >
              {item.title}...
            </div>
          ))}
        </div>

        <button
          onClick={clearHistory}
          className="mt-2 bg-red-600 p-2 rounded hover:bg-red-700"
        >
          🗑 Clear History
        </button>
      </div>

      {/* 🔹 Main (UNCHANGED) */}
      <div className="flex flex-col flex-1 z-10">

        {/* 🔹 Navbar (UNCHANGED) */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700 bg-gray-900/80 backdrop-blur-lg">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center animate-bounce">
              🤖
            </div>
            <h1 className="text-lg font-semibold">AI Assistant</h1>
          </div>

          <button
            onClick={() => setShowAuth(true)}
            className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700 transition"
          >
            Login
          </button>
        </div>

        {/* 🔹 Chat Area (UNCHANGED) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {messages.length === 1 && (
            <div className="text-center mt-20 opacity-70">
              <h2 className="text-2xl font-bold mb-2">
                Welcome 👋
              </h2>
              <p>Ask anything to start chatting with AI</p>
            </div>
          )}

          {messages.map((msg, index) => {
            const isCode =
              msg.text.includes("#include") ||
              msg.text.includes("def ") ||
              msg.text.includes("function") ||
              (msg.text.includes("{") && msg.text.includes("}"));

            return (
              <div
                key={index}
                className={`max-w-xl p-4 rounded-2xl shadow-md ${
                  msg.sender === "user"
                    ? "bg-blue-600 ml-auto"
                    : "bg-gray-800"
                }`}
              >
                {isCode ? (
                  <div className="bg-black text-green-400 p-3 rounded overflow-x-auto">
                    <pre>
                      <code>{msg.text}</code>
                    </pre>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="bg-gray-800 p-3 rounded-xl w-fit animate-pulse">
              🤖 Typing...
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        {/* 🔹 Input (UNCHANGED) */}
        <div className="p-4 border-t border-gray-700 flex items-center gap-3 bg-gray-900/80">

          <input
            type="text"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 bg-gray-800 px-4 py-2 rounded-full outline-none"
          />

          <button
            onClick={sendMessage}
            className="bg-blue-600 px-5 py-2 rounded-full hover:bg-blue-700"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
