import React, { useState } from 'react';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div className="yar-form-container">
      <h1 className="yar-title">Yearly Activity Report</h1>
      
      <div className="yar-form-wrapper">
        <form onSubmit={handleSubmit}>
          <div className="yar-form-group">
            <label 
              htmlFor="netId" 
              className="yar-form-label"
            >
              Please enter your NetId
            </label>
            <input
              type="text"
              id="netId"
              name="netId"
              value={formData.netId}
              onChange={handleChange}
              required
              placeholder="billhowe123"
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