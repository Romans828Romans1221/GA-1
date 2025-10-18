import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, FileText, ClipboardCheck, Users, LogOut } from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-primary" />
            <span className="text-xl font-semibold">Property Grant Analyzer</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium" data-testid="text-user-name">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || "User"}
                </p>
                <p className="text-xs text-muted-foreground" data-testid="text-user-email">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              data-testid="button-logout"
              onClick={() => window.location.href = '/api/logout'}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-semibold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">
            Select a module to begin your grant analysis workflow
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Technical Service Page Card */}
          <Card
            className="p-6 hover-elevate active-elevate-2 cursor-pointer transition-all"
            data-testid="card-technical-service"
            onClick={() => setLocation('/technical-service')}
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Technical Service Page</h2>
                <p className="text-sm text-muted-foreground">
                  Analyze properties with address/coordinate input. Generate comprehensive reports including flood zones, elevations, and census data.
                </p>
              </div>
              <div className="pt-2">
                <Button variant="ghost" className="w-full justify-start px-0" data-testid="button-open-technical-service">
                  Open Technical Service →
                </Button>
              </div>
            </div>
          </Card>

          {/* Compliance Card */}
          <Card
            className="p-6 hover-elevate active-elevate-2 cursor-pointer transition-all"
            data-testid="card-compliance"
            onClick={() => setLocation('/compliance')}
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6 text-chart-2" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Compliance</h2>
                <p className="text-sm text-muted-foreground">
                  Conduct Environmental Health and Safety (EHP) pre-screens and regulatory reviews for early compliance tracking.
                </p>
              </div>
              <div className="pt-2">
                <Button variant="ghost" className="w-full justify-start px-0" data-testid="button-open-compliance">
                  Open Compliance →
                </Button>
              </div>
            </div>
          </Card>

          {/* Queue Management Card */}
          <Card
            className="p-6 hover-elevate active-elevate-2 cursor-pointer transition-all"
            data-testid="card-queue-management"
            onClick={() => setLocation('/queue-management')}
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-chart-3" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Queue Management</h2>
                <p className="text-sm text-muted-foreground">
                  Manage team tasks, assign responsibilities, and track project status through the grant analysis workflow.
                </p>
              </div>
              <div className="pt-2">
                <Button variant="ghost" className="w-full justify-start px-0" data-testid="button-open-queue-management">
                  Open Queue Management →
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Stats Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Session Properties</p>
              <p className="text-2xl font-semibold">0</p>
              <p className="text-xs text-muted-foreground">Analyzed this session</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Active Tasks</p>
              <p className="text-2xl font-semibold">0</p>
              <p className="text-xs text-muted-foreground">In progress</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Compliance Items</p>
              <p className="text-2xl font-semibold">0</p>
              <p className="text-xs text-muted-foreground">Pending review</p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
