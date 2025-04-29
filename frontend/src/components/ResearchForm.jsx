import React, { useState } from 'react';

const AddResearchSection = ({ onAddPublication, onAddGrant, onAddNonFundedResearch, onAddFundedResearch, onAddOtherFunding, onAddConference }) => {

  const actions = [
    { label: "Add Publication", onClick: onAddPublication },
    { label: "Add Research Grants/Contract", onClick: onAddGrant },
    { label: "Non Funded Research/Creative Work", onClick: onAddNonFundedResearch },
    { label: "Funded Research/Creative Work", onClick: onAddFundedResearch },
    { label: "Other Funding Awards", onClick: onAddOtherFunding },
    { label: "Conference Participation", onClick: onAddConference },
  ];

  return (
    <div className="section-buttons">
      {actions.map((action, index) => (
        <div
          key={index}
          className="add-course-button"
          onClick={action.onClick}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B2E83" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>{action.label}</span>
        </div>
      ))}
    </div>
  );
};

const ResearchForm = ({ onNext, onPrevious }) => {
  const [publications, setPublications] = useState([]);
  const [showPublicationForm, setShowPublicationForm] = useState(false);
  const [showGrantForm, setShowGrantForm] = useState(false);
  const [showNonFundedResearchForm, setShowNonFundedResearchForm] = useState(false);
  const [showFundedResearchForm, setShowFundedResearchForm] = useState(false);
  const [showOtherFundingForm, setShowOtherFundingForm] = useState(false);
  const [showConferenceForm, setShowConferenceForm] = useState(false);

  const [newPublication, setNewPublication] = useState({
    publicationType: 'Journal',
    title: '',
    status: 'Under Review',
    journalName: '',
    publicationStatus: 'In Progress'
  });

  const [grant, setGrant] = useState({
    client: '',
    title: '',
    contractNumber: '',
    role: '',
    totalAmount: '',
    yourShare: '',
    startDate: '',
    endDate: '',
    coPIs: [{ name: '', affiliation: '' }],
    notes: ''
  });

  const handlePublicationChange = (field, value) => {
    setNewPublication(prev => ({ ...prev, [field]: value }));
  };

  const handleGrantChange = (field, value) => {
    setGrant(prev => ({ ...prev, [field]: value }));
  };

  const updateCoPI = (index, field, value) => {
    const updated = [...grant.coPIs];
    updated[index][field] = value;
    setGrant(prev => ({ ...prev, coPIs: updated }));
  };

  const addCoPI = () => {
    setGrant(prev => ({ ...prev, coPIs: [...prev.coPIs, { name: '', affiliation: '' }] }));
  };

  const handleSavePublication = () => {
    setPublications([...publications, newPublication]);
    setNewPublication({
      publicationType: 'Journal',
      title: '',
      status: 'Under Review',
      journalName: '',
      publicationStatus: 'In Progress'
    });
    setShowPublicationForm(false);
  };

  const handleSaveGrant = () => {
    console.log('Saving grant:', grant); // Replace with actual save
    setGrant({
      client: '',
      title: '',
      contractNumber: '',
      role: '',
      totalAmount: '',
      yourShare: '',
      startDate: '',
      endDate: '',
      coPIs: [{ name: '', affiliation: '' }],
      notes: ''
    });
    setShowGrantForm(false);
  };

  const handleSaveNonFundedResearch = () => {
    console.log('Saving non-funded research:', grant);
    setShowNonFundedResearchForm(false);
  };

  const handleSaveFundedResearch = () => {
    console.log('Saving funded research:', grant);
    setShowFundedResearchForm(false);
  };

  const handleSaveOtherFunding = () => {
    console.log('Saving other funding awards:', grant);
    setShowOtherFundingForm(false);
  };

  const handleSaveConference = () => {
    console.log('Saving conference participation:', grant);
    setShowConferenceForm(false);
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
            <span className="active">Research</span>
          </div>
        </div>

        {publications.map((pub, index) => (
          <div key={index} className="course-card">
            <p>{pub.title} ({pub.publicationType}) - {pub.journalName}</p>
          </div>
        ))}

        {showPublicationForm && (
          <div className="course-card">
            {/* Publication Form Fields */}
            <div className="yar-form-group"><label className="course-label">Publication Type *</label>
              <select className="course-form-input" value={newPublication.publicationType} onChange={(e) => handlePublicationChange('publicationType', e.target.value)}>
                <option value="Journal">Journal</option>
                <option value="Conference">Conference</option>
                <option value="Book">Book</option>
                <option value="Book Chapter">Book Chapter</option>
                <option value="Report">Report</option>
              </select>
            </div>
            <div className="yar-form-group"><label className="course-label">Title *</label>
              <input className="course-form-input" value={newPublication.title} onChange={(e) => handlePublicationChange('title', e.target.value)} />
            </div>
            <div className="yar-form-group"><label className="course-label">Status *</label>
              <select className="course-form-input" value={newPublication.status} onChange={(e) => handlePublicationChange('status', e.target.value)}>
                <option value="Under Review">Under Review</option>
                <option value="In Preparation">In Preparation</option>
                <option value="Revise and Resubmit">Revise and Resubmit</option>
              </select>
            </div>
            <div className="yar-form-group"><label className="course-label">Journal Name *</label>
              <input className="course-form-input" value={newPublication.journalName} onChange={(e) => handlePublicationChange('journalName', e.target.value)} />
            </div>
            <div className="yar-form-group"><label className="course-label">Publication Status *</label>
              <select className="course-form-input" value={newPublication.publicationStatus} onChange={(e) => handlePublicationChange('publicationStatus', e.target.value)}>
                <option value="In Progress">In Progress</option>
                <option value="Published">Published</option>
                <option value="Accepted">Accepted</option>
              </select>
            </div>
            <div className="yar-button-group">
              <button className="yar-button-secondary" onClick={() => setShowPublicationForm(false)}>Cancel</button>
              <button className="yar-button-primary" onClick={handleSavePublication}>Save</button>
            </div>
          </div>
        )}

        {showGrantForm && (
          <div className="course-card">
            {/* Grant Form Fields */}
            <div className="yar-form-group"><label>Client/Sponsor</label><input className="course-form-input" value={grant.client} onChange={e => handleGrantChange('client', e.target.value)} /></div>
            <div className="yar-form-group"><label>Title</label><input className="course-form-input" value={grant.title} onChange={e => handleGrantChange('title', e.target.value)} /></div>
            <div className="yar-form-group"><label>Grant/Contract #</label><input className="course-form-input" value={grant.contractNumber} onChange={e => handleGrantChange('contractNumber', e.target.value)} /></div>
            <div className="yar-form-group"><label>Role</label><input className="course-form-input" value={grant.role} onChange={e => handleGrantChange('role', e.target.value)} /></div>
            <div className="yar-form-group"><label>Amount of Award</label><input className="course-form-input" value={grant.totalAmount} onChange={e => handleGrantChange('totalAmount', e.target.value)} /></div>
            <div className="yar-form-group"><label>Amount Dedicated to You</label><input className="course-form-input" value={grant.yourShare} onChange={e => handleGrantChange('yourShare', e.target.value)} /></div>

            {/* Split Date Fields */}
            <div className="yar-form-group">
              <label>Start Date</label>
              <input type="date" className="course-form-input" value={grant.startDate} onChange={e => handleGrantChange('startDate', e.target.value)} />
            </div>
            <div className="yar-form-group">
              <label>End Date</label>
              <input type="date" className="course-form-input" value={grant.endDate} onChange={e => handleGrantChange('endDate', e.target.value)} />
            </div>

            {grant.coPIs.map((coPI, i) => (
              <div key={i} className="yar-form-group">
                <label>Co-PI Name</label>
                <input className="course-form-input" value={coPI.name} onChange={e => updateCoPI(i, 'name', e.target.value)} />
                <label>Affiliation</label>
                <input className="course-form-input" value={coPI.affiliation} onChange={e => updateCoPI(i, 'affiliation', e.target.value)} />
              </div>
            ))}
            <button onClick={addCoPI} className="yar-button-secondary">+ Add Co-PI</button>

            <div className="yar-form-group">
              <label>Additional Notes</label>
              <textarea className="course-form-input" value={grant.notes} onChange={e => handleGrantChange('notes', e.target.value)} />
            </div>

            <div className="yar-button-group">
              <button className="yar-button-secondary" onClick={() => setShowGrantForm(false)}>Cancel</button>
              <button className="yar-button-primary" onClick={handleSaveGrant}>Save</button>
            </div>
          </div>
        )}

        {/* Non Funded Research Form */}
        {showNonFundedResearchForm && (
          <div className="course-card">
            <h3>Non-Funded Research/Creative Work</h3>
            {/* Same content as the Grant form */}
            <div className="yar-form-group"><label>Client/Sponsor</label><input className="course-form-input" value={grant.client} onChange={e => handleGrantChange('client', e.target.value)} /></div>
            <div className="yar-form-group"><label>Title</label><input className="course-form-input" value={grant.title} onChange={e => handleGrantChange('title', e.target.value)} /></div>
            <div className="yar-form-group"><label>Grant/Contract #</label><input className="course-form-input" value={grant.contractNumber} onChange={e => handleGrantChange('contractNumber', e.target.value)} /></div>
            <div className="yar-form-group"><label>Role</label><input className="course-form-input" value={grant.role} onChange={e => handleGrantChange('role', e.target.value)} /></div>
            <div className="yar-form-group"><label>Amount of Award</label><input className="course-form-input" value={grant.totalAmount} onChange={e => handleGrantChange('totalAmount', e.target.value)} /></div>
            <div className="yar-form-group"><label>Amount Dedicated to You</label><input className="course-form-input" value={grant.yourShare} onChange={e => handleGrantChange('yourShare', e.target.value)} /></div>

            {/* Split Date Fields */}
            <div className="yar-form-group">
              <label>Start Date</label>
              <input type="date" className="course-form-input" value={grant.startDate} onChange={e => handleGrantChange('startDate', e.target.value)} />
            </div>
            <div className="yar-form-group">
              <label>End Date</label>
              <input type="date" className="course-form-input" value={grant.endDate} onChange={e => handleGrantChange('endDate', e.target.value)} />
            </div>

            {grant.coPIs.map((coPI, i) => (
              <div key={i} className="yar-form-group">
                <label>Co-PI Name</label>
                <input className="course-form-input" value={coPI.name} onChange={e => updateCoPI(i, 'name', e.target.value)} />
                <label>Affiliation</label>
                <input className="course-form-input" value={coPI.affiliation} onChange={e => updateCoPI(i, 'affiliation', e.target.value)} />
              </div>
            ))}
            <button onClick={addCoPI} className="yar-button-secondary">+ Add Co-PI</button>

            <div className="yar-form-group">
              <label>Additional Notes</label>
              <textarea className="course-form-input" value={grant.notes} onChange={e => handleGrantChange('notes', e.target.value)} />
            </div>

            <div className="yar-button-group">
              <button className="yar-button-secondary" onClick={() => setShowNonFundedResearchForm(false)}>Cancel</button>
              <button className="yar-button-primary" onClick={handleSaveNonFundedResearch}>Save</button>
            </div>
          </div>
        )}

        {/* Funded Research Form */}
        {showFundedResearchForm && (
          <div className="course-card">
            <h3>Funded Research/Creative Work</h3>
            {/* Same content as the Grant form */}
            <div className="yar-form-group"><label>Client/Sponsor</label><input className="course-form-input" value={grant.client} onChange={e => handleGrantChange('client', e.target.value)} /></div>
            <div className="yar-form-group"><label>Title</label><input className="course-form-input" value={grant.title} onChange={e => handleGrantChange('title', e.target.value)} /></div>
            <div className="yar-form-group"><label>Grant/Contract #</label><input className="course-form-input" value={grant.contractNumber} onChange={e => handleGrantChange('contractNumber', e.target.value)} /></div>
            <div className="yar-form-group"><label>Role</label><input className="course-form-input" value={grant.role} onChange={e => handleGrantChange('role', e.target.value)} /></div>
            <div className="yar-form-group"><label>Amount of Award</label><input className="course-form-input" value={grant.totalAmount} onChange={e => handleGrantChange('totalAmount', e.target.value)} /></div>
            <div className="yar-form-group"><label>Amount Dedicated to You</label><input className="course-form-input" value={grant.yourShare} onChange={e => handleGrantChange('yourShare', e.target.value)} /></div>

            {/* Split Date Fields */}
            <div className="yar-form-group">
              <label>Start Date</label>
              <input type="date" className="course-form-input" value={grant.startDate} onChange={e => handleGrantChange('startDate', e.target.value)} />
            </div>
            <div className="yar-form-group">
              <label>End Date</label>
              <input type="date" className="course-form-input" value={grant.endDate} onChange={e => handleGrantChange('endDate', e.target.value)} />
            </div>

            {grant.coPIs.map((coPI, i) => (
              <div key={i} className="yar-form-group">
                <label>Co-PI Name</label>
                <input className="course-form-input" value={coPI.name} onChange={e => updateCoPI(i, 'name', e.target.value)} />
                <label>Affiliation</label>
                <input className="course-form-input" value={coPI.affiliation} onChange={e => updateCoPI(i, 'affiliation', e.target.value)} />
              </div>
            ))}
            <button onClick={addCoPI} className="yar-button-secondary">+ Add Co-PI</button>

            <div className="yar-form-group">
              <label>Additional Notes</label>
              <textarea className="course-form-input" value={grant.notes} onChange={e => handleGrantChange('notes', e.target.value)} />
            </div>

            <div className="yar-button-group">
              <button className="yar-button-secondary" onClick={() => setShowFundedResearchForm(false)}>Cancel</button>
              <button className="yar-button-primary" onClick={handleSaveFundedResearch}>Save</button>
            </div>
          </div>
        )}

        {/* Other Funding Awards Form */}
        {showOtherFundingForm && (
          <div className="course-card">
            <h3>Other Funding Awards</h3>
            {/* Same content as the Grant form */}
            <div className="yar-form-group"><label>Client/Sponsor</label><input className="course-form-input" value={grant.client} onChange={e => handleGrantChange('client', e.target.value)} /></div>
            <div className="yar-form-group"><label>Title</label><input className="course-form-input" value={grant.title} onChange={e => handleGrantChange('title', e.target.value)} /></div>
            <div className="yar-form-group"><label>Grant/Contract #</label><input className="course-form-input" value={grant.contractNumber} onChange={e => handleGrantChange('contractNumber', e.target.value)} /></div>
            <div className="yar-form-group"><label>Role</label><input className="course-form-input" value={grant.role} onChange={e => handleGrantChange('role', e.target.value)} /></div>
            <div className="yar-form-group"><label>Amount of Award</label><input className="course-form-input" value={grant.totalAmount} onChange={e => handleGrantChange('totalAmount', e.target.value)} /></div>
            <div className="yar-form-group"><label>Amount Dedicated to You</label><input className="course-form-input" value={grant.yourShare} onChange={e => handleGrantChange('yourShare', e.target.value)} /></div>

            {/* Split Date Fields */}
            <div className="yar-form-group">
              <label>Start Date</label>
              <input type="date" className="course-form-input" value={grant.startDate} onChange={e => handleGrantChange('startDate', e.target.value)} />
            </div>
            <div className="yar-form-group">
              <label>End Date</label>
              <input type="date" className="course-form-input" value={grant.endDate} onChange={e => handleGrantChange('endDate', e.target.value)} />
            </div>

            {grant.coPIs.map((coPI, i) => (
              <div key={i} className="yar-form-group">
                <label>Co-PI Name</label>
                <input className="course-form-input" value={coPI.name} onChange={e => updateCoPI(i, 'name', e.target.value)} />
                <label>Affiliation</label>
                <input className="course-form-input" value={coPI.affiliation} onChange={e => updateCoPI(i, 'affiliation', e.target.value)} />
              </div>
            ))}
            <button onClick={addCoPI} className="yar-button-secondary">+ Add Co-PI</button>

            <div className="yar-form-group">
              <label>Additional Notes</label>
              <textarea className="course-form-input" value={grant.notes} onChange={e => handleGrantChange('notes', e.target.value)} />
            </div>

            <div className="yar-button-group">
              <button className="yar-button-secondary" onClick={() => setShowOtherFundingForm(false)}>Cancel</button>
              <button className="yar-button-primary" onClick={handleSaveOtherFunding}>Save</button>
            </div>
          </div>
        )}

        {/* Conference Participation Form */}
        {showConferenceForm && (
          <div className="course-card">
            <h3>Conference Participation</h3>
            {/* Same content as the Grant form */}
            <div className="yar-form-group"><label>Name</label><input className="course-form-input" value={grant.client} onChange={e => handleGrantChange('client', e.target.value)} /></div>


            {/* Split Date Fields */}
            <div className="yar-form-group">
              <label>Start Date</label>
              <input type="date" className="course-form-input" value={grant.startDate} onChange={e => handleGrantChange('startDate', e.target.value)} />
            </div>
            <div className="yar-form-group">
              <label>End Date</label>
              <input type="date" className="course-form-input" value={grant.endDate} onChange={e => handleGrantChange('endDate', e.target.value)} />
            </div>

            <div className="yar-form-group">
              <label>Additional Notes</label>
              <textarea className="course-form-input" value={grant.notes} onChange={e => handleGrantChange('notes', e.target.value)} />
            </div>

            <div className="yar-button-group">
              <button className="yar-button-secondary" onClick={() => setShowConferenceForm(false)}>Cancel</button>
              <button className="yar-button-primary" onClick={handleSaveConference}>Save</button>
            </div>
          </div>
        )}

        <AddResearchSection
          onAddPublication={() => setShowPublicationForm(true)}
          onAddGrant={() => setShowGrantForm(true)}
          onAddNonFundedResearch={() => setShowNonFundedResearchForm(true)}
          onAddFundedResearch={() => setShowFundedResearchForm(true)}
          onAddOtherFunding={() => setShowOtherFundingForm(true)}
          onAddConference={() => setShowConferenceForm(true)}
        />
        <div className="navigation-buttons">
          <button
            onClick={onPrevious}
            className="yar-button-secondary"
          >
            Previous
          </button>
          <button
            onClick={onNext}
            className="yar-button-next"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResearchForm;