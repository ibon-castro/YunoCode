import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Tables } from "@/integrations/supabase/types";
import { ProjectCard } from "./ProjectCard";
import { CreateProjectModal } from "./CreateProjectModal";
import { ThemeToggle } from "./ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  Settings, 
  LogOut, 
  User as UserIcon,
  Filter,
  Mail
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserInvitationsModal } from "./UserInvitationsModal";
import { UserSettingsModal } from "./UserSettingsModal";

type Project = Tables<'projects'>;
type Profile = Tables<'profiles'>;

export const AuthenticatedView = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pendingInvitationsCount, setPendingInvitationsCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setUserProfile(profile);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadProjects();
      loadPendingInvitationsCount();
    }
  }, [user]);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, selectedTags]);

  const loadProjects = async () => {
    try {
      // Get projects where user is owner OR a member
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .or(`user_id.eq.${user?.id},id.in.(${await getUserProjectIds()})`)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      setProjects(data || []);
      
      // Extract all unique tags
      const tags = new Set<string>();
      data?.forEach(project => {
        project.tags?.forEach((tag: string) => tags.add(tag));
      });
      setAllTags(Array.from(tags));
    } catch (error) {
      console.error("Error loading projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUserProjectIds = async (): Promise<string> => {
    if (!user?.id) return '';
    
    const { data } = await supabase
      .from("project_members")
      .select("project_id")
      .eq("user_id", user.id);
      
    return data?.map(p => p.project_id).join(',') || '';
  };

  const loadPendingInvitationsCount = async () => {
    if (!user?.email) return;
    
    try {
      const { count, error } = await supabase
        .from("project_invitations")
        .select("*", { count: 'exact', head: true })
        .eq("email", user.email)
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString());

      if (error) throw error;

      setPendingInvitationsCount(count || 0);
    } catch (error) {
      console.error("Error loading invitations count:", error);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.tags && project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(project =>
        project.tags && selectedTags.every(tag => project.tags!.includes(tag))
      );
    }

    setFilteredProjects(filtered);
  };

  const handleProjectCreated = (project: Project) => {
    if (editingProject) {
      // Update existing project
      setProjects(projects.map(p => p.id === project.id ? project : p));
      setEditingProject(null);
    } else {
      // Add new project
      setProjects([project, ...projects]);
    }
    
    // Update tags list
    const tags = new Set(allTags);
    project.tags?.forEach(tag => tags.add(tag));
    setAllTags(Array.from(tags));
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowCreateModal(true);
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setProjects(projects.filter(p => p.id !== id));
      toast({
        title: "Project deleted",
        description: "Your project has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleQuitProject = async (id: string) => {
    try {
      if (!user?.id) return;

      const { error } = await supabase
        .from("project_members")
        .delete()
        .eq("project_id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setProjects(projects.filter(p => p.id !== id));
      toast({
        title: "Left project",
        description: "You have successfully left the project.",
      });
    } catch (error) {
      console.error("Error quitting project:", error);
      toast({
        title: "Error",
        description: "Failed to leave project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <img 
              src="/logo-black.svg" 
              alt="Logo" 
              className="h-8 w-auto dark:hidden"
            />
            <img 
              src="/logo-white.svg" 
              alt="Logo" 
              className="h-8 w-auto hidden dark:block"
            />
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile?.avatar_url || ""} />
                    <AvatarFallback>
                      {userProfile?.display_name?.charAt(0).toUpperCase() || 
                       userProfile?.username?.charAt(0).toUpperCase() || 
                       user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-background border" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{userProfile?.display_name || userProfile?.username || user.email}</p>
                    {userProfile?.display_name && userProfile?.username && (
                      <p className="text-xs text-muted-foreground">@{userProfile.username}</p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowSettings(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Filter Toggle Button */}
              {allTags.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={selectedTags.length > 0 ? "border-primary" : ""}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {selectedTags.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {selectedTags.length}
                    </Badge>
                  )}
                </Button>
              )}

              {/* Invitations Button */}
              <Button
                variant="outline"
                onClick={() => setShowInvitations(true)}
                className="relative"
              >
                <Mail className="mr-2 h-4 w-4" />
                Invitations
                {pendingInvitationsCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {pendingInvitationsCount}
                  </Badge>
                )}
              </Button>

              {/* Create Project Button */}
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </div>
          </div>

          {/* Tag Filters - Only show when toggled */}
          {showFilters && allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium text-muted-foreground mr-2">Filter by tags:</span>
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleTagFilter(tag)}
                >
                  {tag}
                </Badge>
              ))}
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTags([])}
                  className="ml-2 h-6 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">
              {projects.length === 0 ? "No projects yet" : "No projects found"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {projects.length === 0 
                ? "Create your first project to get started"
                : "Try adjusting your search or filters"
              }
            </p>
            {projects.length === 0 && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
                onQuit={handleQuitProject}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingProject(null);
        }}
        onProjectCreated={handleProjectCreated}
        editingProject={editingProject}
      />

      {/* User Invitations Modal */}
      <UserInvitationsModal
        isOpen={showInvitations}
        onClose={() => setShowInvitations(false)}
        onInvitationUpdate={() => {
          loadProjects();
          loadPendingInvitationsCount();
        }}
      />

      {/* User Settings Modal */}
      <UserSettingsModal
        isOpen={showSettings}
        onClose={() => {
          setShowSettings(false);
          // Reload profile to update avatar and other changes
          if (user) {
            supabase
              .from('profiles')
              .select('*')
              .eq('user_id', user.id)
              .single()
              .then(({ data }) => setUserProfile(data));
          }
        }}
        user={user}
      />
    </div>
  );
};