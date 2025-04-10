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
    <div style={{ padding: '20px 40px' }}>
      <h1 style={{ 
        color: '#4B2E83', 
        fontSize: '32px', 
        marginBottom: '30px',
        fontFamily: 'sans-serif'
      }}>
        Yearly Activity Report
      </h1>
      
      <div style={{ maxWidth: '550px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="netId" 
              style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontWeight: 'normal',
                fontSize: '16px'
              }}
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
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label 
              htmlFor="fullName" 
              style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontWeight: 'normal',
                fontSize: '16px'
              }}
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
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              onClick={handleCancel}
              style={{
                padding: '8px 20px',
                borderRadius: '5px',
                border: '1px solid #4B2E83',
                backgroundColor: 'white',
                color: '#333',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'normal'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              style={{
                padding: '8px 20px',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: '#32006E',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'normal'
              }}
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