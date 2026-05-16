import { useState } from "react";

function App() {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const studyTopic = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `http://127.0.0.1:8000/study?topic=${topic}`
      );

      const data = await response.json();

      setMessage(data);

      if (topic.trim() !== "") {
        setHistory((prev) => [...prev, topic]);
      }

    } catch (error) {
      setMessage("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Smart Study AI</h1>

      <input
        type="text"
        placeholder="Enter topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      <br /><br />

      <button onClick={studyTopic}>
          {loading ? "Loading..." : "Study"}
      </button>

      <button
        onClick={() => {
          setTopic("");
          setMessage("");
          setHistory([]);
        }}
      >
        Clear
      </button>

      {message.topic && (
  <div>
    <h2>{message.topic}</h2>
    <p>Difficulty: {message.difficulty}</p>

    <div>
  {message.tasks.map((task, index) => (
    <p key={index}>{task}</p>
  ))}
</div>
  </div>
)}

      <h3>Recent Topics</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {history.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;