import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import ResumeNotification from './ResumeNotification';

const ServiceForm = ({ onNext, onPrevious, reportId }) => {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showThesisForm, setShowThesisForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isResuming, setIsResuming] = useState(false);
  const [editingServiceIndex, setEditingServiceIndex] = useState(-1);
  const [showStudentInput, setShowStudentInput] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const API_URL = 'https://raiseyouryar-3.onrender.com/api';

  const [newService, setNewService] = useState({
    type: '',
    role: '',
    department: '',
    description: '',
    notes: ''
  });

  const [thesisService, setThesisService] = useState({
    type: 'Thesis / Dissertation Committee',
    role: 'Committee Member',
    department: '',
    committeeName: '',
    degreeType: '',
    students: [],
    notes: ''
  });

  // Improved validation with field-specific error messages
  const validateService = (serviceData) => {
    const errors = {};

    if (!serviceData.type) {
      errors.type = 'Service type is required';
    }

    if (serviceData.type === 'Thesis / Dissertation Committee') {
      if (!serviceData.committeeName) {
        errors.committeeName = 'Committee name is required';
      }
      if (!serviceData.degreeType) {
        errors.degreeType = 'Degree type is required';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const [newStudent, setNewStudent] = useState('');

  // Function to scroll to top when editing
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

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

      try {
        const { data } = await axios.get(
          `${API_URL}/service/${reportId}`,
          config
        );

        if (data) {
          setServices(data);

          // If we found existing data, this is a resumed draft
          if (data.length > 0) {
            setIsResuming(true);
          }
        }
      } catch (error) {
        // 404 is expected if no service data exists yet
        if (error.response?.status !== 404) {
          console.error('Error fetching service entries:', error);
        }
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

      setSuccessMessage('Service data saved successfully!');

      // Proceed to general notes page
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
    // Clear field-specific error when the user makes a change
    if (formErrors[field]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }

    setNewService(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleThesisInputChange = (field, value) => {
    // Clear field-specific error when the user makes a change
    if (formErrors[field]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }

    setThesisService(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Improved function to add a student to the thesis committee service
  const handleAddStudent = () => {
    if (newStudent.trim()) {
      setThesisService(prev => ({
        ...prev,
        students: [...prev.students, newStudent.trim()]
      }));
      setNewStudent('');
      // Keep focus on the input field for better UX when adding multiple students
      setTimeout(() => {
        const studentInput = document.querySelector('.student-input');
        if (studentInput) studentInput.focus();
      }, 0);
    }
  };

  // Function to toggle student input visibility
  const toggleStudentInput = () => {
    setShowStudentInput(true);
    setNewStudent('');
  };

  // Function to remove a student from the thesis committee service
  const handleRemoveStudent = (indexToRemove) => {
    setThesisService(prev => ({
      ...prev,
      students: prev.students.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Improved function to handle editing a service
  const handleEditService = (service, index) => {
    // Reset any form errors
    setFormErrors({});

    // Check if this is a thesis committee service
    if (service.type === 'Thesis / Dissertation Committee') {
      setThesisService({
        type: service.type,
        // Don't include role and department for thesis committees
        committeeName: service.committeeName || '',
        degreeType: service.degreeType || '',
        students: service.students || [],
        notes: service.notes || ''
      });
      setShowThesisForm(true);
      setShowForm(false);
      setShowStudentInput(service.students?.length > 0);
    } else {
      setNewService({
        type: service.type || '',
        role: service.role || '',
        department: service.department || '',
        description: service.description || '',
        notes: service.notes || ''
      });
      setShowForm(true);
      setShowThesisForm(false);
    }

    setEditingServiceIndex(index);
    scrollToTop();
  };

  const handleSaveService = async () => {
    try {
      // Validate before saving
      const { isValid, errors } = validateService(newService);
      if (!isValid) {
        setFormErrors(errors);
        const errorMessages = Object.values(errors).join(', ');
        setError(errorMessages);
        return;
      }

      setLoading(true);
      setError('');
      setFormErrors({});

      if (editingServiceIndex >= 0) {
        // Update existing service
        const serviceId = services[editingServiceIndex]._id;

        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
          }
        };

        const response = await axios.put(
          `${API_URL}/service/${serviceId}`,
          newService,
          config
        );

        // Update the service in the local state
        const updatedServices = [...services];
        updatedServices[editingServiceIndex] = response.data;
        setServices(updatedServices);

        setSuccessMessage('Service updated successfully!');
      } else {
        // Create new service
        const data = await createService(newService);
        setServices(prev => [...prev, data]);
        setSuccessMessage('Service saved successfully!');
      }

      // Reset form
      setNewService({
        type: '',
        role: '',
        department: '',
        description: '',
        notes: ''
      });

      // Hide form and reset editing state
      setShowForm(false);
      setEditingServiceIndex(-1);

      // Clear success message after delay
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to save service';
      setError(errorMsg);

      // Set specific form errors if the error message matches a validation issue
      if (errorMsg.includes('Committee name')) {
        setFormErrors(prev => ({ ...prev, committeeName: 'Committee name is required' }));
      }
      if (errorMsg.includes('Degree type')) {
        setFormErrors(prev => ({ ...prev, degreeType: 'Degree type is required' }));
      }

      console.error('Error saving service:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveThesisService = async () => {
    try {
      // Validate before saving
      const { isValid, errors } = validateService(thesisService);
      if (!isValid) {
        setFormErrors(errors);
        const errorMessages = Object.values(errors).join(', ');
        setError(errorMessages);
        return;
      }

      setLoading(true);
      setError('');
      setFormErrors({});

      // Create the service data object with ONLY thesis committee fields
      // Removing role and department which aren't needed for thesis committees
      const serviceData = {
        type: 'Thesis / Dissertation Committee',
        committeeName: thesisService.committeeName,
        degreeType: thesisService.degreeType,
        students: thesisService.students,
        notes: thesisService.notes
      };

      if (editingServiceIndex >= 0) {
        // Update existing thesis committee service
        const serviceId = services[editingServiceIndex]._id;

        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
          }
        };

        const response = await axios.put(
          `${API_URL}/service/${serviceId}`,
          serviceData,
          config
        );

        // Update the service in the local state
        const updatedServices = [...services];
        updatedServices[editingServiceIndex] = response.data;
        setServices(updatedServices);

        setSuccessMessage('Thesis committee service updated successfully!');
      } else {
        // Create new thesis committee service
        const data = await createService(serviceData);
        setServices(prev => [...prev, data]);
        setSuccessMessage('Thesis committee service saved successfully!');
      }

      // Reset form
      setThesisService({
        type: 'Thesis / Dissertation Committee',
        role: '', // Clear role
        department: '', // Clear department
        committeeName: '',
        degreeType: '',
        students: [],
        notes: ''
      });

      // Hide form and reset editing state
      setShowThesisForm(false);
      setEditingServiceIndex(-1);
      setShowStudentInput(false);

      // Clear success message after delay
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to save thesis committee service';
      setError(errorMsg);

      // Set specific form errors if the error message matches a validation issue
      if (errorMsg.includes('Committee name')) {
        setFormErrors(prev => ({ ...prev, committeeName: 'Committee name is required' }));
      }
      if (errorMsg.includes('Degree type')) {
        setFormErrors(prev => ({ ...prev, degreeType: 'Degree type is required' }));
      }

      console.error('Error saving thesis committee service:', error);
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
      `${API_URL}/service/${reportId}`,
      serviceData,
      config
    );

    return data;
  };

  const handleDeleteService = async (serviceId) => {
    try {
      setLoading(true);
      setError('');

      const config = {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      };

      await axios.delete(
        `${API_URL}/service/${serviceId}`,
        config
      );

      // Update local state to remove the deleted service
      setServices(prev => prev.filter(service => service._id !== serviceId));

      setSuccessMessage('Service entry deleted successfully!');

      // Clear success message after delay
      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete service');
      console.error('Error deleting service:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && services.length === 0) {
    return <div className="loading">Loading...</div>;
  }

  // Helper to check if a field has an error
  const hasError = (field) => formErrors[field] ? true : false;

  // Helper to get error message for a field
  const getErrorMessage = (field) => formErrors[field] || '';

  return (
    <div className="teaching-container">
      <div className="teaching-form-content">
        {isResuming && <ResumeNotification reportId={reportId} />}

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

        {/* Regular Service Form */}
        {showForm && (
          <div className="course-card">
            <h3 className="course-title">{editingServiceIndex >= 0 ? 'Edit Service' : 'Service Details'}</h3>

            <div className={`yar-form-group ${hasError('type') ? 'has-error' : ''}`}>
              <label className="course-label">Service Type <span className="required-indicator">*</span></label>
              <select
                className={`course-form-input ${hasError('type') ? 'input-error' : ''}`}
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
              {hasError('type') && <div className="error-text">{getErrorMessage('type')}</div>}
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
                onClick={() => {
                  setShowForm(false);
                  setEditingServiceIndex(-1);
                  setNewService({
                    type: '',
                    role: '',
                    department: '',
                    description: '',
                    notes: ''
                  });
                  setFormErrors({});
                }}
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
                {loading ? 'Saving' : editingServiceIndex >= 0 ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* Thesis / Dissertation Committee Form */}
        {showThesisForm && (
          <div className="course-card">
            <h3 className="course-title">
              {editingServiceIndex >= 0 ? 'Edit Thesis / Dissertation Committee' : 'Thesis / Dissertation Committee'}
            </h3>

            <div className={`yar-form-group ${hasError('committeeName') ? 'has-error' : ''}`}>
              <label className="course-label">Committee Name <span className="required-indicator">*</span></label>
              <input
                type="text"
                className={`course-form-input ${hasError('committeeName') ? 'input-error' : ''}`}
                value={thesisService.committeeName}
                onChange={(e) => handleThesisInputChange('committeeName', e.target.value)}
                placeholder="Name of the committee"
              />
              {hasError('committeeName') && <div className="error-text">{getErrorMessage('committeeName')}</div>}
            </div>

            <div className={`yar-form-group ${hasError('degreeType') ? 'has-error' : ''}`}>
              <label className="course-label">Degree Type <span className="required-indicator">*</span></label>
              <select
                className={`course-form-input ${hasError('degreeType') ? 'input-error' : ''}`}
                value={thesisService.degreeType}
                onChange={(e) => handleThesisInputChange('degreeType', e.target.value)}
              >
                <option value="" disabled>Select Degree Type</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Graduate">Graduate</option>
                <option value="Ph.D.">Ph.D.</option>
              </select>
              {hasError('degreeType') && <div className="error-text">{getErrorMessage('degreeType')}</div>}
            </div>

            <div className="yar-form-group">
              <label className="course-label">Student Information</label>

              {/* Display list of students already added */}
              {thesisService.students && thesisService.students.length > 0 && (
                <div className="student-list">
                  {thesisService.students.map((student, index) => (
                    <div key={index} className="student-item">
                      <span>{student}</span>
                      <button
                        type="button"
                        className="remove-student-btn"
                        onClick={() => handleRemoveStudent(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Student button - shows input when clicked */}
              {!showStudentInput ? (
                <button
                  type="button"
                  className="yar-button-secondary"
                  onClick={toggleStudentInput}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B2E83" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>Add Student</span>
                </button>
              ) : (
                /* Add new student input and button - visible only when showStudentInput is true */
                <div className="add-student-row">
                  <input
                    type="text"
                    className="course-form-input student-input"
                    value={newStudent}
                    onChange={(e) => setNewStudent(e.target.value)}
                    placeholder="Student name"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newStudent.trim()) {
                        e.preventDefault();
                        handleAddStudent();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="yar-button-secondary"
                    onClick={handleAddStudent}
                    disabled={!newStudent.trim()}
                    style={{
                      opacity: !newStudent.trim() ? 0.6 : 1,
                      cursor: !newStudent.trim() ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Add Student
                  </button>
                  <button
                    type="button"
                    className="yar-button-secondary"
                    onClick={() => {
                      setShowStudentInput(false);
                      setNewStudent('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="yar-form-group">
              <label className="course-label">Notes</label>
              <textarea
                className="course-form-textarea"
                rows="4"
                value={thesisService.notes}
                onChange={(e) => handleThesisInputChange('notes', e.target.value)}
                placeholder="Additional details about this committee"
              ></textarea>
            </div>

            <div className="yar-button-group">
              <button
                onClick={() => {
                  setShowThesisForm(false);
                  setEditingServiceIndex(-1);
                  setThesisService({
                    type: 'Thesis / Dissertation Committee',
                    role: '',
                    department: '',
                    committeeName: '',
                    degreeType: '',
                    students: [],
                    notes: ''
                  });
                  setShowStudentInput(false);
                  setFormErrors({});
                }}
                className="yar-button-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveThesisService}
                className="yar-button-primary"
                disabled={!thesisService.committeeName || !thesisService.degreeType || loading}
                style={{
                  opacity: !thesisService.committeeName || !thesisService.degreeType || loading ? 0.6 : 1
                }}
              >
                {loading ? 'Saving' : editingServiceIndex >= 0 ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* Services List */}
        {services.map((service, index) => (
          <div key={service._id} className="course-card">
            <h3 className="course-title">{service.type}</h3>

            {/* Show Role and Department only for non-thesis committees */}
            {service.type !== 'Thesis / Dissertation Committee' && (
              <>
                {service.role && <p><strong>Role:</strong> {service.role}</p>}
                {service.department && <p><strong>Department:</strong> {service.department}</p>}
                {service.description && <p><strong>Description:</strong> {service.description}</p>}
              </>
            )}

            {/* For Thesis/Dissertation Committee, only show the relevant fields */}
            {service.type === 'Thesis / Dissertation Committee' && (
              <>
                {service.committeeName && <p><strong>Committee Name:</strong> {service.committeeName}</p>}
                {service.degreeType && <p><strong>Degree Type:</strong> {service.degreeType}</p>}
                {service.students && service.students.length > 0 && (
                  <p><strong>Student Information:</strong> {service.students.join(', ')}</p>
                )}
              </>
            )}

            {service.notes && <p><strong>Notes:</strong> {service.notes}</p>}

            <div className="service-actions">
              <button
                onClick={() => handleEditService(service, index)}
                className="yar-button-secondary edit-service"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteService(service._id)}
                className="yar-button-secondary delete-service"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {/* Add Service Buttons Container - Only show when no forms are open */}
        {!showForm && !showThesisForm && (
          <div className="add-service-buttons-container">
            {/* Add Regular Service Button */}
            <div
              className="add-course-button"
              onClick={() => {
                setShowForm(true);
                setShowThesisForm(false);
                setEditingServiceIndex(-1);
                setFormErrors({});
                scrollToTop();
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B2E83" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Add Service</span>
            </div>

            {/* Add Thesis Committee Button */}
            <div
              className="add-course-button"
              onClick={() => {
                setShowThesisForm(true);
                setShowForm(false);
                setEditingServiceIndex(-1);
                setShowStudentInput(false);
                setFormErrors({});
                scrollToTop();
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B2E83" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Add Thesis / Dissertation Committee Service</span>
            </div>
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
            {loading ? 'Saving...' : 'Next'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .service-actions {
          margin-top: 15px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        
        .delete-service {
          background-color: #f8f8f8;
          border: 1px solid #e0e0e0;
          color: #d32f2f;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 13px;
          transition: all 0.3s ease;
        }
        
        .delete-service:hover {
          background-color: #fbe9e7;
          border-color: #ffcdd2;
        }
        
        .edit-service {
          background-color: #f8f8f8;
          border: 1px solid #e0e0e0;
          color: #4B2E83;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 13px;
          transition: all 0.3s ease;
        }

        .edit-service:hover {
          background-color: #EAE6F4;
          border-color: #C8BEE6;
        }
        
        /* Add Service Buttons Container */
        .add-service-buttons-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }
        
        /* Student List Styling */
        .student-list {
          margin-bottom: 10px;
        }
        
        .student-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #f9f9f9;
          border: 1px solid #e0e0e0;
          padding: 8px 12px;
          margin-bottom: 5px;
          border-radius: 4px;
        }
        
        .remove-student-btn {
          background: none;
          border: none;
          color: #d32f2f;
          font-size: 16px;
          cursor: pointer;
          padding: 0 5px;
        }
        
        .add-student-row {
          display: flex;
          gap: 10px;
          width: 100%;
          margin-bottom: 10px;
        }
        
        .student-input {
          flex-grow: 1;
        }
        
        /* Disabled button styling */
        .yar-button-secondary:disabled {
          background-color: #f5f5f5;
          color: #999;
          border-color: #ddd;
          cursor: not-allowed;
        }
        
        /* Animation for form transitions */
        .course-card {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ServiceForm;