// src/app/hr/positions/Positions.tsx
"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/SessionContext";
import { Card } from "~/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

// Import components
import { AssignmentsList } from "../assignments/AssignmentsList";
import { PositionsList } from "./PositionsList";
import { PositionDialog } from "./PositionDialog";
import { CareerPathPositionHeader } from "./CareerPathPositionHeader";
import { usePositions } from "../hooks/usePositions";

interface PositionsProps {
  selectedPathId: string | null;
}

export default function Positions({ selectedPathId }: PositionsProps) {
  const { currentOrgId } = useSession();
  const [activeTab, setActiveTab] = useState("assigned-positions");
  const [isAssigning, setIsAssigning] = useState(false);
  
  // Dialog state for position management
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

  // Get all career paths
  const careerPathsQuery = api.career.getPaths.useQuery(
    { organizationId: currentOrgId! },
    { enabled: !!currentOrgId }
  );

  // Fetch the specific career path details if one is selected
  const pathQuery = api.career.getPathById.useQuery(
    { id: selectedPathId! },
    {
      enabled: !!selectedPathId,
      staleTime: 1000 * 60 * 5 // 5 minutes
    }
  );

  // Fetch positions assigned to the selected path
  const pathPositionsQuery = api.position.getByCareerPath.useQuery(
    {
      organizationId: currentOrgId!,
      careerPathId: selectedPathId!
    },
    { enabled: !!currentOrgId && !!selectedPathId }
  );

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
    setIsAssigning(false);
  };

  const handlePathChange = (pathId: string) => {
    // This would need to be implemented in the parent component
    // For now, we'll just log it
    console.log("Change to path:", pathId);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // If no path is selected, show all positions
  if (!selectedPathId || !pathQuery.data) {
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
      <Card className="p-6">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full" />
          <span className="ml-2">Loading career path details...</span>
        </div>
      </Card>
    );
  }

  // If a path is selected and loaded, show the career path header and content
  return (
    <>
      <CareerPathPositionHeader
        selectedPath={pathQuery.data}
        availablePaths={careerPathsQuery.data || []}
        pathPositions={pathPositionsQuery.data || []}
        onPathChange={handlePathChange}
        onTabChange={handleTabChange}
        onAssignPosition={() => setIsAssigning(true)}
      />

      {/* Content based on active tab */}
      <div className="mt-4">
        {activeTab === "assigned-positions" ? (
          <AssignmentsList
            careerPathId={selectedPathId}
            pathName={pathQuery.data.name}
          />
        ) : activeTab === "create-positions" ? (
          <PositionsList
            positions={positions}
            isLoading={isLoading}
            onAddPosition={handleAddPosition}
            onEditPosition={handleEditPosition}
            onDeletePosition={handleDeletePrompt}
          />
        ) : null}
      </div>

      {/* Assign Position Dialog */}
      <Dialog open={isAssigning} onOpenChange={setIsAssigning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Position to Path</DialogTitle>
            <DialogDescription>
              Add a position to the "{pathQuery.data.name}" career path
            </DialogDescription>
          </DialogHeader>
          {/* You would include your AssignPositionForm component here */}
        </DialogContent>
      </Dialog>

      {/* Position Management Dialogs */}
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