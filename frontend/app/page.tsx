'use client';

import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [mode, setMode] = useState<"rewrite" | "generate">("rewrite");
  const [style, setStyle] = useState("results-driven");
  const [role, setRole] = useState("");
  const [responsibility, setResponsibility] = useState("");
  const [tech, setTech] = useState("");

  const handleSubmit = async () => {
    if (mode === "rewrite") {
      const res = await axios.post("http://localhost:8000/rewrite", {
        bullet: input,
        style,
      });
      setResponse(res.data.rewritten);
    } else {
      const res = await axios.post("http://localhost:8000/generate", {
        role,
        responsibility,
        tech,
      });
      setResponse(res.data.generated);
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-4">ChatGPT Resume Assistant</h1>
      <div className="mb-4">
        <button
          onClick={() => setMode("rewrite")}
          className={`px-3 py-1 mr-2 rounded ${mode === "rewrite" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Rewrite
        </button>
        <button
          onClick={() => setMode("generate")}
          className={`px-3 py-1 rounded ${mode === "generate" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Generate
        </button>
      </div>

      {mode === "rewrite" ? (
        <div>
          <textarea
            className="w-full border p-2 mb-2"
            rows={3}
            placeholder="Enter your resume bullet point"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <input
            type="text"
            className="w-full border p-2 mb-2"
            placeholder="Style (e.g. results-driven, technical, etc.)"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          />
        </div>
      ) : (
        <div>
          <input
            type="text"
            className="w-full border p-2 mb-2"
            placeholder="Role (e.g. Backend Intern)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <input
            type="text"
            className="w-full border p-2 mb-2"
            placeholder="Responsibility (e.g. built REST APIs...)"
            value={responsibility}
            onChange={(e) => setResponsibility(e.target.value)}
          />
          <input
            type="text"
            className="w-full border p-2 mb-2"
            placeholder="Technologies (optional)"
            value={tech}
            onChange={(e) => setTech(e.target.value)}
          />
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-4 py-2 rounded mt-2"
      >
        Submit
      </button>

      {response && (
        <div className="mt-4 p-4 border rounded bg-black-50">
          <h2 className="font-semibold mb-2">AI Response:</h2>
          <p>{response}</p>
        </div>
      )}
    </main>
  );
}
