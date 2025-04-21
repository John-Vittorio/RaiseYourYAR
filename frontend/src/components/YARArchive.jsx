import React from "react";
import image from "../images/drive.png"

const YARArchive = ({ onStart }) => {
  const yarArchive = [
    { year: "2024", id: 1 },
    { year: "2023", id: 2 },
    { year: "2022", id: 3 },
    { year: "2021", id: 4 },
    { year: "2020", id: 5 },
  ];

  return (
    <div className="yar-container">
      {/* Top section - Start button */}
      <div className="yar-buttons-container">
        <div className="yar-start-button" onClick={onStart}>
          <h2>Access Yearly Activity Report</h2>
          <div className="arrow">›</div>
        </div>
        <div className="yar-archive-button">
          <h2>View YAR Archive</h2>
          <img src={image} />
        </div>
      </div>

      {/* Archive section */}
      <div className="yar-archive-container">
        <h2 className="yar-archive-title">Yearly Activity Report Archive</h2>

        <div>
          {yarArchive.map((item) => (
            <div key={item.id} className="yar-archive-item">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V21C21 22.1046 20.1046 23 19 23H5C3.89543 23 3 22.1046 3 21V5Z"
                  stroke="#4B2E83"
                  strokeWidth="2"
                />
              </svg>
              <span>{item.year}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YARArchive;
