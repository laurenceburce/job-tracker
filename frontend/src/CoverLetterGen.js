import { useState } from "react";

function CoverLetterGen() {
  const [resume, setResume] = useState(null);
  const [jobDesc, setJobDesc] = useState(null);
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobText, setJobText] = useState("");
  const [existingLetter, setExistingLetter] = useState("");
  const [letterFile, setLetterFile] = useState(null);
  const [useJobText, setUseJobText] = useState(false);
  const [useLetterText, setUseLetterText] = useState(false);
  const [liveBotMessage, setLiveBotMessage] = useState("");


  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!resume || (!jobDesc && !jobText)) {
      alert("Please provide a resume and job description.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("existing_letter", existingLetter);
    if (letterFile) {
      formData.append("existing_letter_file", letterFile);
    }

    if (jobDesc) {
      formData.append("job_desc", jobDesc);
    } else {
      const textFile = new File([jobText], "job_desc.txt", { type: "text/plain" });
      formData.append("job_desc", textFile);
    }

    setLoading(true);
    const res = await fetch("http://127.0.0.1:8000/generate-cover-letter/", {
      method: "POST",
      body: formData,
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;
    let text = "";

    setLiveBotMessage(""); // Reset previous text

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunk = decoder.decode(value);
      text += chunk;
      setLiveBotMessage((prev) => prev + chunk);
    }

    setLetter(text || "No cover letter generated.");
    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-3 text-primary">Cover Letter Generator</h2>

      <form onSubmit={handleGenerate}>
        <div className="mb-3">
          <label className="form-label">Upload Resume (.pdf, .docx, or .txt)</label>
          <input type="file" className="form-control" accept=".txt,.pdf,.docx" onChange={(e) => setResume(e.target.files[0])} />
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

        <div className="mb-3">
          <label className="form-label">
            (Optional) Cover Letter (Upload <code>.pdf</code>, <code>.docx</code>, or <code>.txt</code> or paste below)
          </label>
          <br />
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary mb-2"
            onClick={() => setUseLetterText(!useLetterText)}
          >
            {useLetterText ? "Upload File Instead" : "Paste Text Instead"}
          </button>

          {useLetterText ? (
            <textarea
              className="form-control"
              rows="6"
              placeholder="Paste existing cover letter"
              value={existingLetter}
              onChange={(e) => setExistingLetter(e.target.value)}
            ></textarea>
          ) : (
            <input
              type="file"
              className="form-control"
              accept=".txt,.pdf,.docx"
              onChange={(e) => setLetterFile(e.target.files[0])}
            />
          )}
        </div>


        <button type="submit" className="btn btn-info" disabled={loading}>
          {loading ? "Generating..." : "Generate Cover Letter"}
        </button>
      </form>

      {loading && (
        <div className="mt-4">
          <h5 className="text-secondary">AI is generating your cover letter...</h5>
          <pre className="p-3 border rounded bg-light" style={{ whiteSpace: "pre-wrap" }}>
            {liveBotMessage || "Thinking..."}
          </pre>
        </div>
      )}

      {!loading && letter && (
        <div className="mt-4">
          <h5 className="text-secondary">Generated Cover Letter:</h5>
          <pre className="p-3 border rounded bg-light" style={{ whiteSpace: "pre-wrap" }}>
            {(() => {
              try {
                const parsed = JSON.parse(letter);
                return parsed.cover_letter;
              } catch {
                return letter;
              }
            })()}

          </pre>
        </div>
      )}
    </div>
  );
}

export default CoverLetterGen;
