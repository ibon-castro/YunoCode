import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Check, 
  X, 
  Clock
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProjectInvitation {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  created_at: string;
  project_id: string;
  token: string;
  invited_by: string;
  inviter_email?: string;
  projects: {
    name: string;
  };
}

interface UserInvitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvitationUpdate?: () => void;
}

export const UserInvitationsModal = ({ 
  isOpen, 
  onClose,
  onInvitationUpdate
}: UserInvitationsModalProps) => {
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadInvitations();
    }
  }, [isOpen]);

  const loadInvitations = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      const { data, error } = await supabase
        .from("project_invitations")
        .select(`
          *,
          projects (
            name
          )
        `)
        .eq("email", user.email)
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      setInvitations(data || []);
    } catch (error) {
      console.error("Error loading invitations:", error);
      toast({
        title: "Error",
        description: "Failed to load invitations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitation: ProjectInvitation) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication error",
          description: "You must be logged in to accept invitations.",
          variant: "destructive",
        });
        return;
      }

      // Add user to project_members
      const { error: memberError } = await supabase
        .from("project_members")
        .insert({
          project_id: invitation.project_id,
          user_id: user.id,
          role: invitation.role,
          email: user.email,
          invited_by: invitation.invited_by,
          joined_at: new Date().toISOString(),
        });

      if (memberError) throw memberError;

      // Update invitation as accepted
      const { error: inviteError } = await supabase
        .from("project_invitations")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invitation.id);

      if (inviteError) throw inviteError;

      toast({
        title: "Invitation accepted",
        description: `You've joined ${invitation.projects.name}!`,
      });

      loadInvitations();
      onInvitationUpdate?.();
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast({
        title: "Error",
        description: "Failed to accept invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeclineInvitation = async (invitation: ProjectInvitation) => {
    try {
      const { error } = await supabase
        .from("project_invitations")
        .delete()
        .eq("id", invitation.id);

      if (error) throw error;

      toast({
        title: "Invitation declined",
        description: `You've declined the invitation to ${invitation.projects.name}.`,
      });

      loadInvitations();
      onInvitationUpdate?.();
    } catch (error) {
      console.error("Error declining invitation:", error);
      toast({
        title: "Error",
        description: "Failed to decline invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Project Invitations
          </DialogTitle>
          <DialogDescription>
            Accept or decline invitations to join projects.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading invitations...</p>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending invitations</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-semibold">{invitation.projects.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      You've been invited as a <Badge variant="outline" className="ml-1">{invitation.role}</Badge>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Invited by {invitation.inviter_email || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Expires {new Date(invitation.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptInvitation(invitation)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeclineInvitation(invitation)}
                      className="border-red-200 hover:bg-red-50 hover:border-red-300"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};