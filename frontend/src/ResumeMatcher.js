import { useState } from "react";
import ResumeEditor from "./ResumeEditor";

function ResumeMatcher() {
  const [resume, setResume] = useState(null);
  const [jobDesc, setJobDesc] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobText, setJobText] = useState("");
  const [parsedResumeText, setParsedResumeText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [useJobText, setUseJobText] = useState(false);
  const [liveBotMessage, setLiveBotMessage] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!resume || (!jobDesc && !jobText)) {
      alert("Please provide a resume and job description.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);

    if (jobDesc) {
      formData.append("job_desc", jobDesc);
    } else {
      const textFile = new File([jobText], "job_desc.txt", { type: "text/plain" });
      formData.append("job_desc", textFile);
    }

    setLoading(true);
    const res = await fetch("http://127.0.0.1:8000/match/", {
      method: "POST",
      body: formData,
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;
    let text = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunk = decoder.decode(value);
      text += chunk;
      setLiveBotMessage((prev) => prev + chunk);
    }
    const finalData = JSON.parse(text);
    console.log("MATCH API RESPONSE:", finalData);

    if (!finalData || (!finalData.suggestions && !finalData.resume_text)) {
      alert("Something went wrong. GPT response missing.");
      return;
    }

    if (finalData.result) {
      setResult(finalData.result);
    }
    setParsedResumeText(finalData.resume_text || "");
    setSuggestions(finalData.suggestions || []);
    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-3 text-primary">Resume vs Job Description Matcher + Editor</h2>

      <form onSubmit={handleUpload}>
        <div className="mb-3">
          <label className="form-label">Upload Resume (.pdf, .docx, or .txt)</label>
          <input
            type="file"
            className="form-control"
            accept=".txt,.pdf,.docx"
            onChange={(e) => setResume(e.target.files[0])}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">
            Job Description (Upload <code>.pdf</code>, <code>.docx</code>, or <code>.txt</code> or paste below)
          </label>
          <br />
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary mb-2"
            onClick={() => setUseJobText(!useJobText)}
          >
            {useJobText ? "Upload File Instead" : "Paste Text Instead"}
          </button>

          {useJobText ? (
            <textarea
              className="form-control"
              rows="6"
              placeholder="Paste job description here"
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
            ></textarea>
          ) : (
            <input
              type="file"
              className="form-control"
              accept=".txt,.pdf,.docx"
              onChange={(e) => setJobDesc(e.target.files[0])}
            />
          )}
        </div>

        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? "Matching..." : "Match Resume to Job"}
        </button>
      </form>

      {loading && (
        <div className="mt-4">
          <h5 className="text-secondary">AI is thinking...</h5>
          <div className="p-3 border rounded bg-light">
            <span className="typing-dot">🤖 {liveBotMessage || "Generating..."}</span>
          </div>
        </div>
      )}

      {!loading && result && (
        <div className="mt-4">
          <h5 className="text-secondary">Match Result:</h5>
          <pre className="p-3 border rounded bg-light" style={{ whiteSpace: "pre-wrap" }}>
            {result}
          </pre>
        </div>
      )}

      {parsedResumeText && (
        <div className="mt-5">
          <ResumeEditor originalText={parsedResumeText} suggestions={suggestions} />
        </div>
      )}
    </div>
  );
}

export default ResumeMatcher;