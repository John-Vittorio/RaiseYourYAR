import React, { useState } from 'react';

const ResearchForm = ({ onNext, onPrevious }) => {
  const [publications, setPublications] = useState([
    {
      id: 1,
      authors: 'King, J. & Doe, A.',
      year: '(2023)',
      title: '"Exploring Urban Data for Smart Cities."',
      journal: 'Journal of Urban Informatics',
      volume: '12(3)',
      pages: '45-60',
      doi: 'https://doi.org/10.xxxxx/yyyy'
    },
    {
      id: 2,
      authors: 'King, J. & Thompson, L.',
      year: '(2023)',
      title: '"Data-Driven Approaches to Urban Sustainability."',
      journal: 'Journal of Smart City Research',
      volume: '10(4)',
      pages: '215-230',
      doi: 'https://doi.org/10.xxxxx/yyyy'
    }
  ]);
  
  const [showForm, setShowForm] = useState(false);
  const [newPublication, setNewPublication] = useState({
    publicationType: 'Journal',
    title: '',
    status: 'Under Review',
    journalName: '',
    publicationStatus: 'In Progress'
  });

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setNewPublication(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSavePublication = () => {
    setShowForm(false);
  };

  return (
    <div className="teaching-container">
      <div className="teaching-header">
        <h1 className="yar-title">Yearly Activity Report</h1>
        <div className="teaching-breadcrumb">
          <span className="inactive">Start</span>
          <span className="separator">›</span>
          <span className="inactive">Teaching</span>
          <span className="separator">›</span>
          <span className="active">Research</span>
        </div>
      </div>

      {/* Publications List */}
      {publications.map(pub => (
        <div key={pub.id} className="course-card">
          <p>
            {pub.authors} {pub.year} {pub.title} {pub.journal}, {pub.volume}, {pub.pages}. {pub.doi}
          </p>
        </div>
      ))}

      {/* Add Publication Form */}
      {showForm ? (
        <div className="course-card">
          <div className="yar-form-group">
            <label className="course-label">Publication Type <span className="required-indicator">*</span></label>
            <select 
              className="course-form-input"
              value={newPublication.publicationType}
              onChange={(e) => handleInputChange('publicationType', e.target.value)}
            >
              <option value="Journal">Journal</option>
              <option value="Conference">Conference</option>
              <option value="Book">Book</option>
              <option value="Book Chapter">Book Chapter</option>
              <option value="Report">Report</option>
            </select>
          </div>

          <div className="yar-form-group">
            <label className="course-label">Publication Title <span className="required-indicator">*</span></label>
            <input 
              type="text"
              className="course-form-input"
              value={newPublication.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter publication title"
            />
          </div>

          <div className="yar-form-group">
            <label className="course-label">Where In Progress <span className="required-indicator">*</span></label>
            <select 
              className="course-form-input"
              value={newPublication.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <option value="Under Review">Under Review</option>
              <option value="In Preparation">In Preparation</option>
              <option value="Revise and Resubmit">Revise and Resubmit</option>
            </select>
          </div>

          <div className="yar-form-group">
            <label className="course-label">Journal Name <span className="required-indicator">*</span></label>
            <input 
              type="text"
              className="course-form-input"
              value={newPublication.journalName}
              onChange={(e) => handleInputChange('journalName', e.target.value)}
              placeholder="Enter journal name"
            />
          </div>

          <div className="yar-form-group">
            <label className="course-label">Publication Status <span className="required-indicator">*</span></label>
            <select 
              className="course-form-input"
              value={newPublication.publicationStatus}
              onChange={(e) => handleInputChange('publicationStatus', e.target.value)}
            >
              <option value="In Progress">In Progress</option>
              <option value="Published">Published</option>
              <option value="Accepted">Accepted</option>
            </select>
          </div>

          <div className="yar-button-group">
            <button 
              onClick={() => setShowForm(false)}
              className="yar-button-secondary"
            >
              Cancel
            </button>
            <button 
              onClick={handleSavePublication}
              className="yar-button-primary"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div 
          className="add-course-button"
          onClick={() => setShowForm(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B2E83" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Add Publication</span>
        </div>
      )}

      {/* Research Section Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
        <div 
          className="add-course-button"
          onClick={() => console.log("Add Research Grants/Contract")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B2E83" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Add Research Grants/Contract</span>
        </div>

        <div 
          className="add-course-button"
          onClick={() => console.log("Non Funded Research/Creative Work")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B2E83" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Non Funded Research/Creative Work</span>
        </div>

        <div 
          className="add-course-button"
          onClick={() => console.log("Funded Research/Creative Work")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B2E83" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Funded Research/Creative Work</span>
        </div>

        <div 
          className="add-course-button"
          onClick={() => console.log("Other Funding Awards")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B2E83" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Other Funding Awards</span>
        </div>

        <div 
          className="add-course-button"
          onClick={() => console.log("Conference Participation")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B2E83" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Conference Participation</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="navigation-buttons">
        <button 
          className="yar-button-secondary" 
          onClick={onPrevious}
        >
          Previous
        </button>
        <button 
          className="yar-button-next"
          onClick={onNext}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ResearchForm;