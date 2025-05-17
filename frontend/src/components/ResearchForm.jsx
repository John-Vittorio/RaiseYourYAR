
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import ResumeNotification from './ResumeNotification';

const AddResearchSection = ({ onAddPublication, onAddGrant, onAddNonFundedResearch, onAddFundedResearch, onAddOtherFunding, onAddConference }) => {
  const actions = [
    { label: "Add Refereed Publication", onClick: onAddPublication },
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

  // Add states to track editing
  const [editingPublicationIndex, setEditingPublicationIndex] = useState(-1);
  const [editingGrantIndex, setEditingGrantIndex] = useState(-1);
  const [editingConferenceIndex, setEditingConferenceIndex] = useState(-1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { currentUser } = useContext(AuthContext);

  const [newPublication, setNewPublication] = useState({
    publicationType: 'Journal Article',
    title: '',
    journalName: '',
    publicationStatus: 'In Progress',
    coAuthors: [] // Change from [{ name: '', affiliation: '' }] to empty array
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

  // Add this useEffect to scroll to top when editing begins
  useEffect(() => {
    if (editingPublicationIndex !== -1 || editingGrantIndex !== -1 || editingConferenceIndex !== -1 ||
      showPublicationForm || showGrantForm || showNonFundedResearchForm ||
      showFundedResearchForm || showOtherFundingForm || showConferenceForm) {
      // Scroll to top of the page
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [editingPublicationIndex, editingGrantIndex, editingConferenceIndex,
    showPublicationForm, showGrantForm, showNonFundedResearchForm,
    showFundedResearchForm, showOtherFundingForm, showConferenceForm]);

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

  // Helper function to save research data to database
  const saveResearchData = async (updatedPublications, updatedGrants, updatedConferences) => {
    try {
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

      return true;
    } catch (error) {
      console.error('Error saving research data:', error);
      throw error;
    }
  };

  // Proceed to next section
  const handleSaveAndNext = () => {
    onNext();
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

  const updateCoAuthor = (index, field, value) => {
    const updatedCoAuthors = [...newPublication.coAuthors];
    updatedCoAuthors[index][field] = value;
    setNewPublication(prev => ({ ...prev, coAuthors: updatedCoAuthors }));
  };

  // Add a new co-author field
  const addCoAuthor = () => {
    setNewPublication(prev => ({
      ...prev,
      coAuthors: [...prev.coAuthors, { name: '', affiliation: '' }]
    }));
  };

  // Remove a co-author field
  const removeCoAuthor = (index) => {
    const updatedCoAuthors = newPublication.coAuthors.filter((_, i) => i !== index);
    setNewPublication(prev => ({ ...prev, coAuthors: updatedCoAuthors }));
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Handle editing publications
  const handleEditPublication = (index) => {
    setNewPublication(publications[index]);
    setEditingPublicationIndex(index);
    setShowPublicationForm(true);
    scrollToTop();
  };

  // Handle editing grants
  const handleEditGrant = (index) => {
    const grantToEdit = grants[index];
    setGrant(grantToEdit);
    setEditingGrantIndex(index);
    scrollToTop();

    // Show the appropriate form based on grant type
    switch (grantToEdit.type) {
      case 'Grant':
        setShowGrantForm(true);
        break;
      case 'NonFundedResearch':
        setShowNonFundedResearchForm(true);
        break;
      case 'FundedResearch':
        setShowFundedResearchForm(true);
        break;
      case 'OtherFunding':
        setShowOtherFundingForm(true);
        break;
      default:
        setShowGrantForm(true);
    }
    scrollToTop();
  };

  // Handle editing conferences
  const handleEditConference = (index) => {
    setConference(conferences[index]);
    setEditingConferenceIndex(index);
    setShowConferenceForm(true);
    scrollToTop();
  };

  const handleSavePublication = async () => {
    try {
      setLoading(true);
      setError('');

      let updatedPublications;
      if (editingPublicationIndex >= 0) {
        // Update existing publication
        updatedPublications = [...publications];
        updatedPublications[editingPublicationIndex] = newPublication;
      } else {
        // Add new publication
        updatedPublications = [...publications, newPublication];
      }

      await saveResearchData(updatedPublications, grants, conferences);

      setPublications(updatedPublications);
      setNewPublication({
        publicationType: 'Journal Article',
        title: '',
        journalName: '',
        publicationStatus: 'In Progress'
      });
      setShowPublicationForm(false);
      setEditingPublicationIndex(-1);
      setSuccessMessage(editingPublicationIndex >= 0 ? 'Publication updated successfully!' : 'Publication saved successfully!');

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save publication');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGrant = async () => {
    try {
      setLoading(true);
      setError('');

      let updatedGrants;
      if (editingGrantIndex >= 0) {
        // Update existing grant
        updatedGrants = [...grants];
        updatedGrants[editingGrantIndex] = grant;
      } else {
        // Add new grant
        updatedGrants = [...grants, grant];
      }

      await saveResearchData(publications, updatedGrants, conferences);

      setGrants(updatedGrants);
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
      setEditingGrantIndex(-1);
      setSuccessMessage(editingGrantIndex >= 0 ? 'Grant updated successfully!' : 'Grant saved successfully!');

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save grant');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNonFundedResearch = async () => {
    try {
      setLoading(true);
      setError('');

      const nonFundedResearch = {
        ...grant,
        type: 'NonFundedResearch'
      };

      let updatedGrants;
      if (editingGrantIndex >= 0) {
        // Update existing non-funded research
        updatedGrants = [...grants];
        updatedGrants[editingGrantIndex] = nonFundedResearch;
      } else {
        // Add new non-funded research
        updatedGrants = [...grants, nonFundedResearch];
      }

      await saveResearchData(publications, updatedGrants, conferences);

      setGrants(updatedGrants);
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
      setEditingGrantIndex(-1);
      setSuccessMessage(editingGrantIndex >= 0 ? 'Non-funded research updated successfully!' : 'Non-funded research saved successfully!');

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save non-funded research');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFundedResearch = async () => {
    try {
      setLoading(true);
      setError('');

      const fundedResearch = {
        ...grant,
        type: 'FundedResearch'
      };

      let updatedGrants;
      if (editingGrantIndex >= 0) {
        // Update existing funded research
        updatedGrants = [...grants];
        updatedGrants[editingGrantIndex] = fundedResearch;
      } else {
        // Add new funded research
        updatedGrants = [...grants, fundedResearch];
      }

      await saveResearchData(publications, updatedGrants, conferences);

      setGrants(updatedGrants);
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
      setEditingGrantIndex(-1);
      setSuccessMessage(editingGrantIndex >= 0 ? 'Funded research updated successfully!' : 'Funded research saved successfully!');

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save funded research');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOtherFunding = async () => {
    try {
      setLoading(true);
      setError('');

      const otherFunding = {
        ...grant,
        type: 'OtherFunding'
      };

      let updatedGrants;
      if (editingGrantIndex >= 0) {
        // Update existing other funding
        updatedGrants = [...grants];
        updatedGrants[editingGrantIndex] = otherFunding;
      } else {
        // Add new other funding
        updatedGrants = [...grants, otherFunding];
      }

      await saveResearchData(publications, updatedGrants, conferences);

      setGrants(updatedGrants);
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
      setEditingGrantIndex(-1);
      setSuccessMessage(editingGrantIndex >= 0 ? 'Other funding updated successfully!' : 'Other funding saved successfully!');

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save other funding');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConference = async () => {
    try {
      setLoading(true);
      setError('');

      let updatedConferences;
      if (editingConferenceIndex >= 0) {
        // Update existing conference
        updatedConferences = [...conferences];
        updatedConferences[editingConferenceIndex] = conference;
      } else {
        // Add new conference
        updatedConferences = [...conferences, conference];
      }

      await saveResearchData(publications, grants, updatedConferences);

      setConferences(updatedConferences);
      setConference({
        name: '',
        startDate: '',
        endDate: '',
        notes: ''
      });
      setShowConferenceForm(false);
      setEditingConferenceIndex(-1);
      setSuccessMessage(editingConferenceIndex >= 0 ? 'Conference updated successfully!' : 'Conference saved successfully!');

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save conference');
    } finally {
      setLoading(false);
    }
  };

  // Add delete functions
  const handleDeletePublication = async (index) => {
    try {
      setLoading(true);
      setError('');

      const updatedPublications = publications.filter((_, i) => i !== index);
      await saveResearchData(updatedPublications, grants, conferences);

      setPublications(updatedPublications);
      setSuccessMessage('Publication deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete publication');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGrant = async (index) => {
    try {
      setLoading(true);
      setError('');

      const updatedGrants = grants.filter((_, i) => i !== index);
      await saveResearchData(publications, updatedGrants, conferences);

      setGrants(updatedGrants);
      setSuccessMessage('Grant deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete grant');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConference = async (index) => {
    try {
      setLoading(true);
      setError('');

      const updatedConferences = conferences.filter((_, i) => i !== index);
      await saveResearchData(publications, grants, updatedConferences);

      setConferences(updatedConferences);
      setSuccessMessage('Conference deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete conference');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format grant type for display
  const formatGrantType = (type) => {
    switch (type) {
      case 'Grant':
        return 'Research Grant / Contract';
      case 'NonFundedResearch':
        return 'Non-Funded Research';
      case 'FundedResearch':
        return 'Funded Research';
      case 'OtherFunding':
        return 'Other Funding';
      default:
        return type;
    }
  };

  // Cancel editing
  const handleCancelPublicationEdit = () => {
    setShowPublicationForm(false);
    setEditingPublicationIndex(-1);
    setNewPublication({
      publicationType: 'Journal Article',
      title: '',
      journalName: '',
      publicationStatus: 'In Progress',
      coAuthors: [] // Change to empty array
    });
  };

  const handleCancelGrantEdit = () => {
    setShowGrantForm(false);
    setShowNonFundedResearchForm(false);
    setShowFundedResearchForm(false);
    setShowOtherFundingForm(false);
    setEditingGrantIndex(-1);
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
  };

  const handleCancelConferenceEdit = () => {
    setShowConferenceForm(false);
    setEditingConferenceIndex(-1);
    setConference({
      name: '',
      startDate: '',
      endDate: '',
      notes: ''
    });
  };

  if (loading && !publications.length && !grants.length && !conferences.length) {
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
        <div className='teaching-header-wrapper'>
          <h2 className="teaching-section-header-two">Please add your research work under the respective categories</h2>
        </div>
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {/* Publication Form */}
        {showPublicationForm && (
          <div className="course-card">
            <div className="card-content">
              <h3>{editingPublicationIndex >= 0 ? 'Edit Publication' : 'Add Publication'}</h3>
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
                <label className="course-label">Journal / Conference / Publisher Name *</label>
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
                  <option value="75%+ Completed">75%+ Completed</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Revise and Resubmit">Revise and Resubmit</option>
                  <option value="Accepted with Revisions">Accepted with Revisions</option>
                  <option value="In Progress">In Production</option>
                  <option value="Published">Published</option>
                </select>
              </div>
              <div className="yar-form-group">
                {newPublication.coAuthors.length > 0 && (
                  newPublication.coAuthors.map((coAuthor, i) => (
                    <div key={i} className="co-author-row">
                      <div className="yar-form-group">
                        <label>Co-Author Name</label>
                        <input
                          className="course-form-input"
                          value={coAuthor.name}
                          onChange={e => updateCoAuthor(i, 'name', e.target.value)}
                        />
                      </div>
                      <div className="yar-form-group">
                        <label>Affiliation</label>
                        <input
                          className="course-form-input"
                          value={coAuthor.affiliation}
                          onChange={e => updateCoAuthor(i, 'affiliation', e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        className="remove-button"
                        onClick={() => removeCoAuthor(i)}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
                <button
                  type="button"
                  onClick={addCoAuthor}
                  className="yar-button-secondary"
                >
                  + Add Co-Author
                </button>
              </div>
            </div>
            <div className="yar-button-group">
              <button className="yar-button-secondary" onClick={handleCancelPublicationEdit}>Cancel</button>
              <button
                className="yar-button-primary"
                onClick={handleSavePublication}
                disabled={loading}
              >
                {loading ? 'Saving...' : editingPublicationIndex >= 0 ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* Grant Form */}
        {showGrantForm && (
          <div className="course-card">
            <h3>{editingGrantIndex >= 0 ? 'Edit Research Grant / Contract' : 'Add Research Grant / Contract'}</h3>
            <div className="yar-form-group">
              <label>Client / Sponsor</label>
              <input className="course-form-input" value={grant.client} onChange={e => handleGrantChange('client', e.target.value)} />
            </div>
            <div className="yar-form-group">
              <label>Title</label>
              <input className="course-form-input" value={grant.title} onChange={e => handleGrantChange('title', e.target.value)} />
            </div>
            <div className="yar-form-group">
              <label>Grant / Contract #</label>
              <input className="course-form-input" value={grant.contractNumber} onChange={e => handleGrantChange('contractNumber', e.target.value)} />
            </div>
            <div className="yar-form-group">
              <label>Role</label>
              <input className="course-form-input" value={grant.role} onChange={e => handleGrantChange('role', e.target.value)} />
            </div>
            <div className="yar-form-group">
              <label>Amount of Award</label>
              <input className="course-form-input" type="number" value={grant.totalAmount} onChange={e => handleGrantChange('totalAmount', e.target.value)} />
            </div>
            <div className="yar-form-group">
              <label>Amount Dedicated to You</label>
              <input className="course-form-input" type="number" value={grant.yourShare} onChange={e => handleGrantChange('yourShare', e.target.value)} />
            </div>

            <div className="yar-form-group">
              <label>Start Date</label>
              <input type="date" className="course-form-input" value={grant.startDate} onChange={e => handleGrantChange('startDate', e.target.value)} />
            </div>
            <div className="yar-form-group">
              <label>End Date</label>
              <input type="date" className="course-form-input" value={grant.endDate} onChange={e => handleGrantChange('endDate', e.target.value)} />
            </div>

            {grant.coPIs.map((coPI, i) => (
              <div key={i} className="co-pi-row">
                <div className="yar-form-group">
                  <label>Co-PI Name</label>
                  <input className="course-form-input" value={coPI.name} onChange={e => updateCoPI(i, 'name', e.target.value)} />
                </div>
                <div className="yar-form-group">
                  <label>Affiliation</label>
                  <input className="course-form-input" value={coPI.affiliation} onChange={e => updateCoPI(i, 'affiliation', e.target.value)} />
                </div>
              </div>
            ))}
            <button onClick={addCoPI} className="yar-button-secondary">+ Add Co-PI</button>

            <div className="yar-form-group">
              <label>Additional Notes</label>
              <textarea className="course-form-input" value={grant.notes} onChange={e => handleGrantChange('notes', e.target.value)} />
            </div>

            <div className="yar-button-group">
              <button className="yar-button-secondary" onClick={() => setShowGrantForm(false)}>Cancel</button>
              <button
                className="yar-button-primary"
                onClick={handleSaveGrant}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* Non-Funded Research Form */}
        {showNonFundedResearchForm && (
          <div className="course-card">
            <h3>Non-Funded Research / Creative Work</h3>
            <div className="yar-form-group">
              <label>Client / Sponsor</label>
              <input className="course-form-input" value={grant.client} onChange={e => handleGrantChange('client', e.target.value)} />
            </div>
            <div className="yar-form-group">
              <label>Title</label>
              <input className="course-form-input" value={grant.title} onChange={e => handleGrantChange('title', e.target.value)} />
            </div>
            <div className="yar-form-group">
              <label>Role</label>
              <input className="course-form-input" value={grant.role} onChange={e => handleGrantChange('role', e.target.value)} />
            </div>

            <div className="yar-form-group">
              <label>Start Date</label>
              <input type="date" className="course-form-input" value={grant.startDate} onChange={e => handleGrantChange('startDate', e.target.value)} />
            </div>
            <div className="yar-form-group">
              <label>End Date</label>
              <input type="date" className="course-form-input" value={grant.endDate} onChange={e => handleGrantChange('endDate', e.target.value)} />
            </div>

            {grant.coPIs.map((coPI, i) => (
              <div key={i} className="co-pi-row">
                <div className="yar-form-group">
                  <label>Co-PI Name</label>
                  <input className="course-form-input" value={coPI.name} onChange={e => updateCoPI(i, 'name', e.target.value)} />
                </div>
                <div className="yar-form-group">
                  <label>Affiliation</label>
                  <input className="course-form-input" value={coPI.affiliation} onChange={e => updateCoPI(i, 'affiliation', e.target.value)} />
                </div>
              </div>
            ))}
            <button onClick={addCoPI} className="yar-button-secondary">+ Add Co-PI</button>

            <div className="yar-form-group">
              <label>Additional Notes</label>
              <textarea className="course-form-input" value={grant.notes} onChange={e => handleGrantChange('notes', e.target.value)} />
            </div>

            <div className="yar-button-group">
              <button className="yar-button-secondary" onClick={() => setShowNonFundedResearchForm(false)}>Cancel</button>
              <button
                className="yar-button-primary"
                onClick={handleSaveNonFundedResearch}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* Funded Research Form */}
        {showFundedResearchForm && (
          <div className="course-card">
            <h3>Funded Research/Creative Work</h3>
            <div className="yar-form-group">
              <label>Client / Sponsor</label>
              <input className="course-form-input" value={grant.client} onChange={e => handleGrantChange('client', e.target.value)} />
            </div>
            <div className="yar-form-group">
              <label>Title</label>
              <input className="course-form-input" value={grant.title} onChange={e => handleGrantChange('title', e.target.value)} />
            </div>
            <div className="yar-form-group">
              <label>Grant / Contract #</label>
              <input className="course-form-input" value={grant.contractNumber} onChange={e => handleGrantChange('contractNumber', e.target.value)} />
            </div>
            <div className="yar-form-group">
              <label>Role</label>
              <input className="course-form-input" value={grant.role} onChange={e => handleGrantChange('role', e.target.value)} />
            </div>
            <div className="yar-form-group">
              <label>Amount of Award</label>
              <input className="course-form-input" type="number" value={grant.totalAmount} onChange={e => handleGrantChange('totalAmount', e.target.value)} />
            </div>
            <div className="yar-form-group">
              <label>Amount Dedicated to You</label>
              <input className="course-form-input" type="number" value={grant.yourShare} onChange={e => handleGrantChange('yourShare', e.target.value)} />
            </div>

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
            <div className="yar-form-group"><label>Client / Sponsor</label><input className="course-form-input" value={grant.client} onChange={e => handleGrantChange('client', e.target.value)} /></div>
            <div className="yar-form-group"><label>Title</label><input className="course-form-input" value={grant.title} onChange={e => handleGrantChange('title', e.target.value)} /></div>
            <div className="yar-form-group"><label>Grant / Contract #</label><input className="course-form-input" value={grant.contractNumber} onChange={e => handleGrantChange('contractNumber', e.target.value)} /></div>
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

            <div className="yar-form-group">
              <label>Additional Notes</label>
              <textarea className="course-form-input" value={conference.notes} onChange={e => handleConferenceChange('notes', e.target.value)} />
            </div>

            <div className="yar-button-group">
              <button className="yar-button-secondary" onClick={() => setShowConferenceForm(false)}>Cancel</button>
              <button className="yar-button-primary" onClick={handleSaveConference} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* Display saved publications */}
        {publications.map((pub, index) => (
          <div key={index} className="course-card">
            <div className="card-content">
              <h3>{pub.publicationType}</h3>
              <p><strong>Title:</strong> {pub.title || 'None'}</p>
              <p><strong>Journal/Conference/Publisher:</strong> {pub.journalName || 'None'}</p>
              <p><strong>Publication Status:</strong> {pub.publicationStatus || 'None'}</p>
              {pub.coAuthors && pub.coAuthors.length > 0 && pub.coAuthors.some(coAuthor => coAuthor.name) && (
                <p><strong>Co-Authors:</strong> {pub.coAuthors.filter(coAuthor => coAuthor.name).map((coAuthor, i) =>
                  `${coAuthor.name} (${coAuthor.affiliation || 'N/A'})`
                ).join(', ')}</p>
              )}
            </div>
            <div className="service-actions">
              <button
                className="yar-button-secondary edit-service"
                onClick={() => handleEditPublication(index)}
                disabled={loading}
              >
                Edit
              </button>
              <button
                className="yar-button-secondary delete-service"
                onClick={() => handleDeletePublication(index)}
                disabled={loading}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {/* Display saved grants */}
        {grants.map((g, index) => (
          <div key={index} className="course-card">
            <div className="card-header">
              <div>
                <h3>{formatGrantType(g.type)}</h3>
                <p><strong>Title:</strong> {g.title || 'None'}</p>
                <p><strong>Client / Sponsor:</strong> {g.client || 'None'}</p>
                {g.contractNumber && <p><strong>Grant / Contract #:</strong> {g.contractNumber}</p>}
                <p><strong>Role:</strong> {g.role || 'None'}</p>
                {(g.totalAmount || g.yourShare) && (
                  <p><strong>Amount:</strong> {g.totalAmount ? `${g.totalAmount}` : 'N/A'} {g.yourShare ? `(Your share: ${g.yourShare})` : ''}</p>
                )}
                <p><strong>Duration:</strong> {g.startDate ? new Date(g.startDate).toLocaleDateString() : 'N/A'} to {g.endDate ? new Date(g.endDate).toLocaleDateString() : 'N/A'}</p>
                {g.coPIs && g.coPIs.length > 0 && g.coPIs.some(coPI => coPI.name) && (
                  <p><strong>Co-PIs:</strong> {g.coPIs.filter(coPI => coPI.name).map((coPI, i) =>
                    `${coPI.name} (${coPI.affiliation || 'N/A'})`
                  ).join(', ')}</p>
                )}
                {g.notes && <p><strong>Notes:</strong> {g.notes}</p>}
              </div>
              <div className='service-actions'>
                <button
                  className="yar-button-secondary edit-service"
                  onClick={() => handleEditGrant(index)}
                  disabled={loading}
                >
                  Edit
                </button>
                <button
                  className="yar-button-secondary delete-service"
                  onClick={() => handleDeleteGrant(index)}
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Display saved conferences */}
        {conferences.map((conf, index) => (
          <div key={index} className="course-card">
            <div className="card-content">
              <h3>Conference Participation</h3>
              <p><strong>Name:</strong> {conf.name || 'None'}</p>
              <p><strong>Duration:</strong> {conf.startDate ? new Date(conf.startDate).toLocaleDateString() : 'N/A'} to {conf.endDate ? new Date(conf.endDate).toLocaleDateString() : 'N/A'}</p>
              {conf.notes && <p><strong>Notes:</strong> {conf.notes}</p>}
            </div>
            <div className="service-actions">
              <button
                className="yar-button-secondary edit-service"
                onClick={() => handleEditConference(index)}
                disabled={loading}
              >
                Edit
              </button>
              <button
                className="yar-button-secondary delete-service"
                onClick={() => handleDeleteConference(index)}
                disabled={loading}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
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

          /* Add this to your existing styles */
        .co-author-row {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
          align-items: flex-end;
          position: relative;
        }
        
        .co-author-row .yar-form-group {
          flex: 1;
          margin-bottom: 0;
        }
        
        .remove-button {
          background-color: #f8f8f8;
          border: 1px solid #e0e0e0;
          color: #d32f2f;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 13px;
          height: 39px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .remove-button:hover {
          background-color: #fbe9e7;
          border-color: #ffcdd2;
        }
      `}</style>
    </div>
  );
};

export default ResearchForm;
