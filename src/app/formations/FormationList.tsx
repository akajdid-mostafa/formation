"use client";

import { useEffect, useState } from "react";
import { formatDescription } from "@/lib/formatDescription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import { Formation, Professor } from "@/types"; // Assuming you have a types file
import UpdateFormation from "./UpdateFormation"; // Import the UpdateFormation component

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



export default function FormationList() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [formattedDescriptions, setFormattedDescriptions] = useState<{ [key: number]: string }>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formationToDelete, setFormationToDelete] = useState<number | null>(null);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    const response = await fetch("/api/formations");
    const data = await response.json();
    setFormations(data);

    const descriptions: { [key: number]: string } = {};
    for (const formation of data) {
      descriptions[formation.id] = await formatDescription(formation.description);
    }
    setFormattedDescriptions(descriptions);
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
                  <strong>Duration:</strong> {formation.duration}
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
                    <div key={professor.id} className="flex items-center space-x-2">
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
                <Button onClick={() => openUpdateModal(formation)} variant="outline">
                  Update
                </Button>
                <Button onClick={() => deleteFormation(formation.id)} variant="destructive">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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

      {selectedFormation && (
        <UpdateFormation
          formation={selectedFormation}
          onClose={() => setSelectedFormation(null)}
          onFormationUpdated={fetchFormations}
        />
      )}
    </div>
  );
}