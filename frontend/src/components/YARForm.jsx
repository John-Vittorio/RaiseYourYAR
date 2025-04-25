import React, { useState } from 'react';
import axios from 'axios'

const YARForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    netId: '',
    fullName: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/reports", formData)
      console.log("The data was sent successfully...")
    } catch (error) {
      console.error('Failed to send data:', error);
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div className="yar-container">
      <h1 className="yar-title">Yearly Activity Report</h1>
      
      <div className="yar-form-wrapper">
        <form onSubmit={handleSubmit} className="actual-form">
          <div className="yar-form-group">
            <label 
              htmlFor="netId" 
              className="yar-form-label"
            >
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
            />
          </div>
          
          <div className="yar-form-group">
            <label 
              htmlFor="fullName" 
              className="yar-form-label"
            >
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
            />
          </div>
          
          <div className="yar-button-group">
            <button 
              type="button" 
              onClick={handleCancel}
              className="yar-button-cancel"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="yar-button-primary"
            >
              Start
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default YARForm;