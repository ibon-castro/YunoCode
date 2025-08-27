import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendInvitationEmail } from "@/lib/emailService";
import { 
  Users, 
  Mail, 
  Plus, 
  X, 
  UserPlus,
  Crown,
  Shield,
  User as UserIcon
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  created_at: string;
  updated_at: string;
  invited_by?: string;
  invited_at: string;
  email?: string;
  profiles?: {
    email: string;
    display_name: string | null;
  };
}

interface ProjectOwner {
  user_id: string;
  role: 'owner';
  joined_at: string;
  profiles?: {
    email: string;
    display_name: string | null;
  };
}

interface ProjectInvitation {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  invited_by: string;
  project_id: string;
  token: string;
  accepted_at?: string;
}

interface ProjectMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

export const ProjectMembersModal = ({ 
  isOpen, 
  onClose, 
  projectId, 
  projectName 
}: ProjectMembersModalProps) => {
  const [members, setMembers] = useState<(ProjectMember | ProjectOwner)[]>([]);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadMembersAndInvitations();
      checkIfOwner();
    }
  }, [isOpen, projectId]);

  const checkIfOwner = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: project, error } = await supabase
        .from("projects")
        .select("user_id")
        .eq("id", projectId)
        .single();

      if (error) throw error;

      setIsOwner(project.user_id === user.id);
    } catch (error) {
      console.error("Error checking ownership:", error);
    }
  };

  const loadMembersAndInvitations = async () => {
    setIsLoading(true);
    try {
      console.log("Loading members for project:", projectId);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Current user:", user?.id);
      setCurrentUserId(user?.id || null);

      // Load project details to get owner
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("user_id, created_at")
        .eq("id", projectId)
        .single();

      if (projectError) {
        console.error("Project error:", projectError);
        throw projectError;
      }
      console.log("Project data:", projectData);

      // Get owner email - if it's current user, use their email, otherwise we'll need to get it from members table
      let ownerEmail = '';
      if (user && user.id === projectData.user_id) {
        ownerEmail = user.email || 'Email not available';
      }

      // Load members
      const { data: membersData, error: membersError } = await supabase
        .from("project_members")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      console.log("Members query result:", { membersData, membersError });

      if (membersError) throw membersError;

      // If owner email is not set, try to get it from members table (if owner is also in members)
      if (!ownerEmail) {
        const ownerMember = membersData?.find(m => m.user_id === projectData.user_id);
        ownerEmail = (ownerMember as any)?.email || 'Email not available';
      }

      // Combine owner and members, ensuring owner appears first
      const allMembers: (ProjectMember | ProjectOwner)[] = [
        {
          user_id: projectData.user_id,
          role: 'owner' as const,
          joined_at: projectData.created_at,
          profiles: {
            email: ownerEmail,
            display_name: null,
          },
        },
        ...(membersData || [])
          .filter(member => member.user_id !== projectData.user_id)
          .map(member => ({
            ...member,
            profiles: {
              email: (member as any).email || 'Email not available',
              display_name: null,
            }
          }))
      ];

      setMembers(allMembers);

      // Load pending invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from("project_invitations")
        .select("*")
        .eq("project_id", projectId)
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (invitationsError) throw invitationsError;

      setInvitations(invitationsData || []);
    } catch (error) {
      console.error("Error loading members and invitations:", error);
      toast({
        title: "Error",
        description: "Failed to load members. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Input required",
        description: "Please enter an email address or username to invite.",
        variant: "destructive",
      });
      return;
    }

    const input = inviteEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(input);
    
    // Get current user to prevent self-invitation
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to send invitations.",
        variant: "destructive",
      });
      return;
    }

    let targetEmail = '';
    
    if (isEmail) {
      targetEmail = input.toLowerCase();
      // Check if user is trying to invite themselves
      if (targetEmail === user.email) {
        toast({
          title: "Invalid invitation",
          description: "You cannot invite yourself to the project.",
          variant: "destructive",
        });
        return;
      }
    } else {
      // It's a username, look up the email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, user_id')
        .eq('username', input)
        .maybeSingle();
        
      if (profileError || !profile) {
        toast({
          title: "User not found",
          description: "No user found with that username.",
          variant: "destructive",
        });
        return;
      }
      
      // Check if user is trying to invite themselves
      if (profile.user_id === user.id) {
        toast({
          title: "Invalid invitation",
          description: "You cannot invite yourself to the project.",
          variant: "destructive",
        });
        return;
      }
      
      targetEmail = profile.email;
    }

    setIsInviting(true);
    try {
      // Insert invitation first to get the token
      const { data: invitationData, error } = await supabase
        .from("project_invitations")
        .insert({
          project_id: projectId,
          email: targetEmail,
          role: 'member',
          invited_by: user.id,
          inviter_email: user.email,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already invited",
            description: "This email has already been invited to the project.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      // Send invitation email using EmailJS
      try {        
        // Get current user's profile to use username
        const { data: currentUserProfile } = await supabase
          .from('profiles')
          .select('username, email')
          .eq('user_id', user.id)
          .maybeSingle();

        const emailResult = await sendInvitationEmail({
          email: targetEmail,
          projectName: projectName,
          inviterName: user.email || 'Someone',
          inviterUsername: currentUserProfile?.username,
          invitationToken: invitationData.token,
        });

        if (!emailResult.success) {
          console.error("Error sending invitation email:", emailResult.error);
          toast({
            title: "Email notification failed",
            description: "Invitation created but email could not be sent. Please check your EmailJS configuration.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Invitation sent",
            description: `Invitation email sent to ${targetEmail}`,
          });
        }
      } catch (emailError) {
        console.error("Error sending invitation email:", emailError);
        toast({
          title: "Invitation created",
          description: `Invitation created for ${targetEmail}, but email notification failed to send.`,
          variant: "default",
        });
      }

      setInviteEmail("");
      loadMembersAndInvitations();
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from("project_invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;

      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled.",
      });

      loadMembersAndInvitations();
    } catch (error) {
      console.error("Error cancelling invitation:", error);
      toast({
        title: "Error",
        description: "Failed to cancel invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-amber-500" />;
      default:
        return <UserIcon className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleTransferOwnership = async (newOwnerId: string) => {
    try {
      const { error } = await (supabase as any).rpc('transfer_project_ownership', {
        p_project_id: projectId,
        p_new_owner_id: newOwnerId
      });

      if (error) throw error;

      toast({
        title: "Ownership transferred",
        description: "Project ownership has been successfully transferred.",
      });

      // Refresh both members list and ownership status
      await Promise.all([
        loadMembersAndInvitations(),
        checkIfOwner()
      ]);
    } catch (error) {
      console.error("Error transferring ownership:", error);
      toast({
        title: "Error",
        description: "Failed to transfer ownership. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Members - {projectName}
          </DialogTitle>
          <DialogDescription>
            Invite team members to collaborate on this project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite Section - Only show for project owners */}
          {isOwner && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Invite New Member</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email address or username"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleInvite()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleInvite} 
                  disabled={isInviting}
                  className="flex items-center gap-2"
                >
                  {isInviting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Invite
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Current Members */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Current Members ({members.length})</h3>
            {isLoading ? (
              <p className="text-muted-foreground">Loading members...</p>
            ) : members.length === 0 ? (
              <p className="text-muted-foreground">No members found.</p>
            ) : (
              <div className="space-y-2">
                {members.map((member, index) => (
                  <div key={'id' in member ? member.id : `owner-${member.user_id}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                       <Avatar className="h-8 w-8">
                         <AvatarFallback>
                           {member.user_id === currentUserId ? 'M' : (member.profiles?.email?.charAt(0).toUpperCase() || 'U')}
                         </AvatarFallback>
                       </Avatar>
                       <div>
                         <p className="font-medium">
                           {member.user_id === currentUserId ? 'Me' : member.profiles?.email}
                         </p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(member.role)}
                      <Badge className={getRoleColor(member.role)}>
                        {member.role}
                      </Badge>
                      {/* Show transfer ownership option for members when current user is owner */}
                      {member.role === 'member' && currentUserId && members.some(m => m.role === 'owner' && m.user_id === currentUserId) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTransferOwnership(member.user_id)}
                          className="text-xs"
                        >
                          Make Owner
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pending Invitations ({invitations.length})</h3>
              <div className="space-y-2">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Expires {new Date(invitation.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleColor(invitation.role)}>
                        {invitation.role}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelInvitation(invitation.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};