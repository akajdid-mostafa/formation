"use client";

import { useState, ChangeEvent } from 'react';
import {
  getStorage, ref, uploadBytes, getDownloadURL, deleteObject, getMetadata 
} from "firebase/storage";
import { app } from "@/lib/firebase";
import { X } from "lucide-react";
import { FirebaseError } from 'firebase/app'; // Import FirebaseError for type checking

interface Professor {
  id: number;
  firstName: string;
  lastName: string;
  image: string;
  profile: string;
  certificates: string[];
}

interface ProfessorListProps {
  professors: Professor[];
  setProfessors: (professors: Professor[]) => void;
}

export default function ProfessorList({
  professors,
  setProfessors,
}: ProfessorListProps) {
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(
    null
  );
  const storage = getStorage(app);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [professorToDelete, setProfessorToDelete] = useState<number | null>(
    null
  );
  const [editingCertificateIndex, setEditingCertificateIndex] = useState<
    number | null
  >(null);
  const [editedCertificate, setEditedCertificate] = useState<string>("");

  const handleDelete = async () => {
    if (professorToDelete === null) return;

    const response = await fetch(`/api/professors/${professorToDelete}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setProfessors(
        professors.filter((professor) => professor.id !== professorToDelete)
      );
      setIsDeleteModalOpen(false);
      setProfessorToDelete(null);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProfessor) return;
  
    let newImageUrl = selectedProfessor.image;
  
    try {
      // Check if a new image file is selected
      const newImageFile = (document.getElementById('updateImage') as HTMLInputElement)?.files?.[0];
      if (newImageFile) {
        // Upload the new image to Firebase Storage
        const newImageRef = ref(storage, `professors/${newImageFile.name}`);
        await uploadBytes(newImageRef, newImageFile);
        newImageUrl = await getDownloadURL(newImageRef);
  
        // Delete the old image from Firebase Storage (if it exists)
        if (selectedProfessor.image) {
          const oldImageRef = ref(storage, selectedProfessor.image);
  
          // Check if the old image exists before attempting to delete it
          try {
            await getMetadata(oldImageRef); // Check if the image exists
            await deleteObject(oldImageRef); // Delete the image if it exists
          } catch (error) {
            // Narrow down the type of the error
            if (error instanceof FirebaseError && error.code === 'storage/object-not-found') {
              console.log('Old image not found in Firebase Storage. Skipping deletion.');
            } else {
              throw error; // Re-throw other errors
            }
          }
        }
      }
  
      // Update the professor's data with the new image URL
      const payload = {
        firstName: selectedProfessor.firstName,
        lastName: selectedProfessor.lastName,
        image: newImageUrl,
        profile: selectedProfessor.profile,
        certificates: selectedProfessor.certificates || [],
      };
  
      // Call the API to update the professor
      const response = await fetch(`/api/professors/${selectedProfessor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        const updatedProfessor = await response.json();
        setProfessors(
          professors.map((professor) =>
            professor.id === updatedProfessor.id ? updatedProfessor : professor
          )
        );
        setIsUpdateModalOpen(false);
        setSelectedProfessor(null);
      }
    } catch (error) {
      console.error('Error updating professor:', error);
    }
  };

  const addCertificate = (certificate: string) => {
    if (certificate.trim() && selectedProfessor) {
      setSelectedProfessor({
        ...selectedProfessor,
        certificates: [...selectedProfessor.certificates, certificate.trim()],
      });
    }
  };

  const removeCertificate = (index: number) => {
    if (selectedProfessor) {
      setSelectedProfessor({
        ...selectedProfessor,
        certificates: selectedProfessor.certificates.filter(
          (_, i) => i !== index
        ),
      });
    }
  };

  const saveEditedCertificate = (index: number) => {
    if (selectedProfessor) {
      const updatedCertificates = [...selectedProfessor.certificates];
      updatedCertificates[index] = editedCertificate;
      setSelectedProfessor({
        ...selectedProfessor,
        certificates: updatedCertificates,
      });
      setEditingCertificateIndex(null);
      setEditedCertificate("");
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Create a preview URL for the new image
      const previewUrl = URL.createObjectURL(file);
      setNewImagePreview(previewUrl);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(professors) && professors.length > 0 ? (
          professors.map((professor) => (
            <div
              key={professor.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-transform duration-300 hover:scale-102"
            >
              <div className="aspect-video relative">
                <img
                  src={professor.image || "/placeholder.svg"}
                  alt={`${professor.firstName} ${professor.lastName}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-800">
                  {professor.firstName} {professor.lastName}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {professor.profile}
                </p>
                {professor.certificates.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">
                      Certificates
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {professor.certificates.map((cert, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedProfessor(professor);
                      setIsUpdateModalOpen(true);
                    }}
                    className="flex-1 py-2 px-4 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setProfessorToDelete(professor.id);
                      setIsDeleteModalOpen(true);
                    }}
                    className="flex-1 py-2 px-4 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 col-span-full text-center py-8">
            No professors found.
          </p>
        )}
      </div>

      {/* Update Modal */}
      {isUpdateModalOpen && selectedProfessor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 p-8">
            <h3 className="text-2xl font-bold mb-6">Update Professor</h3>
            <form onSubmit={handleUpdateSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg mb-2">First Name</label>
                  <input
                    type="text"
                    value={selectedProfessor.firstName}
                    onChange={(e) =>
                      setSelectedProfessor({
                        ...selectedProfessor,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-lg mb-2">Last Name</label>
                  <input
                    type="text"
                    value={selectedProfessor.lastName}
                    onChange={(e) =>
                      setSelectedProfessor({
                        ...selectedProfessor,
                        lastName: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-lg mb-2">Image</label>
                {/* Show old image if no new image is selected */}
                {!newImagePreview && (
                  <img
                    src={selectedProfessor.image}
                    alt="Old Professor Image"
                    className="w-32 h-32 object-cover rounded-lg mb-4"
                  />
                )}
                {/* Show new image preview if a new image is selected */}
                {newImagePreview && (
                  <img
                    src={newImagePreview}
                    alt="New Professor Image Preview"
                    className="w-32 h-32 object-cover rounded-lg mb-4"
                  />
                )}
                <input
                  type="file"
                  id="updateImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-lg mb-2">Profile</label>
                <textarea
                  value={selectedProfessor.profile}
                  onChange={(e) =>
                    setSelectedProfessor({
                      ...selectedProfessor,
                      profile: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                  required
                />
              </div>

              {/* Certificates Section */}
              <div className="mb-4">
                <label className="text-xl font-semibold mb-4 block">
                  Certificates
                </label>
                <div className="mb-4 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter the name of the certificate"
                    className="flex-1 p-3 border border-gray-200 rounded-lg text-lg text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editedCertificate}
                    onChange={(e) => setEditedCertificate(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (editedCertificate.trim()) {
                          if (editingCertificateIndex !== null) {
                            saveEditedCertificate(editingCertificateIndex);
                          } else {
                            addCertificate(editedCertificate);
                            setEditedCertificate("");
                          }
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (editedCertificate.trim()) {
                        if (editingCertificateIndex !== null) {
                          saveEditedCertificate(editingCertificateIndex);
                        } else {
                          addCertificate(editedCertificate);
                          setEditedCertificate("");
                        }
                      }
                    }}
                    className="px-8 py-3 bg-[#14181F] text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    {editingCertificateIndex !== null ? "Update" : "Add"}
                  </button>
                </div>

                {selectedProfessor.certificates.length > 0 && (
                  <div>
                    <h4 className="text-xl font-semibold mb-3">
                      Added Certificates
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfessor.certificates.map((cert, index) => (
                        <div
                          key={index}
                          className="group flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100"
                        >
                          <span
                            className="cursor-pointer"
                            onClick={() => {
                              setEditingCertificateIndex(index);
                              setEditedCertificate(cert);
                            }}
                          >
                            {cert}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeCertificate(index)}
                            className="opacity-50 hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsUpdateModalOpen(false);
                    setNewImagePreview(null); // Reset the new image preview when closing the modal
                  }}
                  className="px-6 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#14181F] text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-8">
            <h3 className="text-2xl font-bold mb-4">Delete Professor</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this professor? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
