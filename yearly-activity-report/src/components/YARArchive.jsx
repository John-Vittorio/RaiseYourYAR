import React from 'react';

const YARArchive = ({ onStart }) => {
  const yarArchive = [
    { year: '2024', id: 1 },
    { year: '2023', id: 2 },
    { year: '2022', id: 3 },
    { year: '2021', id: 4 },
    { year: '2020', id: 5 },
  ];

  return (
    <div>
      {/* Top section - Start button */}
      <div 
        style={{
          backgroundColor: '#32006E',
          padding: '20px 30px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={onStart}
      >
        <h2 style={{ color: 'white', margin: 0, fontSize: '24px' }}>Start your Yearly Activity Report</h2>
        <div style={{ color: 'white', fontSize: '24px' }}>›</div>
      </div>

      {/* Archive section */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px',
        padding: '20px 30px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          fontSize: '24px', 
          marginTop: 0,
          marginBottom: '20px',
          color: '#333'
        }}>Yearly Activity Report Archive</h2>
        
        <div>
          {yarArchive.map((item) => (
            <div 
              key={item.id} 
              style={{ 
                margin: '15px 0',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V21C21 22.1046 20.1046 23 19 23H5C3.89543 23 3 22.1046 3 21V5Z" stroke="#4B2E83" strokeWidth="2"/>
              </svg>
              <span style={{ marginLeft: '10px' }}>{item.year}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YARArchive;