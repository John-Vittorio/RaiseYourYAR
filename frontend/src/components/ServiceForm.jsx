import React, { useState } from 'react';

const ServiceForm = ({ onNext, onPrevious }) => {
  const [services, setServices] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [newService, setNewService] = useState({
    type: '',
    role: '',
    notes: ''
  });

  const handleInputChange = (field, value) => {
    setNewService(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveService = () => {
    const serviceToAdd = {
      ...newService,
      id: services.length + 1
    };

    setServices(prev => [...prev, serviceToAdd]);

    setNewService({
      type: '',
      role: '',
      notes: ''
    });

    setShowForm(false);
  };

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
            <span className="active">Service</span>
          </div>
        </div>

        {/* Services List */}
        {services.map(service => (
          <div key={service.id} className="course-card">
            <h3 className="course-title">{service.type}</h3>
            <p>{service.department}</p>
            <p>{service.description}</p>
          </div>
        ))}

        {/* Add Service Form */}
        {showForm ? (
          <div className="course-card">
            <h3 className="course-title">Service Details</h3>

            <div className="yar-form-group">
              <label className="course-label">Service Type <span className="required-indicator">*</span></label>
              <select
                className="course-form-input"
                value={newService.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <option value="" disabled>Select Service Type</option>
                <option value="Department Committee">Department Committee</option>
                <option value="College Committee">College Committee</option>
                <option value="University Committee">University Committee</option>
                <option value="Professional Service">Professional Service</option>
                <option value="Community Service">Community Service</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="yar-form-group">
              <label className="course-label">Service Role</label>
              <input
                type="text"
                className="course-form-input"
                value={newService.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                placeholder="Your role in this service"
              />
            </div>

            <div className="yar-form-group">
              <label className="course-label">Notes</label>
              <textarea
                className="course-form-textarea"
                rows="4"
                value={newService.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional details about this service"
              ></textarea>
            </div>

            <div className="yar-button-group">
              <button
                onClick={() => setShowForm(false)}
                className="yar-button-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveService}
                className="yar-button-primary"
                disabled={!newService.type}
                style={{
                  opacity: !newService.type ? 0.6 : 1
                }}
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
            <span>Add Service</span>
          </div>
        )}

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
    </div>
  );
};

export default ServiceForm;