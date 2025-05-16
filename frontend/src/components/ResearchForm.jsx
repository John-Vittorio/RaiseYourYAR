import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import ResumeNotification from './ResumeNotification';

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

const ResearchForm = ({ onNext, onPrevious, reportId }) => {
  const [publications, setPublications] = useState([]);
  const [grants, setGrants] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [isResuming, setIsResuming] = useState(false);

  const [showPublicationForm, setShowPublicationForm] = useState(false);
  const [showGrantForm, setShowGrantForm] = useState(false);
  const [showNonFundedResearchForm, setShowNonFundedResearchForm] = useState(false);
  const [showFundedResearchForm, setShowFundedResearchForm] = useState(false);
  const [showOtherFundingForm, setShowOtherFundingForm] = useState(false);
  const [showConferenceForm, setShowConferenceForm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { currentUser } = useContext(AuthContext);

  const [newPublication, setNewPublication] = useState({
    publicationType: 'Journal Article',
    title: '',
    journalName: '',
    publicationStatus: 'In Progress'
  });

  const [grant, setGrant] = useState({
    type: 'Grant',
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

  const [conference, setConference] = useState({
    name: '',
    startDate: '',
    endDate: '',
    notes: ''
  });

  // Fetch existing research data if available
  useEffect(() => {
    if (reportId) {
      fetchResearchData();
    }
  }, [reportId]);

  const fetchResearchData = async () => {
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
          `https://raiseyouryar-3.onrender.com/api/research/${reportId}`,
          config
        );

        if (data) {
          if (data.publications) {
            setPublications(data.publications);
          }

          if (data.grants) {
            setGrants(data.grants);
          }

          if (data.conferences) {
            setConferences(data.conferences);
          }
          
          // If we have any data, this is a resumed draft
          if (
            (data.publications && data.publications.length > 0) || 
            (data.grants && data.grants.length > 0) || 
            (data.conferences && data.conferences.length > 0)
          ) {
            setIsResuming(true);
          }
        }
      } catch (error) {
        // If 404, it means no research data exists yet, which is fine
        if (error.response?.status !== 404) {
          setError(error.response?.data?.message || 'Failed to fetch research data');
          console.error('Error fetching research data:', error);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch research data');
      console.error('Error fetching research data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generic function to save research data to the database
  const saveResearchData = async (updatedPublications = publications, updatedGrants = grants, updatedConferences = conferences) => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        }
      };

      await axios.post(
        `https://raiseyouryar-3.onrender.com/api/research/${reportId}`,
        {
          publications: updatedPublications,
          grants: updatedGrants,
          conferences: updatedConferences,
          reportId: reportId
        },
        config
      );

      setSuccessMessage('Research data saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000); // Clear success message after 3 seconds
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save research data');
      console.error('Error saving research data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save research data and proceed to next section
  const handleSaveAndNext = async () => {
    await saveResearchData();
    
    // Only proceed to next if save was successful
    if (!error) {
      onNext();
    }
  };

  const handlePublicationChange = (field, value) => {
    setNewPublication(prev => ({ ...prev, [field]: value }));
  };

  const handleGrantChange = (field, value) => {
    setGrant(prev => ({ ...prev, [field]: value }));
  };

  const handleConferenceChange = (field, value) => {
    setConference(prev => ({ ...prev, [field]: value }));
  };

  const updateCoPI = (index, field, value) => {
    const updated = [...grant.coPIs];
    updated[index][field] = value;
    setGrant(prev => ({ ...prev, coPIs: updated }));
  };

  const addCoPI = () => {
    setGrant(prev => ({ ...prev, coPIs: [...prev.coPIs, { name: '', affiliation: '' }] }));
  };

  const handleSavePublication = async () => {
    const updatedPublications = [...publications, newPublication];
    setPublications(updatedPublications);
    
    await saveResearchData(updatedPublications, grants, conferences);
    
    if (!error) {
      setNewPublication({
        publicationType: 'Journal Article',
        title: '',
        journalName: '',
        publicationStatus: 'In Progress'
      });
      setShowPublicationForm(false);
    }
  };

  const handleSaveGrant = async () => {
    const updatedGrants = [...grants, grant];
    setGrants(updatedGrants);
    
    await saveResearchData(publications, updatedGrants, conferences);
    
    if (!error) {
      setGrant({
        type: 'Grant',
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
    }
  };

  const handleSaveNonFundedResearch = async () => {
    const nonFundedResearch = {
      ...grant,
      type: 'NonFundedResearch'
    };
    const updatedGrants = [...grants, nonFundedResearch];
    setGrants(updatedGrants);
    
    await saveResearchData(publications, updatedGrants, conferences);
    
    if (!error) {
      setGrant({
        type: 'Grant',
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
      setShowNonFundedResearchForm(false);
    }
  };

  const handleSaveFundedResearch = async () => {
    const fundedResearch = {
      ...grant,
      type: 'FundedResearch'
    };
    const updatedGrants = [...grants, fundedResearch];
    setGrants(updatedGrants);
    
    await saveResearchData(publications, updatedGrants, conferences);
    
    if (!error) {
      setGrant({
        type: 'Grant',
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
      setShowFundedResearchForm(false);
    }
  };

  const handleSaveOtherFunding = async () => {
    const otherFunding = {
      ...grant,
      type: 'OtherFunding'
    };
    const updatedGrants = [...grants, otherFunding];
    setGrants(updatedGrants);
    
    await saveResearchData(publications, updatedGrants, conferences);
    
    if (!error) {
      setGrant({
        type: 'Grant',
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
      setShowOtherFundingForm(false);
    }
  };

  const handleSaveConference = async () => {
    const updatedConferences = [...conferences, conference];
    setConferences(updatedConferences);
    
    await saveResearchData(publications, grants, updatedConferences);
    
    if (!error) {
      setConference({
        name: '',
        startDate: '',
        endDate: '',
        notes: ''
      });
      setShowConferenceForm(false);
    }
  };

  if (loading) {
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
            <span className="active">Research</span>
            <span className="separator">›</span>
            <span className="inactive">Service</span>
            <span className="separator">›</span>
            <span className="inactive">General Notes</span>
            <span className="separator">›</span>
            <span className="inactive">Review</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {/* Display saved publications */}
        {publications.map((pub, index) => (
          <div key={index} className="course-card">
            <h3>{pub.title} ({pub.publicationType})</h3>
            <p><strong>Journal/Conference/Publisher:</strong> {pub.journalName}</p>
            <p><strong>Publication Status:</strong> {pub.publicationStatus}</p>
          </div>
        ))}

        {/* Display saved grants */}
        {grants.map((g, index) => (
          <div key={index} className="course-card">
            <h3>{g.title} ({g.type})</h3>
            <p>Client/Sponsor: {g.client}</p>
            <p>Role: {g.role}</p>
            <p>Amount: ${g.totalAmount} (Your share: ${g.yourShare})</p>
            <p>Duration: {g.startDate ? new Date(g.startDate).toLocaleDateString() : 'N/A'} to {g.endDate ? new Date(g.endDate).toLocaleDateString() : 'N/A'}</p>
            {g.coPIs && g.coPIs.length > 0 && (
              <div>
                <p>Co-PIs:</p>
                <ul>
                  {g.coPIs.map((coPI, i) => (
                    <li key={i}>{coPI.name} ({coPI.affiliation})</li>
                  ))}
                </ul>
              </div>
            )}
            {g.notes && <p>Notes: {g.notes}</p>}
          </div>
        ))}

        {/* Display saved conferences */}
        {conferences.map((conf, index) => (
          <div key={index} className="course-card">
            <h3>{conf.name}</h3>
            <p>Duration: {conf.startDate ? new Date(conf.startDate).toLocaleDateString() : 'N/A'} to {conf.endDate ? new Date(conf.endDate).toLocaleDateString() : 'N/A'}</p>
            {conf.notes && <p>Notes: {conf.notes}</p>}
          </div>
        ))}

        {/* Publication Form */}
        {showPublicationForm && (
          <div className="course-card">
            <h3>Add Publication</h3>
            <div className="yar-form-group">
              <label className="course-label">Publication Type *</label>
              <select
                className="course-form-input"
                value={newPublication.publicationType}
                onChange={(e) => handlePublicationChange('publicationType', e.target.value)}
              >
                <option value="Journal Article">Journal Article</option>
                <option value="Conference Paper">Conference Paper</option>
                <option value="Book">Book</option>
                <option value="Edited Book">Edited Book</option>
                <option value="Book Chapter">Book Chapter</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="yar-form-group">
              <label className="course-label">Title *</label>
              <input
                className="course-form-input"
                value={newPublication.title}
                onChange={(e) => handlePublicationChange('title', e.target.value)}
              />
            </div>
            <div className="yar-form-group">
              <label className="course-label">Journal/Conference/Publisher Name *</label>
              <input
                className="course-form-input"
                value={newPublication.journalName}
                onChange={(e) => handlePublicationChange('journalName', e.target.value)}
              />
            </div>
            <div className="yar-form-group">
              <label className="course-label">Publication Status *</label>
              <select
                className="course-form-input"
                value={newPublication.publicationStatus}
                onChange={(e) => handlePublicationChange('publicationStatus', e.target.value)}
              >
                <option value="In Progress">In Progress</option>
                <option value="75%+ Completed">75%+ Completed</option>
                <option value="Under Review">Under Review</option>
                <option value="Revise and Resubmit">Revise and Resubmit</option>
                <option value="Accepted with Revisions">Accepted with Revisions</option>
                <option value="Published">Published</option>
              </select>
            </div>
            <div className="yar-button-group">
              <button className="yar-button-secondary" onClick={() => setShowPublicationForm(false)}>Cancel</button>
              <button className="yar-button-primary" onClick={handleSavePublication} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* Grant Form */}
        {showGrantForm && (
          <div className="course-card">
            <h3>Add Research Grant/Contract</h3>
            <div className="yar-form-group"><label>Client/Sponsor</label><input className="course-form-input" value={grant.client} onChange={e => handleGrantChange('client', e.target.value)} /></div>
            <div className="yar-form-group"><label>Title</label><input className="course-form-input" value={grant.title} onChange={e => handleGrantChange('title', e.target.value)} /></div>
            <div className="yar-form-group"><label>Grant/Contract #</label><input className="course-form-input" value={grant.contractNumber} onChange={e => handleGrantChange('contractNumber', e.target.value)} /></div>
            <div className="yar-form-group"><label>Role</label><input className="course-form-input" value={grant.role} onChange={e => handleGrantChange('role', e.target.value)} /></div>
            <div className="yar-form-group"><label>Amount of Award</label><input className="course-form-input" type="number" value={grant.totalAmount} onChange={e => handleGrantChange('totalAmount', e.target.value)} /></div>
            <div className="yar-form-group"><label>Amount Dedicated to You</label><input className="course-form-input" type="number" value={grant.yourShare} onChange={e => handleGrantChange('yourShare', e.target.value)} /></div>

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
            <button onClick={addCoPI} className="yar-button-secondary">Add Co-PI</button>

            <div className="yar-form-group">
              <label>Additional Notes</label>
              <textarea className="course-form-input" value={grant.notes} onChange={e => handleGrantChange('notes', e.target.value)} />
            </div>

            <div className="yar-button-group">
              <button className="yar-button-secondary" onClick={() => setShowGrantForm(false)}>Cancel</button>
              <button className="yar-button-primary" onClick={handleSaveGrant} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* Non-Funded Research Form */}
        {showNonFundedResearchForm && (
          <div className="course-card">
            <h3>Non-Funded Research/Creative Work</h3>
            <div className="yar-form-group"><label>Client/Sponsor</label><input className="course-form-input" value={grant.client} onChange={e => handleGrantChange('client', e.target.value)} /></div>
            <div className="yar-form-group"><label>Title</label><input className="course-form-input" value={grant.title} onChange={e => handleGrantChange('title', e.target.value)} /></div>
            <div className="yar-form-group"><label>Role</label><input className="course-form-input" value={grant.role} onChange={e => handleGrantChange('role', e.target.value)} /></div>

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
              <button className="yar-button-primary" onClick={handleSaveNonFundedResearch} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* Funded Research Form */}
        {showFundedResearchForm && (
          <div className="course-card">
            <h3>Funded Research/Creative Work</h3>
            <div className="yar-form-group"><label>Client/Sponsor</label><input className="course-form-input" value={grant.client} onChange={e => handleGrantChange('client', e.target.value)} /></div>
            <div className="yar-form-group"><label>Title</label><input className="course-form-input" value={grant.title} onChange={e => handleGrantChange('title', e.target.value)} /></div>
            <div className="yar-form-group"><label>Grant/Contract #</label><input className="course-form-input" value={grant.contractNumber} onChange={e => handleGrantChange('contractNumber', e.target.value)} /></div>
            <div className="yar-form-group"><label>Role</label><input className="course-form-input" value={grant.role} onChange={e => handleGrantChange('role', e.target.value)} /></div>
            <div className="yar-form-group"><label>Amount of Award</label><input className="course-form-input" type="number" value={grant.totalAmount} onChange={e => handleGrantChange('totalAmount', e.target.value)} /></div>
            <div className="yar-form-group"><label>Amount Dedicated to You</label><input className="course-form-input" type="number" value={grant.yourShare} onChange={e => handleGrantChange('yourShare', e.target.value)} /></div>

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
              <button className="yar-button-primary" onClick={handleSaveFundedResearch} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* Other Funding Form */}
        {showOtherFundingForm && (
          <div className="course-card">
            <h3>Other Funding Awards</h3>
            <div className="yar-form-group"><label>Client/Sponsor</label><input className="course-form-input" value={grant.client} onChange={e => handleGrantChange('client', e.target.value)} /></div>
            <div className="yar-form-group"><label>Title</label><input className="course-form-input" value={grant.title} onChange={e => handleGrantChange('title', e.target.value)} /></div>
            <div className="yar-form-group"><label>Grant/Contract #</label><input className="course-form-input" value={grant.contractNumber} onChange={e => handleGrantChange('contractNumber', e.target.value)} /></div>
            <div className="yar-form-group"><label>Role</label><input className="course-form-input" value={grant.role} onChange={e => handleGrantChange('role', e.target.value)} /></div>
            <div className="yar-form-group"><label>Amount of Award</label><input className="course-form-input" type="number" value={grant.totalAmount} onChange={e => handleGrantChange('totalAmount', e.target.value)} /></div>
            <div className="yar-form-group"><label>Amount Dedicated to You</label><input className="course-form-input" type="number" value={grant.yourShare} onChange={e => handleGrantChange('yourShare', e.target.value)} /></div>

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
              <button className="yar-button-primary" onClick={handleSaveOtherFunding} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* Conference Form */}
        {showConferenceForm && (
          <div className="course-card">
            <h3>Conference Participation</h3>
            <div className="yar-form-group"><label>Name</label><input className="course-form-input" value={conference.name} onChange={e => handleConferenceChange('name', e.target.value)} /></div>

            <div className="yar-form-group">
              <label>Start Date</label>
              <input type="date" className="course-form-input" value={conference.startDate} onChange={e => handleConferenceChange('startDate', e.target.value)} />
            </div>
            <div className="yar-form-group">
              <label>End Date</label>
              <input type="date" className="course-form-input" value={conference.endDate} onChange={e => handleConferenceChange('endDate', e.target.value)} />
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

        {/* Other Funding Form */}
        {showOtherFundingForm && (
          <div className="course-card">
            <h3>Other Funding Awards</h3>
            <div className="yar-form-group"><label>Client/Sponsor</label><input className="course-form-input" value={grant.client} onChange={e => handleGrantChange('client', e.target.value)} /></div>
            <div className="yar-form-group"><label>Title</label><input className="course-form-input" value={grant.title} onChange={e => handleGrantChange('title', e.target.value)} /></div>
            <div className="yar-form-group"><label>Grant/Contract #</label><input className="course-form-input" value={grant.contractNumber} onChange={e => handleGrantChange('contractNumber', e.target.value)} /></div>
            <div className="yar-form-group"><label>Role</label><input className="course-form-input" value={grant.role} onChange={e => handleGrantChange('role', e.target.value)} /></div>
            <div className="yar-form-group"><label>Amount of Award</label><input className="course-form-input" type="number" value={grant.totalAmount} onChange={e => handleGrantChange('totalAmount', e.target.value)} /></div>
            <div className="yar-form-group"><label>Amount Dedicated to You</label><input className="course-form-input" type="number" value={grant.yourShare} onChange={e => handleGrantChange('yourShare', e.target.value)} /></div>

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

        {/* Conference Form */}
        {showConferenceForm && (
          <div className="course-card">
            <h3>Conference Participation</h3>
            <div className="yar-form-group"><label>Name</label><input className="course-form-input" value={conference.name} onChange={e => handleConferenceChange('name', e.target.value)} /></div>

            <div className="yar-form-group">
              <label>Start Date</label>
              <input type="date" className="course-form-input" value={conference.startDate} onChange={e => handleConferenceChange('startDate', e.target.value)} />
            </div>
            <div className="yar-form-group">
              <label>End Date</label>
              <input type="date" className="course-form-input" value={conference.endDate} onChange={e => handleConferenceChange('endDate', e.target.value)} />
            </div>

            <div className="yar-form-group">
              <label>Additional Notes</label>
              <textarea className="course-form-input" value={conference.notes} onChange={e => handleConferenceChange('notes', e.target.value)} />
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
            disabled={loading}
          >
            Previous
          </button>
          <button
            onClick={handleSaveAndNext}
            className="yar-button-next"
            disabled={loading}
          >
            {loading ? '...' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResearchForm;