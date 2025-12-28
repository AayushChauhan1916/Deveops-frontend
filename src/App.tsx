import { useState } from "react";
import "./App.css";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("joke");

  const fetchFun = async () => {
    setLoading(true);
    setResult("");

    const res = await fetch(`/api/fun?type=${type}`);
    const data = await res.json();

    setTimeout(() => {
      setResult(data.data);
      setLoading(false);
    }, 400); // small dramatic delay 😄
  };

  return (
    <div className="app">
      <div className="card">
        <h1>✨ Fun Lab</h1>
        <p className="subtitle">Click a mood. Get something fun.</p>

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="joke">😂 Joke</option>
          <option value="advice">🧠 Advice</option>
        </select>

        <button onClick={fetchFun}>Generate</button>

        <div className="output">
          {loading && <div className="loader"></div>}
          {!loading && result && <p>{result}</p>}
        </div>
      </div>
    </div>
  );
}

export default App;
