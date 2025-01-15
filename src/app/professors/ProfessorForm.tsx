'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X } from 'lucide-react'

interface ProfessorFormProps {
  addProfessor: (newProfessor: {
    firstName: string;
    lastName: string;
    image: string;
    profile: string;
    certificates: string[];
  }) => void;
}

export default function ProfessorForm({ addProfessor }: ProfessorFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    image: '',
    profile: '',
    certificates: [] as string[],
  });

  const [certificateInput, setCertificateInput] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addProfessor(formData);
    setFormData({ firstName: '', lastName: '', image: '', profile: '', certificates: [] });
    setCertificateInput('');
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name !== 'certificates') {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCertificateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCertificateInput(e.target.value);
  };

  const addCertificate = () => {
    if (certificateInput.trim()) {
      setFormData({
        ...formData,
        certificates: [...formData.certificates, certificateInput.trim()],
      });
      setCertificateInput('');
    }
  };

  const removeCertificate = (index: number) => {
    setFormData({
      ...formData,
      certificates: formData.certificates.filter((_, i) => i !== index),
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Professor</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile">Profile</Label>
            <Textarea
              id="profile"
              name="profile"
              value={formData.profile}
              onChange={handleChange}
              required
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificates">Certificates</Label>
            <div className="flex space-x-2">
              <Input
                type="text"
                id="certificates"
                value={certificateInput}
                onChange={handleCertificateChange}
                placeholder="Enter the name of the certificate"
              />
              <Button type="button" onClick={addCertificate}>
                Add
              </Button>
            </div>
          </div>

          {formData.certificates.length > 0 && (
            <div className="space-y-2">
              <Label>Added Certificates</Label>
              <div className="flex flex-wrap gap-2">
                {formData.certificates.map((cert, index) => (
                  <Badge key={index} variant="secondary" className="text-sm py-1 px-2">
                    {cert}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-2 text-muted-foreground hover:text-foreground"
                      onClick={() => removeCertificate(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full">
            Create Professor
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

