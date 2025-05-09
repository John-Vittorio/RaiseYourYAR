import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const ServiceForm = ({ onNext, onPrevious, reportId }) => {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Add state for section notes
  const [sectionNotes, setSectionNotes] = useState('');
  const [originalSectionNotes, setOriginalSectionNotes] = useState('');

  const { currentUser } = useContext(AuthContext);

  const [newService, setNewService] = useState({
    type: '',
    role: '',
    department: '',
    description: '',
    notes: ''
  });

  // Fetch existing service data if available
  useEffect(() => {
    if (reportId) {
      fetchServiceData();
    }
  }, [reportId]);

  const fetchServiceData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const config = {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      };
      
      // First, try to get service entries
      try {
        const { data } = await axios.get(
          `https://raiseyouryar-3.onrender.com/api/service/${reportId}`,
          config
        );

        // const { data } = await axios.get(
        //   `http://localhost:5001/api/service/${reportId}`,
        //   config
        // );
      
        if (data) {
          setServices(data);
        }
      } catch (error) {
        // 404 is expected if no service data exists yet
        if (error.response?.status !== 404) {
          console.error('Error fetching service entries:', error);
        }
      }
      
      // Then, get the report to check for section notes
      try {
        const reportResponse = await axios.get(
          `https://raiseyouryar-3.onrender.com/api/reports/${reportId}`,
          config
        );

        // const reportResponse = await axios.get(
        //   `http://localhost:5001/api/reports/${reportId}`,
        //   config
        // );
        
        if (reportResponse.data && reportResponse.data.serviceNotes) {
          setSectionNotes(reportResponse.data.serviceNotes);
          setOriginalSectionNotes(reportResponse.data.serviceNotes);
        }
      } catch (reportError) {
        console.error('Error fetching report for notes:', reportError);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        setError(error.response?.data?.message || 'Failed to fetch service data');
        console.error('Error fetching service data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Save service data and proceed to next section
  const handleSaveAndNext = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      
      // If there are no services added yet, we need to create at least a placeholder
      if (services.length === 0) {
        await createService({
          type: 'Other',
          role: 'None',
          notes: 'No service activities reported for this period'
        });
      }
      
      // Save section notes to the report
      if (sectionNotes !== originalSectionNotes) {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
          }
        };
        
        await axios.put(
          `https://raiseyouryar-3.onrender.com/api/reports/${reportId}`,
          { serviceNotes: sectionNotes },
          config
        );

        // await axios.put(
        //   `http://localhost:5001/api/reports/${reportId}`,
        //   { serviceNotes: sectionNotes },
        //   config
        // );
        
        setOriginalSectionNotes(sectionNotes);
      }
      
      setSuccessMessage('Service data saved successfully!');
      
      // Proceed to review page (instead of directly submitting)
      setTimeout(() => {
        onNext();
      }, 1000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save service data');
      console.error('Error saving service data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewService(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle section notes change
  const handleSectionNotesChange = (e) => {
    setSectionNotes(e.target.value);
  };
  
  const handleSaveService = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await createService(newService);
      
      // Add the new service to our local state
      setServices(prev => [...prev, data]);
      
      // Reset form
      setNewService({
        type: '',
        role: '',
        department: '',
        description: '',
        notes: ''
      });
      
      // Hide form
      setShowForm(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save service');
      console.error('Error saving service:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const createService = async (serviceData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser.token}`
      }
    };
    
    const { data } = await axios.post(
      `https://raiseyouryar-3.onrender.com/api/service/${reportId}`,
      serviceData,
      config
    );

    // const { data } = await axios.post(
    //   `http://localhost:5001/api/service/${reportId}`,
    //   serviceData,
    //   config
    // );
    
    return data;
  };

  if (loading) {
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
            <span className="active">Service</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        {/* Section Notes */}
        <div className="course-card">
          <h3 className="course-title">Service Section Notes</h3>
          <p className="notes-instruction">
            If there is something you would like the department to know about your activities this year, please briefly describe here. You might consider the following ways to evaluate research and creative work: publication/output, funding, impact, peer reputation, and prestige of output venues.
          </p>
          <div className="yar-form-group">
            <textarea
              className="course-notes"
              rows="6"
              value={sectionNotes}
              onChange={handleSectionNotesChange}
              placeholder="Enter any additional notes about your service activities here..."
              style={{ width: '100%', padding: '12px', marginTop: '15px' }}
            ></textarea>
          </div>
        </div>

        {/* Services List */}
        {services.map(service => (
          <div key={service._id} className="course-card">
            <h3 className="course-title">{service.type}</h3>
            {service.role && <p><strong>Role:</strong> {service.role}</p>}
            {service.department && <p><strong>Department:</strong> {service.department}</p>}
            {service.description && <p><strong>Description:</strong> {service.description}</p>}
            {service.notes && <p><strong>Notes:</strong> {service.notes}</p>}
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
                <option value="Admissions Committee">Admissions Committee</option>
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
              <label className="course-label">Department</label>
              <input
                type="text"
                className="course-form-input"
                value={newService.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="Department or unit for this service"
              />
            </div>

            <div className="yar-form-group">
              <label className="course-label">Description</label>
              <textarea
                className="course-form-textarea"
                rows="3"
                value={newService.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description of service activities"
              ></textarea>
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
                disabled={!newService.type || loading}
                style={{
                  opacity: !newService.type || loading ? 0.6 : 1
                }}
              >
                {loading ? 'Saving...' : 'Save'}
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
            disabled={loading}
          >
            Previous
          </button>
          <button
            className="yar-button-next"
            onClick={handleSaveAndNext}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Next: Review'} {/* Updated button text */}
          </button>
        </div>
      </div>

      <style jsx>{`
        .success-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 50vh;
          padding: 30px;
        }
        
        .success-message-large {
          background-color: rgba(76, 175, 80, 0.1);
          border-left: 4px solid #4CAF50;
          color: #2e7d32;
          padding: 30px;
          border-radius: 8px;
          text-align: center;
          max-width: 600px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .success-message-large h2 {
          margin-top: 0;
          color: #2e7d32;
        }
        
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

export default ServiceForm;