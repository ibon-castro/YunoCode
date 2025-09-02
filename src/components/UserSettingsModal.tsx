import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Camera, Loader2 } from "lucide-react";

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  notification_preferences: {
    email_notifications: boolean;
    push_notifications: boolean;
    project_updates: boolean;
  };
  theme_preference: string;
  language_preference: string;
}

export const UserSettingsModal = ({ isOpen, onClose, user }: UserSettingsModalProps) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadProfile();
    }
  }, [isOpen, user]);

  const loadProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      
      // Parse notification preferences if they exist
      const parsedProfile = {
        ...data,
        notification_preferences: data.notification_preferences 
          ? (typeof data.notification_preferences === 'string' 
              ? JSON.parse(data.notification_preferences)
              : data.notification_preferences)
          : { email_notifications: true, push_notifications: true, project_updates: true }
      } as Profile;
      
      setProfile(parsedProfile);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setAvatarFile(file);
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;

    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, { 
        upsert: true,
        contentType: avatarFile.type 
      });

    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrl.publicUrl;
  };

  const handleSave = async () => {
    if (!profile || !user) return;

    setIsSaving(true);
    try {
      let avatarUrl = profile.avatar_url;

      // Upload new avatar if selected
      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: profile.display_name,
          avatar_url: avatarUrl,
          bio: profile.bio,
          location: profile.location,
          website: profile.website,
          notification_preferences: profile.notification_preferences,
          theme_preference: profile.theme_preference,
          language_preference: profile.language_preference,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your profile has been updated successfully",
      });

      // Clean up preview
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
      }
      setAvatarFile(null);
      
      onClose();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>
                  Upload a profile picture that will be visible to other users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage 
                      src={avatarPreview || profile.avatar_url || ""} 
                      alt="Profile picture" 
                    />
                    <AvatarFallback className="text-lg">
                      {profile.display_name?.charAt(0) || profile.email?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                        <Camera className="h-4 w-4" />
                        <span>Change Picture</span>
                      </div>
                    </Label>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      JPG, PNG or GIF. Max size 5MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      value={profile.display_name || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, display_name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profile.username || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Username cannot be changed after account creation.
                    </p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, bio: e.target.value })
                    }
                    placeholder="Tell us a bit about yourself..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, location: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={profile.website || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, website: e.target.value })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Email cannot be changed here. Use your authentication provider settings.
                  </p>
                </div>
                <div>
                  <Label htmlFor="theme">Theme Preference</Label>
                  <Select
                    value={profile.theme_preference}
                    onValueChange={(value) =>
                      setProfile({ ...profile, theme_preference: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={profile.language_preference}
                    onValueChange={(value) =>
                      setProfile({ ...profile, language_preference: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified about project activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={profile.notification_preferences.email_notifications}
                    onCheckedChange={(checked) =>
                      setProfile({
                        ...profile,
                        notification_preferences: {
                          ...profile.notification_preferences,
                          email_notifications: checked,
                        },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};