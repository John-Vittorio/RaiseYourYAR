import React, { useState } from "react";
import { userService, reportService } from "../services/api.service";

const YARForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    netId: "",
    fullName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Attempting to submit form with data:", formData);
      // First, check if user exists
      let user;
      try {
        user = await userService.getUserByNetId(formData.netId);
      } catch (err) {
        // If user doesn't exist, create new user
        user = await userService.createUser({
          netId: formData.netId,
          fullName: formData.fullName,
          email: `${formData.netId}@uw.edu`,
        });
      }

      // Create a new report for the current academic year
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      // Determine academic year
      const academicYear =
        month >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`;

      const report = await reportService.createReport({
        userId: user._id,
        academicYear,
      });

      // Store in localStorage for state persistence
      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("currentReport", JSON.stringify(report.report));

      // Call onSubmit callback with user and report data
      onSubmit({
        user,
        report: report.report,
      });
    } catch (err) {
      console.error("Error starting YAR process:", err);
      setError("Failed to start the YAR process. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div className="yar-container">
      <h1 className="yar-title">Yearly Activity Report</h1>

      <div className="yar-form-wrapper">
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="actual-form">
          <div className="yar-form-group">
            <label htmlFor="netId" className="yar-form-label">
              Enter NetID
            </label>
            <input
              type="text"
              id="netId"
              name="netId"
              value={formData.netId}
              onChange={handleChange}
              required
              placeholder="billhowe@uw.edu"
              className="yar-form-input"
              disabled={loading}
            />
          </div>

          <div className="yar-form-group">
            <label htmlFor="fullName" className="yar-form-label">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Bill J. Howe"
              className="yar-form-input"
              disabled={loading}
            />
          </div>

          <div className="yar-button-group">
            <button
              type="button"
              onClick={handleCancel}
              className="yar-button-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="yar-button-primary"
              disabled={loading}
            >
              {loading ? "Starting..." : "Start"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default YARForm;
