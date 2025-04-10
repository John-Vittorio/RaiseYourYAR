import React, { useState } from 'react';

const TeachingForm = ({ onNext }) => {
  const [courses, setCourses] = useState([
    {
      id: 1,
      name: 'URBAN 200 - Intro to Urbanization',
      credits: 5,
      enrollment: 30,
      studentCreditHours: 150,
      evaluationScore: '3.4 (67%)',
      commEngaged: false,
      updatedCourse: false,
      notes: 'N/A'
    },
    {
      id: 2,
      name: 'URBAN 300 - Intro to Urban Planning',
      credits: 5,
      enrollment: 30,
      studentCreditHours: 150,
      evaluationScore: '3.4 (67%)',
      commEngaged: false,
      updatedCourse: false,
      notes: 'N/A'
    }
  ]);
  
  const [showForm, setShowForm] = useState(false);
  const [taughtOutsideDept, setTaughtOutsideDept] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: '',
    credits: '',
    enrollment: '',
    studentCreditHours: '',
    evaluationScore: '',
    commEngaged: false,
    updatedCourse: false,
    notes: ''
  });

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
      notes: ''
    });
    
    // Hide the form
    setShowForm(false);
  };

  return (
    <div style={{ padding: '20px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ 
          color: '#4B2E83', 
          fontSize: '32px',
          margin: 0,
          fontFamily: 'sans-serif'
        }}>
          Yearly Activity Report
        </h1>
        <div style={{ marginLeft: '20px', display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '10px', color: '#888' }}>Start</span>
          <span style={{ margin: '0 5px' }}>›</span>
          <span style={{ fontWeight: 'bold' }}>Teaching</span>
        </div>
      </div>

      {/* Course Listings */}
      {courses.map(course => (
        <div key={course.id} style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '15px', 
          border: '1px solid #eee',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>{course.name}</h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '10px',
            marginBottom: '15px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Credits:</label>
              <div style={{ 
                padding: '5px 10px', 
                border: '1px solid #ccc', 
                borderRadius: '5px', 
                backgroundColor: '#f9f9f9' 
              }}>{course.credits}</div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Enrollment:</label>
              <div style={{ 
                padding: '5px 10px', 
                border: '1px solid #ccc', 
                borderRadius: '5px', 
                backgroundColor: '#f9f9f9' 
              }}>{course.enrollment}</div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Student Credit Hours:</label>
              <div style={{ 
                padding: '5px 10px', 
                border: '1px solid #ccc', 
                borderRadius: '5px', 
                backgroundColor: '#f9f9f9' 
              }}>{course.studentCreditHours}</div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Course Evaluations Score:</label>
              <div style={{ 
                padding: '5px 10px', 
                border: '1px solid #ccc', 
                borderRadius: '5px', 
                backgroundColor: '#f9f9f9' 
              }}>{course.evaluationScore}</div>
            </div>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <p style={{ marginBottom: '10px', color: '#666' }}>Did this course have Community - Engaged Pedagogy?</p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name={`commEngaged-${course.id}`}
                  checked={course.commEngaged === true}
                  onChange={() => handleRadioChange(course.id, 'commEngaged', true)}
                  style={{ marginRight: '5px' }}
                />
                <span>Yes</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name={`commEngaged-${course.id}`}
                  checked={course.commEngaged === false}
                  onChange={() => handleRadioChange(course.id, 'commEngaged', false)}
                  style={{ marginRight: '5px' }}
                />
                <span>No</span>
              </label>
            </div>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <p style={{ marginBottom: '10px', color: '#666' }}>Did you make significant course updates/changes?</p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name={`updatedCourse-${course.id}`}
                  checked={course.updatedCourse === true}
                  onChange={() => handleRadioChange(course.id, 'updatedCourse', true)}
                  style={{ marginRight: '5px' }}
                />
                <span>Yes</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name={`updatedCourse-${course.id}`}
                  checked={course.updatedCourse === false}
                  onChange={() => handleRadioChange(course.id, 'updatedCourse', false)}
                  style={{ marginRight: '5px' }}
                />
                <span>No</span>
              </label>
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Notes:</label>
            <textarea
              value={course.notes}
              readOnly
              rows="4"
              style={{ 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid #ccc', 
                width: '100%',
                resize: 'vertical',
                backgroundColor: '#f9f9f9'
              }}
            ></textarea>
          </div>
        </div>
      ))}

      {/* Add Course Form */}
      {showForm ? (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '15px', 
          border: '1px solid #eee',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Add New Course</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Course Name:</label>
            <input
              type="text"
              value={newCourse.name}
              onChange={(e) => handleNewCourseChange('name', e.target.value)}
              style={{ 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid #ccc', 
                width: '100%',
                boxSizing: 'border-box'
              }}
              placeholder="e.g., URBAN 400 - Advanced Urban Planning"
            />
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Credits:</label>
              <input
                type="number"
                value={newCourse.credits}
                onChange={(e) => handleNewCourseChange('credits', e.target.value)}
                style={{ 
                  padding: '8px', 
                  borderRadius: '4px', 
                  border: '1px solid #ccc', 
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Enrollment:</label>
              <input
                type="number"
                value={newCourse.enrollment}
                onChange={(e) => handleNewCourseChange('enrollment', e.target.value)}
                style={{ 
                  padding: '8px', 
                  borderRadius: '4px', 
                  border: '1px solid #ccc', 
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Student Credit Hours:</label>
              <input
                type="number"
                value={newCourse.studentCreditHours}
                onChange={(e) => handleNewCourseChange('studentCreditHours', e.target.value)}
                style={{ 
                  padding: '8px', 
                  borderRadius: '4px', 
                  border: '1px solid #ccc', 
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                placeholder="Will calculate automatically if left empty"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Course Evaluations Score:</label>
              <input
                type="text"
                value={newCourse.evaluationScore}
                onChange={(e) => handleNewCourseChange('evaluationScore', e.target.value)}
                style={{ 
                  padding: '8px', 
                  borderRadius: '4px', 
                  border: '1px solid #ccc', 
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                placeholder="e.g., 3.4 (67%)"
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <p style={{ marginBottom: '10px', color: '#666' }}>Did this course have Community - Engaged Pedagogy?</p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="newCourseCommEngaged"
                  checked={newCourse.commEngaged === true}
                  onChange={() => handleNewCourseChange('commEngaged', true)}
                  style={{ marginRight: '5px' }}
                />
                <span>Yes</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="newCourseCommEngaged"
                  checked={newCourse.commEngaged === false}
                  onChange={() => handleNewCourseChange('commEngaged', false)}
                  style={{ marginRight: '5px' }}
                />
                <span>No</span>
              </label>
            </div>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <p style={{ marginBottom: '10px', color: '#666' }}>Did you make significant course updates/changes?</p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="newCourseUpdated"
                  checked={newCourse.updatedCourse === true}
                  onChange={() => handleNewCourseChange('updatedCourse', true)}
                  style={{ marginRight: '5px' }}
                />
                <span>Yes</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="newCourseUpdated"
                  checked={newCourse.updatedCourse === false}
                  onChange={() => handleNewCourseChange('updatedCourse', false)}
                  style={{ marginRight: '5px' }}
                />
                <span>No</span>
              </label>
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Notes:</label>
            <textarea
              value={newCourse.notes}
              onChange={(e) => handleNewCourseChange('notes', e.target.value)}
              rows="4"
              style={{ 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid #ccc', 
                width: '100%',
                resize: 'vertical'
              }}
              placeholder="N/A"
            ></textarea>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button 
              onClick={() => setShowForm(false)}
              style={{
                padding: '8px 20px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: 'white',
                color: '#333',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button 
              onClick={handleAddCourse}
              disabled={!newCourse.name || !newCourse.credits || !newCourse.enrollment}
              style={{
                padding: '8px 20px',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: '#4B2E83',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
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
          style={{ 
            padding: '15px', 
            borderRadius: '8px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onClick={() => setShowForm(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B2E83" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span style={{ marginLeft: '10px' }}>Add course</span>
        </div>
      )}

      {/* Outside Department Question */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ 
          marginBottom: '10px', 
          color: '#333',
          fontWeight: 'normal',
          display: 'flex',
          alignItems: 'center'
        }}>
          Did you teach any course outside of the Department of Urban Design and Planning?
          <span style={{ color: 'red', marginLeft: '5px' }}>*</span>
        </p>
        <div style={{ display: 'flex', gap: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="radio"
              name="outsideDept"
              checked={taughtOutsideDept === true}
              onChange={() => setTaughtOutsideDept(true)}
              style={{ marginRight: '5px' }}
            />
            <span>Yes</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="radio"
              name="outsideDept"
              checked={taughtOutsideDept === false}
              onChange={() => setTaughtOutsideDept(false)}
              style={{ marginRight: '5px' }}
            />
            <span>No</span>
          </label>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginTop: '30px'
      }}>
        <button style={{
          padding: '8px 20px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          backgroundColor: 'white',
          color: '#333',
          cursor: 'pointer',
          fontSize: '14px'
        }}>
          Previous
        </button>
        <button 
          onClick={onNext}
          style={{
            padding: '8px 20px',
            borderRadius: '5px',
            border: 'none',
            backgroundColor: '#94989c',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TeachingForm;