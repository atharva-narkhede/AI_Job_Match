// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const allSkills = [
  'Python', 'Data Engineering', 'SQL', 'AWS', 'Airflow',
  'React', 'Node.js', 'MongoDB', 'Express', 'Docker',
  'TypeScript', 'Next.js', 'Kubernetes', 'Redis', 'GraphQL',
  'GCP', 'Azure', 'Java', 'Spring Boot', 'PostgreSQL'
];


export default function Register() {
  const { setAuth, setUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    location: '',
    experience: '',
    jobType: 'any',
    skills: []
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkillChange = (skill) => {
    const updated = formData.skills.includes(skill)
      ? formData.skills.filter((s) => s !== skill)
      : [...formData.skills, skill];
    setFormData({ ...formData, skills: updated });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  try {
    await axios.post('http://localhost:5000/api/users/register', formData, {
      withCredentials: true,
    });

    alert('✅ Registration successful! Please login.');
    navigate('/login');
  } catch (err) {
    setError(err.response?.data?.message || 'Registration failed');
  }
};


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center">Register</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            required
            onChange={handleChange}
            className="px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            onChange={handleChange}
            className="px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={handleChange}
            className="px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            onChange={handleChange}
            className="px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            name="experience"
            placeholder="Experience (years)"
            onChange={handleChange}
            className="px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="jobType"
            onChange={handleChange}
            className="px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="any">Any</option>
            <option value="remote">Remote</option>
            <option value="onsite">Onsite</option>
          </select>
        </div>

        <div className="mt-6">
          <label className="block font-medium mb-2">Select Skills:</label>
          <div className="flex flex-wrap gap-2">
            {allSkills.map((skill) => (
              <label key={skill} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.skills.includes(skill)}
                  onChange={() => handleSkillChange(skill)}
                  className="form-checkbox"
                />
                <span className="text-sm">{skill}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
}
