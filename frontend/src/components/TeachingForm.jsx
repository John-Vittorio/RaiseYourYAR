import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const TeachingForm = ({ onNext, reportId }) => {
  const [courses, setCourses] = useState([]);
  const [taughtOutsideDept, setTaughtOutsideDept] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { currentUser } = useContext(AuthContext);

  // Fetch existing teaching data if available
  useEffect(() => {
    if (reportId) {
      fetchTeachingData();
    } else {
      // Initialize with a blank course if no existing data
      setCourses([{
        id: 1,
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
      }]);
    }
  }, [reportId]);

  const fetchTeachingData = async () => {
    try {
      setLoading(true);
      setError('');

      const config = {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      };

      // const { data } = await axios.get(
      //   `https://raiseyouryar-3.onrender.com/api/teaching/${reportId}`,
      //   config
      // );

      const { data } = await axios.get(
        `http://localhost:5001/api/teaching/${reportId}`,
        config
      );

      if (data && data.courses) {
        // Transform courses from API format to component format
        const formattedCourses = data.courses.map(course => ({
          id: course._id || Math.random().toString(36).substr(2, 9),
          name: course.name || '',
          credits: course.credits || '',
          enrollment: course.enrollment || '',
          studentCreditHours: course.studentCreditHours || '',
          evaluationScore: course.evaluationScore || '',
          commEngaged: course.commEngaged || false,
          updatedCourse: course.updatedCourse || false,
          notes: course.notes || '',
          quarter: course.quarter || 'Autumn',
          year: course.year || new Date().getFullYear()
        }));

        setCourses(formattedCourses);
      }
    } catch (error) {
      // If 404, it means no teaching data exists yet, which is fine
      if (error.response?.status !== 404) {
        setError(error.response?.data?.message || 'Failed to fetch teaching data');
        console.error('Error fetching teaching data:', error);
      }

      // Initialize with a blank course if no existing data or error
      setCourses([{
        id: 1,
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
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Save teaching data and proceed to next section
  const handleSaveAndNext = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      // Format courses for API
      const apiCourses = courses.map(course => ({
        name: course.name,
        credits: Number(course.credits),
        enrollment: Number(course.enrollment),
        studentCreditHours: Number(course.studentCreditHours),
        evaluationScore: course.evaluationScore,
        commEngaged: course.commEngaged,
        updatedCourse: course.updatedCourse,
        notes: course.notes,
        quarter: course.quarter || 'Autumn',
        year: Number(course.year) || new Date().getFullYear(),
        reportId: reportId
      }));

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        }
      };

      // await axios.post(
      //   `https://raiseyouryar-3.onrender.com/api/teaching/${reportId}`,
      //   { courses: apiCourses, taughtOutsideDept },
      //   config
      // );

      await axios.post(
        `http://localhost:5001/api/teaching/${reportId}`,
        { courses: apiCourses, taughtOutsideDept },
        config
      );

      setSuccessMessage('Teaching data saved successfully!');

      // Proceed to next section
      onNext();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save teaching data');
      console.error('Error saving teaching data:', error);
    } finally {
      setLoading(false);
    }
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
            if (credits && enrollment) {
              return {
                ...course,
                [field]: value,
                studentCreditHours: credits * enrollment
              };
            }
          }
          return course;
        })
      );
    }
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
      credits: '',
      enrollment: '',
      studentCreditHours: '',
      evaluationScore: '',
      commEngaged: false,
      updatedCourse: false,
      notes: '',
      quarter: 'Autumn',
      year: new Date().getFullYear()
    };

    setCourses(prev => [...prev, newCourse]);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

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

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {/* Course Listings */}
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <input
              type="text"
              value={course.name}
              onChange={(e) => handleCourseFieldChange(course.id, 'name', e.target.value)}
              className="course-title-input"
              placeholder="Enter course name (e.g., URBAN 400 - Advanced Urban Planning)"
            />

            <div className="course-grid">
              <div className="course-field">
                <label className="course-label">Credits:</label>
                <input
                  type="number"
                  value={course.credits}
                  onChange={(e) => handleCourseFieldChange(course.id, 'credits', e.target.value)}
                  className="course-form-input"
                  placeholder="Enter credits"
                />
              </div>

              <div className="course-field">
                <label className="course-label">Enrollment:</label>
                <input
                  type="number"
                  value={course.enrollment}
                  onChange={(e) => handleCourseFieldChange(course.id, 'enrollment', e.target.value)}
                  className="course-form-input"
                  placeholder="Enter enrollment"
                />
              </div>

              <div className="course-field">
                <label className="course-label">Student Credit Hours:</label>
                <input
                  type="number"
                  value={course.studentCreditHours}
                  onChange={(e) => handleCourseFieldChange(course.id, 'studentCreditHours', e.target.value)}
                  className="course-form-input"
                  placeholder="Auto-calculated from credits × enrollment"
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

        {/* Navigation Buttons */}
        <div className="navigation-buttons">
          <button className="yar-button-secondary" disabled>
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
    </div>
  );
};

export default TeachingForm;