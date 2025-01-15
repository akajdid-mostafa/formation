'use client';

import { useState, useEffect } from 'react';
import  ProfessorForm  from './ProfessorForm';
import  ProfessorList  from './ProfessorList';



// Define the Professor type
export interface Professor {
  id: number;
  firstName: string;
  lastName: string;
  image: string;
  profile: string;
  certificates: string[];
}

export default function ProfessorsPage() {
  // State to store the list of professors
  const [professors, setProfessors] = useState<Professor[]>([]);

  // Fetch professors on component mount
  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const response = await fetch('/api/professors');
        if (!response.ok) {
          throw new Error('Failed to fetch professors');
        }
        const data = await response.json();
        setProfessors(data);
      } catch (error) {
        console.error('Error fetching professors:', error);
      }
    };

    fetchProfessors();
  }, []);

  // Function to add a new professor
  const addProfessor = async (newProfessor: Omit<Professor, 'id'>) => {
    try {
      const response = await fetch('/api/professors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfessor),
      });

      if (!response.ok) {
        throw new Error('Failed to add professor');
      }

      const createdProfessor = await response.json();
      setProfessors((prevProfessors) => [...prevProfessors, createdProfessor]);
    } catch (error) {
      console.error('Error adding professor:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Professors</h1>
      <ProfessorForm addProfessor={addProfessor} />
      <ProfessorList professors={professors} setProfessors={setProfessors} />
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import CreateProfessorForm from "./create-professor-form";
// import ProfessorList from "./professor-list";

// interface Professor {
//   id: number;
//   firstName: string;
//   lastName: string;
//   image: string;
//   profile: string;
//   certificates: string[];
// }

// export default function ProfessorsPage() {
//   const [professors, setProfessors] = useState<Professor[]>([]);

//   const handleCreateProfessor = async (newProfessor: Omit<Professor, "id">) => {
//     try {
//       const response = await fetch("/api/professors", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(newProfessor),
//       });

//       if (response.ok) {
//         const created = await response.json();
//         setProfessors([...professors, created]);
//       }
//     } catch (error) {
//       console.error("Error creating professor:", error);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <CreateProfessorForm onSubmit={handleCreateProfessor} />
//       <ProfessorList professors={professors} setProfessors={setProfessors} />
//     </div>
//   );
// }