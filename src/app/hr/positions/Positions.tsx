// src/app/hr/positions/Positions.tsx
"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/SessionContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { toast } from "sonner";

// Import components
import { AssignmentsList } from "../assignments/AssignmentsList";
import { PositionsList } from "./PositionsList";
import { PositionDialog } from "./PositionDialog";
import { usePositions } from "../hooks/usePositions";

interface PositionsProps {
  selectedPathId: string | null;
}

export default function Positions({ selectedPathId }: PositionsProps) {
  const { currentOrgId } = useSession();
  const [pathName, setPathName] = useState<string>("");
  const [activeTab, setActiveTab] = useState("positions");
  
  // Dialog state
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Get positions data and operations
  const {
    positions,
    isLoading,
    error,
    deletePosition,
    isDeleting
  } = usePositions();

  // Fetch the specific career path details if one is selected
  const pathQuery = api.career.getPathById.useQuery(
    { id: selectedPathId! },
    {
      enabled: !!selectedPathId,
      staleTime: 1000 * 60 * 5 // 5 minutes
    }
  );

  // Update path name when data changes
  useEffect(() => {
    if (pathQuery.data) {
      setPathName(pathQuery.data.name);
    }
  }, [pathQuery.data]);

  // Handler functions
  const handleAddPosition = () => {
    setIsCreating(true);
  };

  const handleEditPosition = (id: string) => {
    setEditingId(id);
  };

  const handleDeletePrompt = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (!confirmDeleteId) return;

    deletePosition({ id: confirmDeleteId }, {
      onSuccess: () => {
        toast.success("Position deleted successfully");
        setConfirmDeleteId(null);
      },
      onError: (error) => {
        toast.error(`Failed to delete: ${error.message}`);
      }
    });
  };

  const handleDialogComplete = () => {
    setIsCreating(false);
    setEditingId(null);
  };

  // If no path is selected, show all positions
  if (!selectedPathId) {
    return (
      <>
        <PositionsList
          positions={positions}
          isLoading={isLoading}
          onAddPosition={handleAddPosition}
          onEditPosition={handleEditPosition}
          onDeletePosition={handleDeletePrompt}
        />

        {/* Create/Edit Position Dialogs */}
        <PositionDialog
          open={isCreating}
          mode="create"
          onOpenChange={setIsCreating}
          onComplete={handleDialogComplete}
        />

        <PositionDialog
          open={!!editingId}
          mode="edit"
          positionId={editingId || undefined}
          onOpenChange={(open) => !open && setEditingId(null)}
          onComplete={handleDialogComplete}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={!!confirmDeleteId}
          onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this position? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-background rounded-full" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // If path is selected but still loading
  if (pathQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Loading...</CardTitle>
          <CardDescription>
            Retrieving career path details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // If path is selected but there was an error
  if (pathQuery.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-destructive">Error</CardTitle>
          <CardDescription>
            Failed to load career path details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-destructive/10 rounded-md text-destructive">
            {pathQuery.error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render career path details with tabs
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{pathName}</CardTitle>
              <CardDescription>
                Career path and position management
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="positions">Assigned Positions</TabsTrigger>
          <TabsTrigger value="create-positions">Create Positions</TabsTrigger>
          <TabsTrigger value="skills" disabled>Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="mt-4">
          <AssignmentsList 
            careerPathId={selectedPathId}
            pathName={pathName}
          />
        </TabsContent>

        <TabsContent value="create-positions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Position Management</CardTitle>
              <CardDescription>
                Create and manage position templates that can be assigned to career paths
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PositionsList
                positions={positions}
                isLoading={isLoading}
                onAddPosition={handleAddPosition}
                onEditPosition={handleEditPosition}
                onDeletePosition={handleDeletePrompt}
              />
            </CardContent>
          </Card>

          {/* Create/Edit Position Dialogs */}
          <PositionDialog
            open={isCreating}
            mode="create"
            onOpenChange={setIsCreating}
            onComplete={handleDialogComplete}
          />

          <PositionDialog
            open={!!editingId}
            mode="edit"
            positionId={editingId || undefined}
            onOpenChange={(open) => !open && setEditingId(null)}
            onComplete={handleDialogComplete}
          />

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={!!confirmDeleteId}
            onOpenChange={(open) => !open && setConfirmDeleteId(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this position? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setConfirmDeleteId(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-background rounded-full" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}