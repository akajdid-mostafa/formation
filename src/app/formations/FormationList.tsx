"use client";

import { useEffect, useState } from "react";
import { formatDescription } from "@/lib/formatDescription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getStorage,
  ref,
  deleteObject,
  getMetadata,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { app } from "@/lib/firebase"; // Adjust the import based on your Firebase setup
import { FirebaseError } from 'firebase/app'; 

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
  const [professorError, setProfessorError] = useState<string | null>(null);
  const [formattedDescriptions, setFormattedDescriptions] = useState<{
    [key: number]: string;
  }>({});
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(
    null
  );
  const storage = getStorage(app);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allProfessors, setAllProfessors] = useState<Professor[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formationToDelete, setFormationToDelete] = useState<number | null>(
    null
  );
  const [newImages, setNewImages] = useState<File[]>([]); // State for new images

  useEffect(() => {
    fetchFormations();
    fetchAllProfessors();
  }, []);

  const fetchFormations = async () => {
    const response = await fetch("/api/formations");
    const data = await response.json();
    setFormations(data);

    const descriptions: { [key: number]: string } = {};
    for (const formation of data) {
      descriptions[formation.id] = await formatDescription(
        formation.description
      );
    }
    setFormattedDescriptions(descriptions);
  };

  const fetchAllProfessors = async () => {
    const response = await fetch("/api/professors");
    const data = await response.json();
    setAllProfessors(data);
  };

  const deleteFormation = async (id: number) => {
    setFormationToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (formationToDelete !== null) {
      const response = await fetch(`/api/formations?id=${formationToDelete}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchFormations();
      } else {
        alert("Failed to delete formation");
      }
      setIsDeleteDialogOpen(false);
      setFormationToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setFormationToDelete(null);
  };

  const openUpdateModal = (formation: Formation) => {
    setSelectedFormation(formation);
    setIsModalOpen(true);
  };

  const closeUpdateModal = () => {
    setSelectedFormation(null);
    setIsModalOpen(false);
    setNewImages([]); // Clear new images when modal closes
  };

  const addProfessor = (professorId: number) => {
    if (!selectedFormation) return;

    // Check if the professor already exists in the formation
    const professorExists = selectedFormation.professors.some(
      (professor) => professor.id === professorId
    );

    if (professorExists) {
      setProfessorError("The professor already exists.");
      return; // Exit the function if the professor exists
    }

    // If the professor doesn't exist, add them
    const professorToAdd = allProfessors.find((p) => p.id === professorId);
    if (professorToAdd) {
      setSelectedFormation({
        ...selectedFormation,
        professors: [...selectedFormation.professors, professorToAdd],
      });
      setProfessorError(null); // Clear any previous error
    }
  };

  const removeProfessor = (professorId: number) => {
    if (!selectedFormation) return;
    setSelectedFormation({
      ...selectedFormation,
      professors: selectedFormation.professors.filter(
        (p) => p.id !== professorId
      ),
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImages(files);
    }
  };

  const removeImage = (index: number) => {
    if (!selectedFormation) return;
    const updatedImages = [...selectedFormation.images];
    updatedImages.splice(index, 1);
    setSelectedFormation({ ...selectedFormation, images: updatedImages });
  };

  const uploadImages = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const response = await fetch("/api/upload-images", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      return data.imageUrls; // Return the URLs of the uploaded images
    } else {
      throw new Error("Failed to upload images");
    }
  };

  const handleUpdateFormation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedFormation) return;

    const formData = new FormData(e.currentTarget);

    // Extract professor IDs from the selected formation
    const professorIds = selectedFormation.professors.map(
      (professor) => professor.id
    );

    // Prepare the updated formation data
    const updatedFormation = {
      title: formData.get("title") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      duration: parseInt(formData.get("duration") as string, 10),
      location: formData.get("location") as string,
      classSize: parseInt(formData.get("classSize") as string, 10),
      prerequisites: formData.get("prerequisites") as string,
      description: formData.get("description") as string,
      detail: formData.get("detail") as string,
      images: selectedFormation.images, // Include existing images
      professorIds: professorIds, // Send professor IDs instead of the full professors array
    };

    try {
      // If new images are uploaded, upload them to Firebase Storage
      if (newImages.length > 0) {
        const uploadedImageUrls = await Promise.all(
          newImages.map(async (file) => {
            const storageRef = ref(storage, `formations/${file.name}`);
            await uploadBytes(storageRef, file);
            return await getDownloadURL(storageRef);
          })
        );
        updatedFormation.images = [
          ...selectedFormation.images,
          ...uploadedImageUrls,
        ];
      }

      // Delete old images that were removed from the formation
      const imagesToDelete = selectedFormation.images.filter(
        (image) => !updatedFormation.images.includes(image)
      );

      await Promise.all(
        imagesToDelete.map(async (imageUrl) => {
          const imageRef = ref(storage, imageUrl);
          try {
            await getMetadata(imageRef); // Check if the image exists
            await deleteObject(imageRef); // Delete the image if it exists
          } catch (error) {
            // Narrow down the type of the error
            if (error instanceof FirebaseError && error.code === 'storage/object-not-found') {
              console.log('Image not found in Firebase Storage. Skipping deletion.');
            } else {
              throw error; // Re-throw other errors
            }
          }
        })
      );

      // Send the updated formation data to the API
      const response = await fetch(`/api/formations/${selectedFormation.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFormation),
      });

      if (response.ok) {
        fetchFormations(); // Refresh the list of formations
        closeUpdateModal(); // Close the modal
      } else {
        const errorData = await response.json();
        alert(`Failed to update formation: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating formation:", error);
      alert("An error occurred while updating the formation.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Formation List</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {formations.map((formation) => (
          <Card key={formation.id}>
            <CardHeader>
              <CardTitle>{formation.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Date:</strong>{" "}
                  {new Date(formation.startDate).toLocaleDateString()} -{" "}
                  {new Date(formation.endDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Duration:</strong> {formation.duration} hours
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Location:</strong> {formation.location}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Class Size:</strong> {formation.classSize}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Prerequisites:</strong> {formation.prerequisites}
                </p>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Description:</h4>
                <div
                  className="text-sm"
                  dangerouslySetInnerHTML={{
                    __html: formattedDescriptions[formation.id] || "",
                  }}
                />
              </div>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Images:</h4>
                <div className="flex flex-wrap gap-2">
                  {formation.images.map((image: string, index: number) => (
                    <img
                      key={index}
                      src={image || "/placeholder.svg"}
                      alt={`Formation Image ${index + 1}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Professors:</h4>
                <div className="flex flex-wrap gap-2">
                  {formation.professors.map((professor: Professor) => (
                    <div
                      key={professor.id}
                      className="flex items-center space-x-2"
                    >
                      <img
                        src={professor.image || "/placeholder.svg"}
                        alt={`${professor.firstName} ${professor.lastName}`}
                        className="w-8 h-8 object-cover rounded-full"
                      />
                      <p className="text-sm">
                        {professor.firstName} {professor.lastName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 space-x-2">
                <Button
                  onClick={() => openUpdateModal(formation)}
                  variant="outline"
                >
                  Update
                </Button>
                <Button
                  onClick={() => deleteFormation(formation.id)}
                  variant="destructive"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Formation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateFormation}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={selectedFormation?.title}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  defaultValue={
                    selectedFormation
                      ? new Date(selectedFormation.startDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  defaultValue={
                    selectedFormation
                      ? new Date(selectedFormation.endDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Duration
                </Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  defaultValue={selectedFormation?.duration}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={selectedFormation?.location}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="classSize" className="text-right">
                  Class Size
                </Label>
                <Input
                  id="classSize"
                  name="classSize"
                  type="number"
                  defaultValue={selectedFormation?.classSize}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prerequisites" className="text-right">
                  Prerequisites
                </Label>
                <Input
                  id="prerequisites"
                  name="prerequisites"
                  defaultValue={selectedFormation?.prerequisites}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={selectedFormation?.description}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="detail" className="text-right">
                  Detail
                </Label>
                <Textarea
                  id="detail"
                  name="detail"
                  defaultValue={selectedFormation?.detail}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Professors</Label>
                <div className="col-span-3 space-y-2">
                  {selectedFormation?.professors.map((professor) => (
                    <div
                      key={professor.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <img
                          src={professor.image || "/placeholder.svg"}
                          alt={`${professor.firstName} ${professor.lastName}`}
                          className="w-8 h-8 object-cover rounded-full"
                        />
                        <p className="text-sm">
                          {professor.firstName} {professor.lastName}
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeProfessor(professor.id)}
                        variant="destructive"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Select
                    onValueChange={(value) => addProfessor(parseInt(value, 10))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a professor to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {allProfessors.map((professor) => (
                        <SelectItem
                          key={professor.id}
                          value={professor.id.toString()}
                        >
                          {professor.firstName} {professor.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {professorError && (
                    <p className="text-sm text-red-500">{professorError}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="images" className="text-right">
                  Images
                </Label>
                <div className="col-span-3">
                  <Input
                    id="images"
                    name="images"
                    type="file"
                    multiple
                    onChange={(e) => handleImageUpload(e)}
                    className="mb-2"
                  />
                  <div className="flex flex-wrap gap-2">
                    {selectedFormation?.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Formation Image ${index + 1}`}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <Button
                          type="button"
                          onClick={() => removeImage(index)}
                          variant="destructive"
                          size="sm"
                          className="absolute top-0 rounded-full right-0 p-1"
                        >
                          X
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this formation?</p>
          <DialogFooter>
            <Button onClick={cancelDelete} variant="outline">
              Cancel
            </Button>
            <Button onClick={confirmDelete} variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
