import React, { useState, useEffect } from 'react';
import { reportService } from '../services/api.service';

const TeachingForm = ({ onNext }) => {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [taughtOutsideDept, setTaughtOutsideDept] = useState(false);
  const [outsideDeptCourses, setOutsideDeptCourses] = useState('');
  const [newCourse, setNewCourse] = useState({
    name: '',
    credits: '',
    enrollment: '',
    studentCreditHours: '',
    evaluationScore: '',
    commEngaged: false,
    updatedCourse: false,
    notes: '',
    quarter: 'Autumn',
    year: new Date().getFullYear()
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentReport, setCurrentReport] = useState(null);

  // Load the current report from localStorage
  useEffect(() => {
    const reportData = localStorage.getItem('currentReport');
    if (reportData) {
      const report = JSON.parse(reportData);
      setCurrentReport(report);
      
      // If the report already has teaching data, load it
      if (report.teachingSection) {
        loadTeachingData(report._id);
      }
    }
  }, []);

  // Load existing teaching data if available
  const loadTeachingData = async (reportId) => {
    try {
      setLoading(true);
      const report = await reportService.getReport(reportId);
      
      if (report.teachingSection) {
        setCourses(report.teachingSection.courses || []);
        setTaughtOutsideDept(report.teachingSection.taughtOutsideDept || false);
        setOutsideDeptCourses(report.teachingSection.outsideDeptCourses || '');
      }
    } catch (err) {
      console.error('Error loading teaching data:', err);
      setError('Failed to load existing teaching data');
    } finally {
      setLoading(false);
    }
  };

  // Handle radio button changes for existing courses
  const handleRadioChange = (courseId, field, value) => {
    setCourses(prevCourses =>
      prevCourses.map(course =>
        course.id === courseId ? { ...course, [field]: value } : course
      )
    );
  };

  // Handle input changes for new course
  const handleNewCourseChange = (field, value) => {
    setNewCourse(prev => ({ ...prev, [field]: value }));
  };

  // Handle adding new course
  const handleAddCourse = () => {
    // Calculate student credit hours if not provided
    let studentCreditHours = newCourse.studentCreditHours;
    if (!studentCreditHours && newCourse.credits && newCourse.enrollment) {
      studentCreditHours = newCourse.credits * newCourse.enrollment;
    }

    // Create new course object with generated ID
    const courseToAdd = {
      ...newCourse,
      id: courses.length + 1,
      studentCreditHours: studentCreditHours || ''
    };

    // Add the new course to the courses array
    setCourses(prev => [...prev, courseToAdd]);

    // Reset the new course form
    setNewCourse({
      name: '',
      credits: '',
      enrollment: '',
      studentCreditHours: '',
      evaluationScore: '',
      commEngaged: false,
      updatedCourse: false,
      notes: '',
      quarter: 'Autumn',
      year: new Date().getFullYear()
    });

    // Hide the form
    setShowForm(false);
  };

  // Handle form submission when Next is clicked
  const handleNext = async () => {
    if (!currentReport) {
      setError('No active report found. Please start a new report.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare teaching data to submit
      const teachingData = {
        courses: courses.map(course => ({
          name: course.name,
          credits: course.credits,
          enrollment: course.enrollment,
          studentCreditHours: course.studentCreditHours,
          evaluationScore: course.evaluationScore,
          commEngaged: course.commEngaged,
          updatedCourse: course.updatedCourse,
          notes: course.notes,
          quarter: course.quarter || 'Autumn',
          year: course.year || new Date().getFullYear()
        })),
        taughtOutsideDept,
        outsideDeptCourses: taughtOutsideDept ? outsideDeptCourses : ''
      };

      // Submit teaching data to API
      await reportService.submitTeachingData(currentReport._id, teachingData);

      // Call onNext to move to research section
      onNext();
    } catch (err) {
      console.error('Error submitting teaching data:', err);
      setError('Failed to save teaching data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teaching-container">
      <div className="teaching-form-content">
        <div className="teaching-header">
          <h1 className="yar-title">Yearly Activity Report</h1>
          <div className="teaching-breadcrumb">
            <span className="inactive">Start</span>
            <span className="separator">›</span>
            <span className="active">Teaching</span>
          </div>
        </div>

        {loading && <div className="loading-indicator">Loading...</div>}
        {error && <div className="error-message">{error}</div>}

        {/* Course Listings */}
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <h3 className="course-title">{course.name}</h3>

            <div className="course-grid">
              <div className="course-field">
                <label className="course-label">Credits:</label>
                <div className="course-value">{course.credits}</div>
              </div>

              <div className="course-field">
                <label className="course-label">Enrollment:</label>
                <div className="course-value">{course.enrollment}</div>
              </div>

              <div className="course-field">
                <label className="course-label">Student Credit Hours:</label>
                <div className="course-value">{course.studentCreditHours}</div>
              </div>

              <div className="course-field">
                <label className="course-label">Course Evaluations Score:</label>
                <div className="course-value">{course.evaluationScore}</div>
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

            <div className="course-field" style={{ gridColumn: 'span 2' }}>
              <label className="course-label">Notes:</label>
              <textarea
                value={course.notes}
                readOnly
                rows="4"
                className="course-notes"
              ></textarea>
            </div>

          </div>
        ))}

        {/* Add Course Form */}
        {showForm ? (
          <div className="course-card">
            <h3 className="course-title">Add New Course</h3>

            <div className="yar-form-group">
              <label className="course-label">Course Name:</label>
              <input
                type="text"
                value={newCourse.name}
                onChange={(e) => handleNewCourseChange('name', e.target.value)}
                className="course-form-input"
                placeholder="e.g., URBAN 400 - Advanced Urban Planning"
              />
            </div>

            <div className="course-grid">
              <div className="course-field">
                <label className="course-label">Credits:</label>
                <input
                  type="number"
                  value={newCourse.credits}
                  onChange={(e) => handleNewCourseChange('credits', e.target.value)}
                  className="course-form-input"
                />
              </div>

              <div className="course-field">
                <label className="course-label">Enrollment:</label>
                <input
                  type="number"
                  value={newCourse.enrollment}
                  onChange={(e) => handleNewCourseChange('enrollment', e.target.value)}
                  className="course-form-input"
                />
              </div>

              <div className="course-field">
                <label className="course-label">Student Credit Hours:</label>
                <input
                  type="number"
                  value={newCourse.studentCreditHours}
                  onChange={(e) => handleNewCourseChange('studentCreditHours', e.target.value)}
                  className="course-form-input"
                  placeholder="Will calculate automatically if left empty"
                />
              </div>

              <div className="course-field">
                <label className="course-label">Course Evaluations Score:</label>
                <input
                  type="text"
                  value={newCourse.evaluationScore}
                  onChange={(e) => handleNewCourseChange('evaluationScore', e.target.value)}
                  className="course-form-input"
                  placeholder="e.g., 3.4 (67%)"
                />
              </div>
            </div>
            
            <div className="yar-form-group">
              <label className="course-label">Quarter:</label>
              <select
                value={newCourse.quarter}
                onChange={(e) => handleNewCourseChange('quarter', e.target.value)}
                className="course-form-input"
              >
                <option value="Autumn">Autumn</option>
                <option value="Winter">Winter</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
              </select>
            </div>
            
            <div className="yar-form-group">
              <label className="course-label">Year:</label>
              <input
                type="number"
                value={newCourse.year}
                onChange={(e) => handleNewCourseChange('year', e.target.value)}
                className="course-form-input"
              />
            </div>

            <div className="course-radio-group">
              <p className="course-radio-question">Did this course have Community - Engaged Pedagogy?</p>
              <div className="course-radio-options">
                <label className="course-radio-label">
                  <input
                    type="radio"
                    name="newCourseCommEngaged"
                    checked={newCourse.commEngaged === true}
                    onChange={() => handleNewCourseChange('commEngaged', true)}
                    className="course-radio"
                  />
                  <span>Yes</span>
                </label>
                <label className="course-radio-label">
                  <input
                    type="radio"
                    name="newCourseCommEngaged"
                    checked={newCourse.commEngaged === false}
                    onChange={() => handleNewCourseChange('commEngaged', false)}
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
                    name="newCourseUpdated"
                    checked={newCourse.updatedCourse === true}
                    onChange={() => handleNewCourseChange('updatedCourse', true)}
                    className="course-radio"
                  />
                  <span>Yes</span>
                </label>
                <label className="course-radio-label">
                  <input
                    type="radio"
                    name="newCourseUpdated"
                    checked={newCourse.updatedCourse === false}
                    onChange={() => handleNewCourseChange('updatedCourse', false)}
                    className="course-radio"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            <div className="yar-form-group">
              <label className="course-label">Notes:</label>
              <textarea
                value={newCourse.notes}
                onChange={(e) => handleNewCourseChange('notes', e.target.value)}
                rows="4"
                className="course-form-textarea"
                placeholder="Enter any notes about this course"
              ></textarea>
            </div>

            <div className="yar-button-group">
              <button
                onClick={() => setShowForm(false)}
                className="yar-button-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCourse}
                disabled={!newCourse.name || !newCourse.credits || !newCourse.enrollment}
                className="yar-button-primary"
                style={{
                  opacity: (!newCourse.name || !newCourse.credits || !newCourse.enrollment) ? 0.6 : 1
                }}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          // Add Course Button
          <div
            className="add-course-button"
            onClick={() => setShowForm(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B2E83" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add course</span>
          </div>
        )}

        {/* Outside Department Question */}
        <div className="outside-dept-question">
          <p className="outside-dept-label">
            Did you teach any course outside of the Department of Urban Design and Planning?
            <span className="required-indicator">*</span>
          </p>
          <div className="course-radio-options">
            <label className="course-radio-label">
              <input
                type="radio"
                name="outsideDept"
                checked={taughtOutsideDept === true}
                onChange={() => setTaughtOutsideDept(true)}
                className="course-radio"
              />
              <span>Yes</span>
            </label>
            <label className="course-radio-label">
              <input
                type="radio"
                name="outsideDept"
                checked={taughtOutsideDept === false}
                onChange={() => setTaughtOutsideDept(false)}
                className="course-radio"
              />
              <span>No</span>
            </label>
          </div>
        </div>
        
        {/* Conditional field for outside department courses */}
        {taughtOutsideDept && (
          <div className="yar-form-group">
            <label className="course-label">Please list courses taught outside the department:</label>
            <textarea
              value={outsideDeptCourses}
              onChange={(e) => setOutsideDeptCourses(e.target.value)}
              rows="4"
              className="course-form-textarea"
              placeholder="List courses taught in other departments"
            ></textarea>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="navigation-buttons">
          <button className="yar-button-secondary">
            Previous
          </button>
          <button
            onClick={handleNext}
            className="yar-button-next"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeachingForm;