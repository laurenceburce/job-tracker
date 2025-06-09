import { useState, useEffect } from "react";

function Tracker() {
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    job_link: "",
    status: "Applied",
    applied_date: "",
    notes: ""
  });

  const [applications, setApplications] = useState([]);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const response = await fetch("http://127.0.0.1:8000/applications");
    const data = await response.json();
    setApplications(data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editId
      ? `http://127.0.0.1:8000/applications/${editId}`
      : "http://127.0.0.1:8000/applications";
    const method = editId ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      alert(editId ? "Application updated!" : "Application saved!");
      setFormData({
        company: "",
        position: "",
        job_link: "",
        status: "Applied",
        applied_date: "",
        notes: ""
      });
      setEditId(null);
      fetchApplications();
    } else {
      alert("Failed to submit.");
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Delete this job?");
    if (!confirm) return;

    const response = await fetch(`http://127.0.0.1:8000/applications/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setApplications(applications.filter((app) => app.id !== id));
    } else {
      alert("Failed to delete.");
    }
  };

  const handleEdit = (app) => {
    setFormData(app);
    setEditId(app.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (isoString) => {
    return isoString ? new Date(isoString).toLocaleDateString() : "-";
  };

  const badgeClass = (status) => {
    switch (status) {
      case "Interviewing":
        return "badge bg-warning text-dark";
      case "Offer":
        return "badge bg-success";
      case "Rejected":
        return "badge bg-danger";
      default:
        return "badge bg-secondary";
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center text-primary mb-4">Job Application Tracker</h1>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Company</label>
            <input type="text" className="form-control" name="company" value={formData.company} onChange={handleChange} required />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Position</label>
            <input type="text" className="form-control" name="position" value={formData.position} onChange={handleChange} required />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Job Link</label>
          <input type="url" className="form-control" name="job_link" value={formData.job_link} onChange={handleChange} />
        </div>

        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label">Status</label>
            <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
              <option>Applied</option>
              <option>Interviewing</option>
              <option>Offer</option>
              <option>Rejected</option>
            </select>
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Applied Date</label>
            <input type="date" className="form-control" name="applied_date" value={formData.applied_date || ""} onChange={handleChange} />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Notes</label>
          <textarea className="form-control" name="notes" rows="3" value={formData.notes} onChange={handleChange}></textarea>
        </div>

        <button type="submit" className={`btn ${editId ? "btn-warning" : "btn-primary"}`}>
          {editId ? "Update Application" : "Save Application"}
        </button>
      </form>

      <h2 className="mt-5">Saved Applications</h2>
      <table className="table table-bordered table-hover mt-3">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Company</th>
            <th>Position</th>
            <th>Status</th>
            <th>Applied Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td>{app.id}</td>
              <td>{app.company}</td>
              <td>{app.position}</td>
              <td><span className={badgeClass(app.status)}>{app.status}</span></td>
              <td>{formatDate(app.applied_date)}</td>
              <td>
                <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleEdit(app)}>Edit</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(app.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Tracker;