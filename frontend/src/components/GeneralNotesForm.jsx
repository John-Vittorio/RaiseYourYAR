import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const GeneralNotesForm = ({ onNext, onPrevious, reportId }) => {
  const [generalNotes, setGeneralNotes] = useState('');
  const [originalNotes, setOriginalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { currentUser } = useContext(AuthContext);

  // Fetch existing notes if available
  useEffect(() => {
    if (reportId) {
      fetchReportData();
    }
  }, [reportId]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const config = {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      };
      
      // Get the report to check for existing notes
      try {
        const reportResponse = await axios.get(
          `https://raiseyouryar-3.onrender.com/api/reports/${reportId}`,
          config
        );

        // const reportResponse = await axios.get(
        //   `http://localhost:5001/api/reports/${reportId}`,
        //   config
        // );
        
        if (reportResponse.data && reportResponse.data.notes) {
          setGeneralNotes(reportResponse.data.notes);
          setOriginalNotes(reportResponse.data.notes);
        }
      } catch (reportError) {
        console.error('Error fetching report for notes:', reportError);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  // Save notes and proceed to next section
  const handleSaveAndNext = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      
      // Save notes to the report
      if (generalNotes !== originalNotes) {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
          }
        };
        
        await axios.put(
          `https://raiseyouryar-3.onrender.com/api/reports/${reportId}`,
          { notes: generalNotes },
          config
        );

        // await axios.put(
        //   `http://localhost:5001/api/reports/${reportId}`,
        //   { notes: generalNotes },
        //   config
        // );
        
        setOriginalNotes(generalNotes);
      }
      
      setSuccessMessage('General notes saved successfully!');
      
      setTimeout(() => {
        onNext();
      }, 1000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save general notes');
      console.error('Error saving general notes:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle notes change
  const handleNotesChange = (e) => {
    setGeneralNotes(e.target.value);
  };

  if (loading && !generalNotes) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="teaching-container">
      <div className="teaching-form-content">
        <div className="teaching-header">
          <h1 className="yar-title">Yearly Activity Report</h1>
          <div className="teaching-breadcrumb">
            <span className="inactive">Start</span>
            <span className="separator">›</span>
            <span className="inactive">Teaching</span>
            <span className="separator">›</span>
            <span className="inactive">Research</span>
            <span className="separator">›</span>
            <span className="inactive">Service</span>
            <span className="separator">›</span>
            <span className="active">General Notes</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        {/* General Notes */}
        <div className="course-card">
          <h3 className="course-title">General Notes</h3>
          <p className="notes-instruction">
            Please provide any additional notes or context about your activities this academic year. This is an opportunity to highlight achievements, explain circumstances, or provide additional context that doesn't fit into the other sections.
          </p>
          <div className="yar-form-group">
            <textarea
              className="course-notes"
              rows="12"
              value={generalNotes}
              onChange={handleNotesChange}
              placeholder="Enter any additional notes about your activities this year..."
              style={{ width: '100%', padding: '12px', marginTop: '15px' }}
            ></textarea>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="navigation-buttons">
          <button
            className="yar-button-secondary"
            onClick={onPrevious}
            disabled={loading}
          >
            Previous
          </button>
          <button
            className="yar-button-next"
            onClick={handleSaveAndNext}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Next: Review'} 
          </button>
        </div>
      </div>

      <style jsx>{`
        .notes-instruction {
          background-color: #f9f9ff;
          padding: 15px;
          border-left: 3px solid #4B2E83;
          border-radius: 4px;
          font-family: "Encode Sans";
          margin-top: 10px;
          line-height: 1.6;
          color: #555;
        }
      `}</style>
    </div>
  );
};

export default GeneralNotesForm;