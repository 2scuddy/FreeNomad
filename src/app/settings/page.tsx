import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { UserSettingsForm } from "@/components/user-settings-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Settings, User, Bell, Shield, Palette } from "lucide-react";

export default async function SettingsPage() {
  try {
    // Require authentication
    const user = await requireAuth();

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Settings className="h-6 w-6 mr-2 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center p-2 rounded-md bg-primary/10 text-primary">
                  <User className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Profile</span>
                </div>
                <div className="flex items-center p-2 rounded-md text-muted-foreground hover:bg-muted cursor-pointer">
                  <Bell className="h-4 w-4 mr-2" />
                  <span className="text-sm">Notifications</span>
                </div>
                <div className="flex items-center p-2 rounded-md text-muted-foreground hover:bg-muted cursor-pointer">
                  <Shield className="h-4 w-4 mr-2" />
                  <span className="text-sm">Privacy</span>
                </div>
                <div className="flex items-center p-2 rounded-md text-muted-foreground hover:bg-muted cursor-pointer">
                  <Palette className="h-4 w-4 mr-2" />
                  <span className="text-sm">Appearance</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and profile details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserSettingsForm user={user} />
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what notifications you would like to receive.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive email updates about new cities and features
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Coming soon
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Push Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Get notified about community updates and reviews
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Coming soon
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Weekly Digest</h4>
                      <p className="text-sm text-muted-foreground">
                        Weekly summary of new destinations and nomad insights
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Coming soon
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>
                  Manage your privacy settings and account security.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Profile Visibility</h4>
                      <p className="text-sm text-muted-foreground">
                        Control who can see your profile and reviews
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Coming soon
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Data Export</h4>
                      <p className="text-sm text-muted-foreground">
                        Download a copy of your data
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Coming soon
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Account Deletion</h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Coming soon
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the look and feel of the application.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Theme</h4>
                      <p className="text-sm text-muted-foreground">
                        Choose between light and dark mode
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Coming soon
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Language</h4>
                      <p className="text-sm text-muted-foreground">
                        Select your preferred language
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      English (US)
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Currency</h4>
                      <p className="text-sm text-muted-foreground">
                        Default currency for cost displays
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">USD ($)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    // Redirect to login if not authenticated
    redirect("/auth/login?callbackUrl=/settings&error=AuthenticationRequired");
  }
}
