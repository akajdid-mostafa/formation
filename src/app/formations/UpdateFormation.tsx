"use client";

import { useState , useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStorage, ref, deleteObject, uploadBytes, getDownloadURL,getMetadata } from "firebase/storage";
import { app } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";
// import { Formation, Professor } from "@/types"; // Assuming you have a types file

interface Formation {
    id: number;
    title: string;
    startDate: string;
    endDate: string;
    duration: string; // Changed to string
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
  

interface UpdateFormationProps {
  formation: Formation;
  onClose: () => void;
  onFormationUpdated: () => void;
}

export default function UpdateFormation({ formation, onClose, onFormationUpdated }: UpdateFormationProps) {
  const [selectedFormation, setSelectedFormation] = useState<Formation>(formation);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    duration: formation.duration.split(" ")[0],
    timeUnit: formation.duration.split(" ")[1],
  });
  const [professorError, setProfessorError] = useState<string | null>(null);
  const [allProfessors, setAllProfessors] = useState<Professor[]>([]);
  const storage = getStorage(app);

  useEffect(() => {
    fetchAllProfessors();
  }, []);

  const fetchAllProfessors = async () => {
    const response = await fetch("/api/professors");
    const data = await response.json();
    setAllProfessors(data);
  };

  const addProfessor = (professorId: number) => {
    const professorExists = selectedFormation.professors.some((professor) => professor.id === professorId);

    if (professorExists) {
      setProfessorError("The professor already exists.");
      return;
    }

    const professorToAdd = allProfessors.find((p) => p.id === professorId);
    if (professorToAdd) {
      setSelectedFormation({
        ...selectedFormation,
        professors: [...selectedFormation.professors, professorToAdd],
      });
      setProfessorError(null);
    }
  };

  const removeProfessor = (professorId: number) => {
    setSelectedFormation({
      ...selectedFormation,
      professors: selectedFormation.professors.filter((p) => p.id !== professorId),
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImages(files);
    }
  };

  const removeImage = (index: number) => {
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
      return data.imageUrls;
    } else {
      throw new Error("Failed to upload images");
    }
  };

  const handleUpdateFormation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const professorIds = selectedFormation.professors.map((professor) => professor.id);
    const durationWithUnit = `${formData.get("duration")} ${formData.get("timeUnit")}`;

    const updatedFormation = {
      title: formData.get("title") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      duration: durationWithUnit,
      location: formData.get("location") as string,
      classSize: parseInt(formData.get("classSize") as string, 10),
      prerequisites: formData.get("prerequisites") as string,
      description: formData.get("description") as string,
      detail: formData.get("detail") as string,
      images: selectedFormation.images,
      professorIds: professorIds,
    };

    try {
      if (newImages.length > 0) {
        const uploadedImageUrls = await Promise.all(
          newImages.map(async (file) => {
            const storageRef = ref(storage, `formations/${file.name}`);
            await uploadBytes(storageRef, file);
            return await getDownloadURL(storageRef);
          })
        );
        updatedFormation.images = [...selectedFormation.images, ...uploadedImageUrls];
      }

      const imagesToDelete = selectedFormation.images.filter((image) => !updatedFormation.images.includes(image));

      await Promise.all(
        imagesToDelete.map(async (imageUrl) => {
          const imageRef = ref(storage, imageUrl);
          try {
            await getMetadata(imageRef);
            await deleteObject(imageRef);
          } catch (error) {
            if (error instanceof FirebaseError && error.code === "storage/object-not-found") {
              console.log("Image not found in Firebase Storage. Skipping deletion.");
            } else {
              throw error;
            }
          }
        })
      );

      const response = await fetch(`/api/formations/${selectedFormation.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFormation),
      });

      if (response.ok) {
        onFormationUpdated();
        onClose();
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Formation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdateFormation}>
            <div className="grid gap-4 py-4">
              {/* Title */}
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
              {/* Start Date */}
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
              {/* End Date */}
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
              {/* Duration */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Duration
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className="flex-1"
                  />
                  <select
                    name="timeUnit" // Add this attribute
                    value={formData.timeUnit}
                    onChange={(e) =>
                      setFormData({ ...formData, timeUnit: e.target.value })
                    }
                    className="p-2 border rounded-md"
                  >
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>
              {/* Location */}
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
              {/* Class Size */}
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
              {/* Prerequisites */}
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
              {/* Description */}
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
              {/* Detail */}
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
              {/* Image */}
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
              {/* Professor */}
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
              
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
      </DialogContent>
    </Dialog>
  );
}