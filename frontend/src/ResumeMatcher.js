import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";


function ResumeMatcher() {
  const [resume, setResume] = useState(null);
  const [jobDesc, setJobDesc] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobText, setJobText] = useState("");
  const [editableResume, setEditableResume] = useState("");
  const [suggestions, setSuggestions] = useState([]);


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

    const data = await res.json();
    setResult(data.result || "No response from GPT.");
    const bulletSuggestions = data.result
      .split("\n")
      .filter(line => line.startsWith("- ") || line.startsWith("– "))
      .map((text, index) => ({
        id: index,
        text,
        applied: false,
      }));

    setSuggestions(bulletSuggestions);
    setEditableResume("Paste your resume here...");
    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-3 text-primary">Resume vs Job Description Matcher</h2>

      <form onSubmit={handleUpload}>
        <div className="mb-3">
          <label className="form-label">Upload Resume (.pdf, .docx, or .txt)</label>
          <input type="file" className="form-control" accept=".txt,.pdf,.docx" onChange={(e) => setResume(e.target.files[0])} />
        </div>

        <div className="mb-3">
          <label className="form-label">
            Job Description (Upload <code>.pdf</code>, <code>.docx</code>, or <code>.txt</code> or paste below)
          </label>
          <input
            type="file"
            className="form-control mb-2"
            accept=".txt,.pdf,.docx"
            onChange={(e) => setJobDesc(e.target.files[0])}
          />
          <textarea
            className="form-control"
            rows="6"
            placeholder="Or paste the job description here"
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
          ></textarea>
        </div>

        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? "Matching..." : "Match Resume to Job"}
        </button>

        <button className="btn btn-secondary mt-3" onClick={() => navigator.clipboard.writeText(editableResume)}>
          Copy Resume Text
        </button>

      </form>

      {result && (
        <div className="mt-4">
          <h5 className="text-secondary">Match Result:</h5>
          <pre className="p-3 border rounded bg-light" style={{ whiteSpace: "pre-wrap" }}>{result}</pre>
        </div>
      )}
      
      {suggestions.length > 0 && (
        <div className="mt-4">
          <h5>Suggestions:</h5>
          {suggestions.map((s, i) => (
            <div key={i} className="d-flex align-items-start gap-2 my-2">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setEditableResume(prev => prev + "\n" + s.text)}
                disabled={s.applied}
              >
                Apply
              </button>
              <span>{s.text}</span>
            </div>
          ))}
        </div>
      )}

      {editableResume && (
        <div className="mt-4">
          <h5>Edit Resume:</h5>
          <ReactQuill theme="snow" value={editableResume} onChange={setEditableResume} />
        </div>
      )}

    </div>
  );
}

export default ResumeMatcher;
