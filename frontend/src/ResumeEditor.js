import { useState } from "react";

function ResumeEditor({ originalText, suggestions }) {
    const [resumeText, setResumeText] = useState(originalText);
    const [appliedChanges, setAppliedChanges] = useState(new Set());
    const [visibleSuggestions, setVisibleSuggestions] = useState(suggestions);

function getSimilarityScore(a, b) {
    const normalize = (str) =>
        str.toLowerCase().replace(/[^\w\s]/gi, "").split(/\s+/);
    const aWords = new Set(normalize(a));
    const bWords = new Set(normalize(b));

    const intersection = [...aWords].filter((word) => bWords.has(word));
    const union = new Set([...aWords, ...bWords]);

    return intersection.length / union.size;
}

    const applySuggestion = (oldText, newText, index) => {
        const key = `${oldText}→${newText}`;
        // If exact match found, replace it directly
        if (resumeText.includes(oldText)) {
            const updated = resumeText.replace(oldText, `<mark>${newText}</mark>`);
            setResumeText(updated);
        } else {
            // Fuzzy match fallback: look for partial line matches
            const lines = resumeText.split("\n");
            let bestMatchIndex = -1;
            let highestScore = 0;

            lines.forEach((line, idx) => {
            const score = getSimilarityScore(line, oldText);
            if (score > highestScore && score > 0.5) {
                highestScore = score;
                bestMatchIndex = idx;
            }
            });

            if (bestMatchIndex !== -1) {
            const updatedLines = [...lines];
            updatedLines.splice(bestMatchIndex + 1, 0, `<mark>${newText}</mark>`);
            setResumeText(updatedLines.join("\n"));
            } else {
            alert(`⚠️ Could not match or insert:\n\n${oldText}`);
            return;
            }
        }
        setAppliedChanges((prev) => new Set(prev).add(key));
    };

    const dismissSuggestion = (index) => {
        const updated = [...visibleSuggestions];
        updated.splice(index, 1);
        setVisibleSuggestions(updated);
    };

    const applyAll = () => {
        let updated = resumeText;
        const newApplied = new Set(appliedChanges);

        visibleSuggestions.forEach(({ old, new: newText }) => {
            const key = `${old}→${newText}`;
            if (updated.includes(old)) {
            updated = updated.replace(old, `<mark>${newText}</mark>`);
            newApplied.add(key);
            } else {
            // Fuzzy insert fallback
            const lines = updated.split("\n");
            let bestMatchIndex = -1;
            let highestScore = 0;

            lines.forEach((line, idx) => {
                const score = getSimilarityScore(line, old);
                if (score > highestScore && score > 0.5) {
                highestScore = score;
                bestMatchIndex = idx;
                }
            });

            if (bestMatchIndex !== -1) {
                const updatedLines = [...lines];
                updatedLines.splice(bestMatchIndex + 1, 0, `<mark>${newText}</mark>`);
                updated = updatedLines.join("\n");
                newApplied.add(key);
            }
            }
        });

        setResumeText(updated);
        setAppliedChanges(newApplied);
    };

    return (
        <div className="container mt-4">
        <h2 className="mb-3 text-primary">Resume Editor with AI Suggestions</h2>

        <div className="mb-3">
            <button className="btn btn-success me-2" onClick={applyAll}>
            Apply All Suggestions
            </button>
        </div>

        <div className="row">
            <div className="col-md-6">
            <h5>Original Resume with Suggestions</h5>
            {visibleSuggestions.map((s, i) => {
                const key = `${s.old}→${s.new}`;
                const isApplied = appliedChanges.has(key);

                return (
                    <div key={i} className={`border p-2 mb-2 ${!resumeText.includes(s.old) ? "border-danger" : ""}`}>
                    <p><strong>Original:</strong> {s.old || <em>(Empty section)</em>}</p>
                    <p><strong>Suggested:</strong> {s.new}</p>
                    <button
                        className="btn btn-outline-success btn-sm me-2"
                        onClick={() => applySuggestion(s.old, s.new)}
                        disabled={isApplied}
                    >
                        {isApplied ? "Applied" : "Apply"}
                    </button>
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => dismissSuggestion(i)}
                    >
                        Dismiss
                    </button>
                    </div>
                );
            })}
            </div>
            <div className="col-md-6">
            <h5>Updated Resume Text</h5>
            <div
                className="form-control"
                style={{ minHeight: "400px", whiteSpace: "pre-wrap" }}
                dangerouslySetInnerHTML={{ __html: resumeText }}
            ></div>
            </div>
        </div>
        </div>
    );
}

export default ResumeEditor;
