import React from "react";
import image from "../images/drive.png";

const YARArchive = ({ onStart }) => {
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
      <div className="privacy-form-version">
        <h2 className="privacy-heading">Privacy Statement</h2>
        <div className="privacy-content">
          <p className="opening-paragraph">
            Our Yearly Activity Report (YAR) tool, RaiseYourYAR, is designed to
            support department leadership in making strategic, data-informed
            decisions related to faculty activities such as tenure, promotion,
            and resource allocation. To accomplish this, YAR uses class
            enrollment data and associated metrics—such as enrollment credit
            hours—presented in aggregate form through visualizations and
            dashboards. We are committed to ensuring transparency, security, and
            ethical handling of all data. YAR adheres to all University of
            Washington data governance policies and complies fully with FERPA
            (Family Educational Rights and Privacy Act) and any relevant faculty
            confidentiality regulations.
          </p>
          <h3 className="section-header">Key Privacy Practices</h3>
          <ul className="privacy-list">
            <li>
              <strong>Data Sources:</strong> Data is securely pulled from
              institutional sources including the UW Registrar and
              ORCID-integrated faculty profiles. All access is read-only and
              authorized through university-approved APIs or exports.
            </li>
            <li>
              <strong>Aggregate Metrics Only:</strong> We do not display
              individual student information or personally identifiable data.
              Enrollment and teaching metrics are anonymized and shown in
              summary formats.
            </li>
            <li>
              <strong>Data Use Limitation:</strong> The data is used exclusively
              to visualize instructional contributions and departmental trends
              for academic planning—not for performance evaluation outside
              established university review procedures.
            </li>
            <li>
              <strong>Role Based Access Control:</strong> Access to dashboards
              and reports is restricted to authorized faculty leadership (e.g.,
              department chairs, associate deans) and the faculty member to whom
              the data pertains, where applicable.
            </li>
          </ul>
          <p className="ending-paragraph">
            We are committed to open communication. Faculty are welcome to
            review how their data is presented and can reach out with questions
            or concerns at any point during the process.
          </p>
        </div>
      </div>
    </div>
  );
};

export default YARArchive;
