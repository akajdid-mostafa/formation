'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import ProfessorForm from './professor-form';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase'; // Adjust the import based on your Firebase setup
import { X } from 'lucide-react'; // Import the X icon

const storage = getStorage(app);

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
  images: (string | File)[]; // Allow both string URLs and File objects
  professorIds: number[];
}

interface Professor {
  id: number;
  firstName: string;
  lastName: string;
  image: string;
  profile: string;
  certificates: string[];
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
  const [showNewProfessorForm, setShowNewProfessorForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchProfessors();
  }, []);

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
      toast({
        title: "Error",
        description: "Failed to fetch professors. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      // Upload images to Firebase Storage and get their URLs
      const imageUrls = await Promise.all(
        formData.images.map(async (image) => {
          if (typeof image === 'string') {
            return image; // If it's already a URL, keep it
          }
          const storageRef = ref(storage, `formations/${image.name}`);
          await uploadBytes(storageRef, image);
          return await getDownloadURL(storageRef);
        })
      );

      const payload = {
        ...formData,
        images: imageUrls, // Replace file objects with their URLs
        duration: parseInt(formData.duration, 10),
        classSize: parseInt(formData.classSize, 10),
        professorIds: formData.professorIds,
      };

      const response = await fetch('/api/formations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create formation');
      }

      const responseData = await response.json();
      console.log('Response:', responseData);

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
      toast({
        title: "Success",
        description: "Formation created successfully!",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setFormData({ ...formData, images: [...formData.images, ...files] });
    }
  };

  const handleProfessorChange = (professorId: number) => {
    setFormData(prev => ({
      ...prev,
      professorIds: prev.professorIds.includes(professorId)
        ? prev.professorIds.filter(id => id !== professorId)
        : [...prev.professorIds, professorId]
    }));
  };

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
      setProfessors(prevProfessors => [...prevProfessors, createdProfessor]);
      setShowNewProfessorForm(false);
      toast({
        title: "Success",
        description: "Professor added successfully!",
      });
    } catch (error) {
      console.error('Error adding professor:', error);
      toast({
        title: "Error",
        description: "Failed to add professor. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Create New Formation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Formation Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter formation title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter location"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                placeholder="Enter duration"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classSize">Class Size</Label>
              <Input
                id="classSize"
                name="classSize"
                type="number"
                value={formData.classSize}
                onChange={handleChange}
                placeholder="Enter class size"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prerequisites">Prerequisites</Label>
            <Input
              id="prerequisites"
              name="prerequisites"
              value={formData.prerequisites}
              onChange={handleChange}
              placeholder="Enter prerequisites"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="detail">Details</Label>
            <Textarea
              id="detail"
              name="detail"
              value={formData.detail}
              onChange={handleChange}
              placeholder="Enter details"
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Images</Label>
            <Input
              type="file"
              multiple
              onChange={handleImageChange}
              accept="image/*"
            />
            <div className="flex flex-wrap gap-2">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                    alt={`Formation Image ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-0 right-0 p-1"
                    onClick={() => {
                      const newImages = formData.images.filter((_, i) => i !== index);
                      setFormData({ ...formData, images: newImages });
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Professors</Label>
            <ScrollArea className="h-[200px] w-full border rounded-md p-4">
              {professors.map((professor) => (
                <div key={professor.id} className="flex items-center space-x-2 py-2">
                  <Checkbox
                    id={`professor-${professor.id}`}
                    checked={formData.professorIds.includes(professor.id)}
                    onCheckedChange={() => handleProfessorChange(professor.id)}
                  />
                  <Label htmlFor={`professor-${professor.id}`}>
                    {professor.firstName} {professor.lastName}
                  </Label>
                </div>
              ))}
            </ScrollArea>
            <Button type="button" onClick={() => setShowNewProfessorForm(!showNewProfessorForm)}>
              {showNewProfessorForm ? 'Hide Professor Form' : 'Add New Professor'}
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Create Formation'}
          </Button>
        </form>

        {showNewProfessorForm && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Add New Professor</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfessorForm addProfessor={addProfessor} />
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}