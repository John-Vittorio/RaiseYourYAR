import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import ResumeNotification from './ResumeNotification';

const TeachingForm = ({ onNext, reportId }) => {
  const [courses, setCourses] = useState([]);
  const [originalCourses, setOriginalCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [isResuming, setIsResuming] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // New state for section notes
  const [sectionNotes, setSectionNotes] = useState('');
  const [originalSectionNotes, setOriginalSectionNotes] = useState('');

  const { currentUser } = useContext(AuthContext);

  // Fetch existing teaching data if available
  useEffect(() => {
    if (reportId) {
      fetchTeachingData();
    }
  }, [reportId]);

  // Set up auto-save whenever courses data changes
  useEffect(() => {
    // Only set up auto-save if we have courses and they're not the initial empty state
    if ((courses.length > 0 && JSON.stringify(courses) !== JSON.stringify(originalCourses)) ||
      (sectionNotes !== originalSectionNotes)) {
      // Clear any existing timer
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }

      // Set auto-save status to pending
      setAutoSaveStatus('pending');

      // Set a new timer for auto-save
      const timer = setTimeout(() => {
        autoSaveTeachingData();
      }, 3000); // Auto-save after 3 seconds of inactivity

      setAutoSaveTimer(timer);
    }

    // Clean up timer on component unmount
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [courses, sectionNotes]);

  const fetchTeachingData = async () => {
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
          `https://raiseyouryar-3.onrender.com/api/teaching/${reportId}`,
          config
        );

        if (data) {
          if (data.courses && data.courses.length > 0) {
            // Map API data to component state format
            const mappedCourses = data.courses.map((course, index) => ({
              id: index + 1,
              name: course.name || '',
              credits: course.credits || '0',
              enrollment: course.enrollment || '0',
              studentCreditHours: course.studentCreditHours || '0',
              evaluationScore: course.evaluationScore || '',
              adjustedEvaluationScore: course.adjustedEvaluationScore || '',
              commEngaged: course.commEngaged || false,
              updatedCourse: course.updatedCourse || false,
              outsideDept: course.outsideDept || false,
              notes: course.notes || '',
              quarter: course.quarter || 'Autumn',
              year: course.year || new Date().getFullYear()
            }));

            setCourses(mappedCourses);
            setOriginalCourses(JSON.parse(JSON.stringify(mappedCourses)));
            
            // If we found existing data, this is a resumed draft
            if (mappedCourses.length > 0) {
              setIsResuming(true);
            }
          }

          // Load section notes if present
          if (data.sectionNotes) {
            setSectionNotes(data.sectionNotes);
            setOriginalSectionNotes(data.sectionNotes);
          }
        }
      } catch (error) {
        // If 404, it means no teaching data exists yet, which is fine
        if (error.response?.status !== 404) {
          setError(error.response?.data?.message || 'Failed to fetch teaching data');
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch teaching data');
    } finally {
      setLoading(false);
    }
  };

  // Auto-save functionality
  const autoSaveTeachingData = async () => {
    try {
      // Format courses for API
      const apiCourses = courses.map(course => ({
        name: course.name.trim() || "Untitled Course",
        credits: Number(course.credits) || 0,
        enrollment: Number(course.enrollment) || 0,
        studentCreditHours: Number(course.studentCreditHours) || 0,
        evaluationScore: course.evaluationScore,
        adjustedEvaluationScore: course.adjustedEvaluationScore,
        commEngaged: course.commEngaged || false,
        updatedCourse: course.updatedCourse || false,
        outsideDept: course.outsideDept || false,
        notes: course.notes,
        quarter: course.quarter || 'Autumn',
        year: Number(course.year) || new Date().getFullYear()
      }));

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        }
      };

      await axios.post(
        `https://raiseyouryar-3.onrender.com/api/teaching/${reportId}`,
        {
          courses: apiCourses,
          taughtOutsideDept: apiCourses.some(course => course.outsideDept),
          sectionNotes: sectionNotes // Include section notes in the request
        },
        config
      );

      // Update original courses to match current state
      setOriginalCourses(JSON.parse(JSON.stringify(courses)));
      setOriginalSectionNotes(sectionNotes);
      setAutoSaveStatus('saved');

      // Clear auto-save status after 3 seconds
      setTimeout(() => {
        setAutoSaveStatus('');
      }, 3000);
    } catch (error) {
      console.error('Auto-save error:', error);
      setAutoSaveStatus('error');

      // Clear error status after 3 seconds
      setTimeout(() => {
        setAutoSaveStatus('');
      }, 3000);
    }
  };

  // Initialize original courses for cancel functionality
  useEffect(() => {
    setOriginalCourses(JSON.parse(JSON.stringify(courses)));
    setOriginalSectionNotes(sectionNotes);
  }, []);

  // Validate a single course
  const validateCourse = (course) => {
    const courseErrors = {};
    let isValid = true;

    if (!course.name.trim()) {
      courseErrors.name = "Course name is required";
      isValid = false;
    }

    if (isNaN(Number(course.credits)) || Number(course.credits) < 0) {
      courseErrors.credits = "Credits must be a valid number";
      isValid = false;
    }

    if (isNaN(Number(course.enrollment)) || Number(course.enrollment) < 0) {
      courseErrors.enrollment = "Enrollment must be a valid number";
      isValid = false;
    }

    return { isValid, courseErrors };
  };

  // Save a single course to the database
  const handleSaveCourse = async (courseId) => {
    try {
      // Clear previous messages for this course
      setSuccessMessage(prev => ({ ...prev, [courseId]: '' }));
      setError('');

      // Find the course to save
      const courseToSave = courses.find(course => course.id === courseId);

      // Validate this course
      const { isValid, courseErrors } = validateCourse(courseToSave);

      if (!isValid) {
        setValidationErrors(prev => ({ ...prev, [courseId]: courseErrors }));
        return;
      }

      setLoading(true);

      // Format course for API
      const apiCourse = {
        name: courseToSave.name.trim() || "Untitled Course",
        credits: Number(courseToSave.credits) || 0,
        enrollment: Number(courseToSave.enrollment) || 0,
        studentCreditHours: Number(courseToSave.studentCreditHours) || 0,
        evaluationScore: courseToSave.evaluationScore,
        adjustedEvaluationScore: courseToSave.adjustedEvaluationScore,
        commEngaged: courseToSave.commEngaged || false,
        updatedCourse: courseToSave.updatedCourse || false,
        outsideDept: courseToSave.outsideDept || false,
        notes: courseToSave.notes,
        quarter: courseToSave.quarter || 'Autumn',
        year: Number(courseToSave.year) || new Date().getFullYear(),
        reportId: reportId
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        }
      };

      // Send individual course to API
      const response = await axios.post(
        `https://raiseyouryar-3.onrender.com/api/teaching/course/${reportId}`,
        apiCourse,
        config
      );

      // Update original courses for cancel functionality
      setOriginalCourses(prev => {
        const updatedOriginals = [...prev];
        const index = updatedOriginals.findIndex(c => c.id === courseId);

        if (index !== -1) {
          updatedOriginals[index] = JSON.parse(JSON.stringify(courseToSave));
        } else {
          updatedOriginals.push(JSON.parse(JSON.stringify(courseToSave)));
        }

        return updatedOriginals;
      });

      // Set success message for this specific course
      setSuccessMessage(prev => ({ ...prev, [courseId]: 'Course saved successfully!' }));

    } catch (error) {
      console.error('Error saving course:', error);

      if (error.response?.data?.errors) {
        setError(`Validation failed: ${error.response.data.errors.join(', ')}`);
      } else {
        setError(error.response?.data?.message || 'Failed to save course');
      }
    } finally {
      setLoading(false);
    }
  };

  // Remove a course
  const handleCancelCourse = (courseId) => {
    // Remove the course entirely
    setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));

    // Remove this course from originalCourses too
    setOriginalCourses(prev => prev.filter(course => course.id !== courseId));

    // Clear any validation errors for this course
    if (validationErrors[courseId]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[courseId];
        return updated;
      });
    }

    // Clear success message for this course
    setSuccessMessage(prev => {
      const updated = { ...prev };
      delete updated[courseId];
      return updated;
    });
  };

  // Handle radio button changes for courses
  const handleRadioChange = (courseId, field, value) => {
    setCourses(prevCourses =>
      prevCourses.map(course =>
        course.id === courseId ? { ...course, [field]: value } : course
      )
    );
  };

  // Handle input changes for course fields
  const handleCourseFieldChange = (courseId, field, value) => {
    setCourses(prevCourses =>
      prevCourses.map(course =>
        course.id === courseId ? { ...course, [field]: value } : course
      )
    );

    // If credits or enrollment changed, recalculate student credit hours
    if ((field === 'credits' || field === 'enrollment')) {
      setCourses(prevCourses =>
        prevCourses.map(course => {
          if (course.id === courseId) {
            const credits = field === 'credits' ? value : course.credits;
            const enrollment = field === 'enrollment' ? value : course.enrollment;

            // Only recalculate if both values are present and valid numbers
            if (credits && enrollment && !isNaN(credits) && !isNaN(enrollment)) {
              return {
                ...course,
                [field]: value,
                studentCreditHours: credits * enrollment
              };
            }
            return {
              ...course,
              [field]: value
            };
          }
          return course;
        })
      );
    }

    // Clear validation error for this field if it exists
    if (validationErrors[courseId]?.[field]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        if (updated[courseId]) {
          delete updated[courseId][field];
          if (Object.keys(updated[courseId]).length === 0) {
            delete updated[courseId];
          }
        }
        return updated;
      });
    }
  };

  // Handle section notes change
  const handleSectionNotesChange = (e) => {
    setSectionNotes(e.target.value);
  };

  // Generate unique ID for new courses
  const generateUniqueId = () => {
    const existingIds = courses.map(course => course.id);
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    return maxId + 1;
  };

  // Handle adding new course
  const handleAddCourse = () => {
    const newCourse = {
      id: generateUniqueId(),
      name: '',
      credits: '0',
      enrollment: '0',
      studentCreditHours: '0',
      evaluationScore: '',
      adjustedEvaluationScore: '',
      commEngaged: false,
      updatedCourse: false,
      outsideDept: false,
      notes: '',
      quarter: 'Autumn',
      year: new Date().getFullYear()
    };

    setCourses(prev => [...prev, newCourse]);
  };

  // Handle navigating to research section
  const handleNext = async () => {
    if (isNavigating) return; // Prevent double clicks
    
    try {
      setIsNavigating(true);
      console.log("TeachingForm: Next button clicked - saving and proceeding to Research");
      
      // If there are any unsaved changes, save them before proceeding
      if (JSON.stringify(courses) !== JSON.stringify(originalCourses) ||
        sectionNotes !== originalSectionNotes) {
        await autoSaveTeachingData();
      }

      // Wait a short moment before triggering navigation
      setTimeout(() => {
        // Call the parent's onNext function to navigate to research
        console.log("TeachingForm: Calling parent onNext to navigate to research");
        onNext(); 
      }, 100);
      
    } catch (error) {
      console.error("TeachingForm: Error during navigation:", error);
      setError('Failed to save your data before proceeding. Please try again.');
      setIsNavigating(false);
    }
  };

  if (loading && courses.length === 0) {
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
            <span className="active">Teaching</span>
            <span className="separator">›</span>
            <span className="inactive">Research</span>
            <span className="separator">›</span>
            <span className="inactive">Service</span>
            <span className="separator">›</span>
            <span className="inactive">General Notes</span>
            <span className="separator">›</span>
            <span className="inactive">Review</span>
          </div>


          {/* Auto-save status indicator */}
          {autoSaveStatus && (
            <div className={`auto-save-status ${autoSaveStatus}`}>
              {autoSaveStatus === 'pending' && 'Saving...'}
              {autoSaveStatus === 'saved' && 'Changes saved'}
              {autoSaveStatus === 'error' && 'Error saving changes'}
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Section Notes */}
        <div className="course-card">
          <h3 className="course-title">Teaching Section Notes</h3>
          <p className="notes-instruction">
            For committees for which you are not a chair, please add that in the service section, under thesis service (under drop-down), thesis/dissertation committee member.
          </p>
          <div className="yar-form-group">
            <textarea
              className="course-notes"
              rows="6"
              value={sectionNotes}
              onChange={handleSectionNotesChange}
              placeholder="Enter any additional notes about your teaching activities here..."
              style={{ width: '100%', padding: '12px', marginTop: '15px' }}
            ></textarea>
          </div>
        </div>

        {/* Course Listings */}
        {courses.map((course, index) => (
          <div key={course.id} className="course-card">
            <div className="course-header">
              <input
                type="text"
                value={course.name}
                onChange={(e) => handleCourseFieldChange(course.id, 'name', e.target.value)}
                className={`course-title-input ${validationErrors[course.id]?.name ? 'input-error' : ''}`}
                placeholder="Enter course name (e.g., URBAN 400 - Advanced Urban Planning)"
              />

              {validationErrors[course.id]?.name && (
                <div className="field-error">{validationErrors[course.id].name}</div>
              )}
            </div>

            <div className="course-grid">
              <div className="course-field">
                <label className="course-label">Credits:</label>
                <input
                  type="number"
                  value={course.credits}
                  onChange={(e) => handleCourseFieldChange(course.id, 'credits', e.target.value)}
                  className={`course-form-input ${validationErrors[course.id]?.credits ? 'input-error' : ''}`}
                  placeholder="Enter credits"
                  min="0"
                />
                {validationErrors[course.id]?.credits && (
                  <div className="field-error">{validationErrors[course.id].credits}</div>
                )}
              </div>

              <div className="course-field">
                <label className="course-label">Enrollment:</label>
                <input
                  type="number"
                  value={course.enrollment}
                  onChange={(e) => handleCourseFieldChange(course.id, 'enrollment', e.target.value)}
                  className={`course-form-input ${validationErrors[course.id]?.enrollment ? 'input-error' : ''}`}
                  placeholder="Enter enrollment"
                  min="0"
                />
                {validationErrors[course.id]?.enrollment && (
                  <div className="field-error">{validationErrors[course.id].enrollment}</div>
                )}
              </div>

              <div className="course-field">
                <label className="course-label">Student Credit Hours:</label>
                <input
                  type="number"
                  value={course.studentCreditHours}
                  onChange={(e) => handleCourseFieldChange(course.id, 'studentCreditHours', e.target.value)}
                  className="course-form-input"
                  placeholder="Auto-calculated from credits × enrollment"
                  readOnly
                />
              </div>

              <div className="course-field">
                <label className="course-label">Course Evaluations Score:</label>
                <input
                  type="text"
                  value={course.evaluationScore}
                  onChange={(e) => handleCourseFieldChange(course.id, 'evaluationScore', e.target.value)}
                  className="course-form-input"
                  placeholder="e.g., 3.4 (67%)"
                />
              </div>

              <div className="course-field">
                <label className="course-label">Adjusted Evaluation Score:</label>
                <input
                  type="text"
                  value={course.adjustedEvaluationScore}
                  onChange={(e) => handleCourseFieldChange(course.id, 'adjustedEvaluationScore', e.target.value)}
                  className="course-form-input"
                  placeholder="e.g., 4.1 (82%)"
                />
              </div>

              <div className="course-field">
                <label className="course-label">Quarter:</label>
                <select
                  value={course.quarter}
                  onChange={(e) => handleCourseFieldChange(course.id, 'quarter', e.target.value)}
                  className="course-form-input"
                >
                  <option value="Autumn">Autumn</option>
                  <option value="Winter">Winter</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>

              <div className="course-field">
                <label className="course-label">Year:</label>
                <input
                  type="number"
                  value={course.year}
                  onChange={(e) => handleCourseFieldChange(course.id, 'year', e.target.value)}
                  className="course-form-input"
                  placeholder="Enter year"
                />
              </div>
            </div>

            <div className="course-radio-group">
              <p className="course-radio-question">Did this course have Community - Engaged Pedagogy?</p>
              <div className="course-radio-options">
                <label className="course-radio-label">
                  <input
                    type="radio"
                    name={`commEngaged-${course.id}`}
                    checked={course.commEngaged === true}
                    onChange={() => handleRadioChange(course.id, 'commEngaged', true)}
                    className="course-radio"
                  />
                  <span>Yes</span>
                </label>
                <label className="course-radio-label">
                  <input
                    type="radio"
                    name={`commEngaged-${course.id}`}
                    checked={course.commEngaged === false}
                    onChange={() => handleRadioChange(course.id, 'commEngaged', false)}
                    className="course-radio"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            <div className="course-radio-group">
              <p className="course-radio-question">Did you make significant course updates/changes?</p>
              <div className="course-radio-options">
                <label className="course-radio-label">
                  <input
                    type="radio"
                    name={`updatedCourse-${course.id}`}
                    checked={course.updatedCourse === true}
                    onChange={() => handleRadioChange(course.id, 'updatedCourse', true)}
                    className="course-radio"
                  />
                  <span>Yes</span>
                </label>
                <label className="course-radio-label">
                  <input
                    type="radio"
                    name={`updatedCourse-${course.id}`}
                    checked={course.updatedCourse === false}
                    onChange={() => handleRadioChange(course.id, 'updatedCourse', false)}
                    className="course-radio"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            {/* Added outside department question inside each course card */}
            <div className="course-radio-group">
              <p className="course-radio-question">
                Is this course outside of the Department of Urban Design and Planning?
                <span className="required-indicator">*</span>
              </p>
              <div className="course-radio-options">
                <label className="course-radio-label">
                  <input
                    type="radio"
                    name={`outsideDept-${course.id}`}
                    checked={course.outsideDept === true}
                    onChange={() => handleRadioChange(course.id, 'outsideDept', true)}
                    className="course-radio"
                  />
                  <span>Yes</span>
                </label>
                <label className="course-radio-label">
                  <input
                    type="radio"
                    name={`outsideDept-${course.id}`}
                    checked={course.outsideDept === false}
                    onChange={() => handleRadioChange(course.id, 'outsideDept', false)}
                    className="course-radio"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            <div className="course-field" style={{ gridColumn: 'span 2' }}>
              <label className="course-label">Notes:</label>
              <textarea
                value={course.notes}
                onChange={(e) => handleCourseFieldChange(course.id, 'notes', e.target.value)}
                rows="4"
                className="course-notes"
                placeholder="Enter any additional notes about this course"
                style={{ width: '100%', padding: '8px' }}
              ></textarea>
            </div>

            {/* Course action buttons */}
            <div className="course-actions">
              {successMessage[course.id] && (
                <div className="success-message course-success">{successMessage[course.id]}</div>
              )}
              <div className="course-buttons">
                <button
                  onClick={() => handleCancelCourse(course.id)}
                  className="yar-button-secondary course-button"
                >
                  Remove
                </button>
                <button
                  onClick={() => {
                    // Reset to original values
                    const originalCourse = originalCourses.find(c => c.id === course.id);
                    if (originalCourse) {
                      setCourses(prevCourses =>
                        prevCourses.map(c =>
                          c.id === course.id ? JSON.parse(JSON.stringify(originalCourse)) : c
                        )
                      );
                    }
                    // Clear validation errors
                    if (validationErrors[course.id]) {
                      setValidationErrors(prev => {
                        const updated = { ...prev };
                        delete updated[course.id];
                        return updated;
                      });
                    }
                  }}
                  className="yar-button-secondary course-button"
                >
                  Reset
                </button>
                <button
                  onClick={() => handleSaveCourse(course.id)}
                  className="yar-button-primary course-button"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add course button div */}
        <div
          className="add-course-button-teaching"
          onClick={handleAddCourse}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B2E83" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span style={{ marginLeft: '8px', color: '#4B2E83' }}>Add course</span>
        </div>

        {/* Navigation Buttons */}
        <div className="navigation-buttons">
          <button className="yar-button-secondary" disabled>
            Previous
          </button>
          <button
            onClick={handleNext}
            className="yar-button-next"
            disabled={isNavigating || loading}
            id="to-research-button"
          >
            {isNavigating ? 'Moving to Research...' : 'Next: Research'} 
          </button>
        </div>
      </div>

      <style jsx>{`
        .notes-instruction {
          background-color: #f9f9ff;
          padding: 15px;
          border-left: 3px solid #4B2E83;
          border-radius: 4px;
          font-family: "Encode Sans";
          margin-top: 10px;
          line-height: 1.6;
          color: #555;
        }
        
        #to-research-button {
          position: relative;
          overflow: hidden;
        }
        
        #to-research-button:after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
          transform: translateX(-100%);
        }
        
        #to-research-button:hover:after {
          animation: shimmer 1.5s infinite;
        }
        
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default TeachingForm;