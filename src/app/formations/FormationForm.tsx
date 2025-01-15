'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import Createprof from '../professors/ProfessorForm';

interface FormData {
  title: string;
  startDate: string;
  endDate: string;
  duration: string;
  location: string;
  classSize: string;
  prerequisites: string;
  description: string;
  detail: string;
  images: string[];
  professorIds: number[];
}

interface Professor {
  id: number;
  firstName: string;
  lastName: string;
}

export default function FormationForm() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    startDate: '',
    endDate: '',
    duration: '',
    location: '',
    classSize: '',
    prerequisites: '',
    description: '',
    detail: '',
    images: [],
    professorIds: [],
  });

  const [professors, setProfessors] = useState<Professor[]>([]);
  const [newProfessor, setNewProfessor] = useState({
    firstName: '',
    lastName: '',
    image: '',
    profile: '',
    certificates: '',
  });

  // Fetch professors on component mount
  useEffect(() => {
    fetchProfessors();
  }, []);

  const fetchProfessors = async () => {
    const response = await fetch('/api/professors');
    const data = await response.json();
    setProfessors(data);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        duration: parseInt(formData.duration, 10),
        classSize: parseInt(formData.classSize, 10),
        professorIds: formData.professorIds, // Already numbers
      };

      const response = await fetch('/api/formations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log('Response:', responseData);

      if (!response.ok) {
        throw new Error('Failed to create formation');
      }

      // Reset form after successful submission
      setFormData({
        title: '',
        startDate: '',
        endDate: '',
        duration: '',
        location: '',
        classSize: '',
        prerequisites: '',
        description: '',
        detail: '',
        images: [],
        professorIds: [],
      });
      alert('Formation created successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({ ...formData, images: [...formData.images, value] });
  };

  const handleProfessorChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedIds = Array.from(e.target.selectedOptions, (option) => parseInt(option.value, 10));
    setFormData({ ...formData, professorIds: selectedIds });
  };

  const handleNewProfessorChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProfessor({ ...newProfessor, [name]: value });
  };

  const addNewProfessor = async () => {
    try {
      const response = await fetch('/api/professors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfessor),
      });

      const data = await response.json();
      if (response.ok) {
        // Add the new professor to the list and select it
        setProfessors([...professors, data]);
        setFormData({ ...formData, professorIds: [...formData.professorIds, data.id] });
        setNewProfessor({ firstName: '', lastName: '', image: '', profile: '', certificates: '' });
        alert('Professor added successfully!');
      } else {
        throw new Error('Failed to add professor');
      }
    } catch (error) {
      console.error('Error adding professor:', error);
      alert('An error occurred. Please try again.');
    }
  };

  // const addProfessor = async (newProfessor: Omit<Professor, 'id'>) => {
  //   try {
  //     const response = await fetch('/api/professors', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(newProfessor),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to add professor');
  //     }

  //     const createdProfessor = await response.json();
  //     setProfessors((prevProfessors) => [...prevProfessors, createdProfessor]);
  //   } catch (error) {
  //     console.error('Error adding professor:', error);
  //   }
  // };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Formation Title"
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="date"
        name="startDate"
        value={formData.startDate}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="date"
        name="endDate"
        value={formData.endDate}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="number"
        name="duration"
        value={formData.duration}
        onChange={handleChange}
        placeholder="Duration (hours)"
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="text"
        name="location"
        value={formData.location}
        onChange={handleChange}
        placeholder="Location"
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="number"
        name="classSize"
        value={formData.classSize}
        onChange={handleChange}
        placeholder="Class Size"
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="text"
        name="prerequisites"
        value={formData.prerequisites}
        onChange={handleChange}
        placeholder="Prerequisites"
        className="w-full p-2 border rounded"
        required
      />
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        className="w-full p-2 border rounded"
        rows={5}
        required
      ></textarea>
      <textarea
        name="detail"
        value={formData.detail}
        onChange={handleChange}
        placeholder="Details"
        className="w-full p-2 border rounded"
        rows={5}
        required
      ></textarea>

      {/* Image URLs */}
      <div>
        <h4 className="text-lg font-bold mb-2">Images:</h4>
        {formData.images.map((image, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="url"
              value={image}
              onChange={(e) => {
                const newImages = [...formData.images];
                newImages[index] = e.target.value;
                setFormData({ ...formData, images: newImages });
              }}
              placeholder="Image URL"
              className="w-full p-2 border rounded"
            />
            <button
              type="button"
              onClick={() => {
                const newImages = formData.images.filter((_, i) => i !== index);
                setFormData({ ...formData, images: newImages });
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setFormData({ ...formData, images: [...formData.images, ''] })}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Image URL
        </button>
      </div>

      {/* Professor Selection */}
      <div>
        <h4 className="text-lg font-bold mb-2">Professors:</h4>
        <select
          name="professorIds"
          multiple
          value={formData.professorIds.map(String)}
          onChange={handleProfessorChange}
          className="w-full p-2 border rounded"
        >
          {professors.map((professor) => (
            <option key={professor.id} value={professor.id}>
              {professor.firstName} {professor.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Add New Professor */}
      {/* <Createprof  addProfessor={addProfessor} /> */}
      <div>
        
        <h4 className="text-lg font-bold mb-2">Add New Professor:</h4>
        <input
          type="text"
          name="firstName"
          value={newProfessor.firstName}
          onChange={handleNewProfessorChange}
          placeholder="First Name"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          name="lastName"
          value={newProfessor.lastName}
          onChange={handleNewProfessorChange}
          placeholder="Last Name"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="url"
          name="image"
          value={newProfessor.image}
          onChange={handleNewProfessorChange}
          placeholder="Image URL"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          name="profile"
          value={newProfessor.profile}
          onChange={handleNewProfessorChange}
          placeholder="Profile"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          name="certificates"
          value={newProfessor.certificates}
          onChange={handleNewProfessorChange}
          placeholder="Certificates"
          className="w-full p-2 border rounded mb-2"
        />
        <button
          type="button"
          onClick={addNewProfessor}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add Professor
        </button>
      </div>

      {/* Submit Button */}
      <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Create Formation
      </button>
    </form>
  );
}