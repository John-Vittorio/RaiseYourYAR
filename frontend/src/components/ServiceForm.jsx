import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import ResumeNotification from './ResumeNotification';

const ServiceForm = ({ onNext, onPrevious, reportId }) => {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isResuming, setIsResuming] = useState(false);
  const [editingServiceIndex, setEditingServiceIndex] = useState(-1);
  
  const { currentUser } = useContext(AuthContext);

  const [newService, setNewService] = useState({
    type: '',
    role: '',
    department: '',
    description: '',
    notes: '',
    committeeName: '',
    degreeType: '',
    students: []
  });

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
      
      // Get service entries
      try {
        const { data } = await axios.get(
          `https://raiseyouryar-3.onrender.com/api/service/${reportId}`,
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
    setNewService(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle adding a new student
  const handleAddStudent = () => {
    setNewService(prev => ({
      ...prev,
      students: [...prev.students, { name: '' }]
    }));
  };

  // Handle student name change
  const handleStudentNameChange = (index, value) => {
    const updatedStudents = [...newService.students];
    updatedStudents[index] = { name: value };
    
    setNewService(prev => ({
      ...prev,
      students: updatedStudents
    }));
  };

  // Handle removing a student
  const handleRemoveStudent = (index) => {
    const updatedStudents = [...newService.students];
    updatedStudents.splice(index, 1);
    
    setNewService(prev => ({
      ...prev,
      students: updatedStudents
    }));
  };
  
  // Function to handle editing a service
  const handleEditService = (service, index) => {
    setNewService({
      type: service.type || '',
      role: service.role || '',
      department: service.department || '',
      description: service.description || '',
      notes: service.notes || '',
      committeeName: service.committeeName || '',
      degreeType: service.degreeType || '',
      students: service.students || []
    });
    setEditingServiceIndex(index);
    setShowForm(true);
    scrollToTop();
  };
  
  const handleSaveService = async () => {
    try {
      setLoading(true);
      setError('');
      
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
          `https://raiseyouryar-3.onrender.com/api/service/${serviceId}`,
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
        notes: '',
        committeeName: '',
        degreeType: '',
        students: []
      });
      
      // Hide form and reset editing state
      setShowForm(false);
      setEditingServiceIndex(-1);
      
      // Clear success message after delay
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
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
        `https://raiseyouryar-3.onrender.com/api/service/${serviceId}`,
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

  // Render form fields based on service type
  const renderServiceTypeFields = () => {
    if (newService.type === 'Thesis / Dissertation Committee') {
      return (
        <>
          <div className="yar-form-group">
            <label className="course-label">Committee Name <span className="required-indicator">*</span></label>
            <input
              type="text"
              className="course-form-input"
              value={newService.committeeName}
              onChange={(e) => handleInputChange('committeeName', e.target.value)}
              placeholder="Name of the committee"
            />
          </div>

          <div className="yar-form-group">
            <label className="course-label">Degree Type <span className="required-indicator">*</span></label>
            <select
              className="course-form-input"
              value={newService.degreeType}
              onChange={(e) => handleInputChange('degreeType', e.target.value)}
            >
              <option value="" disabled>Select Degree Type</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Graduate">Graduate</option>
              <option value="Ph.D.">Ph.D.</option>
            </select>
          </div>

          <div className="yar-form-group">
            <label className="course-label">Students</label>
            
            {newService.students.map((student, index) => (
              <div key={index} className="student-input-group">
                <input
                  type="text"
                  className="course-form-input student-name-input"
                  value={student.name}
                  onChange={(e) => handleStudentNameChange(index, e.target.value)}
                  placeholder="Student name"
                />
                <button 
                  type="button" 
                  className="remove-student-button"
                  onClick={() => handleRemoveStudent(index)}
                >
                  ✕
                </button>
              </div>
            ))}
            
            <button 
              type="button" 
              className="yar-button-secondary add-student-button"
              onClick={handleAddStudent}
            >
              + Add Student
            </button>
          </div>
        </>
      );
    }
    
    return null;
  };

  if (loading && services.length === 0) {
    return <div className="loading">Loading...</div>;
  }

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

        {/* Service Form - Now at the top for editing */}
        {showForm && (
          <div className="course-card">
            <h3 className="course-title">{editingServiceIndex >= 0 ? 'Edit Service' : 'Service Details'}</h3>

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
                <option value="Thesis / Dissertation Committee">Thesis / Dissertation Committee</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Render fields based on service type */}
            {renderServiceTypeFields()}

            {/* Always show these fields for all service types */}
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
                    notes: '',
                    committeeName: '',
                    degreeType: '',
                    students: []
                  });
                }}
                className="yar-button-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveService}
                className="yar-button-primary"
                disabled={!newService.type || (newService.type === 'Thesis / Dissertation Committee' && (!newService.committeeName || !newService.degreeType)) || loading}
                style={{
                  opacity: !newService.type || (newService.type === 'Thesis / Dissertation Committee' && (!newService.committeeName || !newService.degreeType)) || loading ? 0.6 : 1
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
            {service.type === 'Thesis / Dissertation Committee' && (
              <>
                {service.committeeName && <p><strong>Committee Name:</strong> {service.committeeName}</p>}
                {service.degreeType && <p><strong>Degree Type:</strong> {service.degreeType}</p>}
                {service.students && service.students.length > 0 && (
                  <div className="student-list">
                    <p><strong>Students:</strong></p>
                    <ul>
                      {service.students.map((student, idx) => (
                        <li key={idx}>{student.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
            {service.role && <p><strong>Role:</strong> {service.role}</p>}
            {service.department && <p><strong>Department:</strong> {service.department}</p>}
            {service.description && <p><strong>Description:</strong> {service.description}</p>}
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

        {/* Add Service Button - only show when not editing */}
        {!showForm && (
          <div
            className="add-course-button"
            onClick={() => {
              setShowForm(true);
              setEditingServiceIndex(-1);
              scrollToTop();
            }}
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
            {loading ? 'Next' : 'Next'} 
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
        
        /* Student form styling */
        .student-input-group {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .student-name-input {
          flex: 1;
        }
        
        .remove-student-button {
          margin-left: 10px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid #e0e0e0;
          background: #f8f8f8;
          color: #888;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .remove-student-button:hover {
          background: #f1f1f1;
          color: #d32f2f;
          border-color: #d32f2f;
        }
        
        .add-student-button {
          margin-top: 5px;
          font-size: 14px;
          padding: 5px 12px;
        }
        
        .student-list ul {
          margin: 5px 0 15px 20px;
          padding: 0;
        }
        
        .student-list li {
          margin-bottom: 3px;
        }
        
        .required-indicator {
          color: #d32f2f;
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