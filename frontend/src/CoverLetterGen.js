import { useState } from "react";

function CoverLetterGen() {
  const [resume, setResume] = useState(null);
  const [jobDesc, setJobDesc] = useState(null);
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobText, setJobText] = useState("");
  const [existingLetter, setExistingLetter] = useState("");
  const [letterFile, setLetterFile] = useState(null);

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

    const data = await res.json();
    setLetter(data.cover_letter || "No cover letter generated.");
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

        <div className="mb-3">
          <label className="form-label">
            (Optional) Cover Letter (Upload <code>.pdf</code>, <code>.docx</code>, or <code>.txt</code> or paste below)
          </label>
          <input
            type="file"
            className="form-control mb-2"
            accept=".txt,.pdf,.docx"
            onChange={(e) => setLetterFile(e.target.files[0])}
          />
          <textarea
            className="form-control"
            rows="6"
            placeholder="Or paste your existing cover letter here"
            value={existingLetter}
            onChange={(e) => setExistingLetter(e.target.value)}
          ></textarea>
        </div>


        <button type="submit" className="btn btn-info" disabled={loading}>
          {loading ? "Generating..." : "Generate Cover Letter"}
        </button>
      </form>

      {letter && (
        <div className="mt-4">
          <h5 className="text-secondary">Generated Cover Letter:</h5>
          <pre className="p-3 border rounded bg-light" style={{ whiteSpace: "pre-wrap" }}>{letter}</pre>
        </div>
      )}
    </div>
  );
}

export default CoverLetterGen;
