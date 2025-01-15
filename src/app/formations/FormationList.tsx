'use client';

import { useEffect, useState } from 'react';
import { formatDescription } from '@/lib/formatDescription';

interface Formation {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  duration: number;
  location: string;
  classSize: number;
  prerequisites: string;
  description: string;
  detail: string;
  images: string[];
  professors: Professor[];
}

interface Professor {
  id: number;
  firstName: string;
  lastName: string;
  image: string;
  profile: string;
  certificates: string;
}

export default function FormationList() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [formattedDescriptions, setFormattedDescriptions] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    const response = await fetch('/api/formations');
    const data = await response.json();
    setFormations(data);

    // Format descriptions for each formation
    const descriptions: { [key: number]: string } = {};
    for (const formation of data) {
      descriptions[formation.id] = await formatDescription(formation.description);
    }
    setFormattedDescriptions(descriptions);
  };

  const deleteFormation = async (id: number) => {
    const response = await fetch(`/api/formations?id=${id}`, { method: 'DELETE' });
    if (response.ok) {
      fetchFormations();
    } else {
      alert('Failed to delete formation');
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Formation List</h2>
      {formations.map((formation) => (
        <div key={formation.id} className="bg-white shadow rounded-lg p-6 mb-4">
          <h3 className="text-xl font-bold mb-2">{formation.title}</h3>
          <p><strong>Date:</strong> {new Date(formation.startDate).toLocaleDateString()} - {new Date(formation.endDate).toLocaleDateString()}</p>
          <p><strong>Duration:</strong> {formation.duration} hours</p>
          <p><strong>Location:</strong> {formation.location}</p>
          <p><strong>Class Size:</strong> {formation.classSize}</p>
          <p><strong>Prerequisites:</strong> {formation.prerequisites}</p>
          <div className="mt-4">
            <h4 className="text-lg font-bold mb-2">Description:</h4>
            <div dangerouslySetInnerHTML={{ __html: formattedDescriptions[formation.id] || '' }} />
          </div>
          <div className="mt-4">
            <h4 className="text-lg font-bold mb-2">Images:</h4>
            <div className="flex space-x-2">
              {formation.images.map((image: string, index: number) => (
                <img key={index} src={image} alt={`Formation Image ${index + 1}`} className="w-32 h-32 object-cover rounded" />
              ))}
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-lg font-bold mb-2">Professors:</h4>
            {formation.professors.map((professor: Professor) => (
              <div key={professor.id} className="flex items-center space-x-2">
                <img src={professor.image} alt={`${professor.firstName} ${professor.lastName}`} className="w-12 h-12 object-cover rounded-full" />
                <p>{professor.firstName} {professor.lastName}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-x-2">
            <button
              onClick={() => deleteFormation(formation.id)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}