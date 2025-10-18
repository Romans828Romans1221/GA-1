import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, ArrowLeft, LogOut, Shield, FileCheck, AlertTriangle } from "lucide-react";
import type { ComplianceItem } from "@shared/schema";

interface ComplianceSection {
  id: string;
  category: string;
  items: {
    name: string;
    status: "pending" | "completed" | "requires_attention";
    notes: string;
  }[];
}

const EHP_SECTIONS: ComplianceSection[] = [
  {
    id: "environmental",
    category: "Environmental Assessment",
    items: [
      { name: "Endangered Species Act Review", status: "pending", notes: "" },
      { name: "Wetlands Assessment", status: "pending", notes: "" },
      { name: "Floodplain Management Review", status: "pending", notes: "" },
      { name: "Coastal Zone Management Consistency", status: "pending", notes: "" },
    ]
  },
  {
    id: "historic",
    category: "Historic Preservation",
    items: [
      { name: "National Register of Historic Places Check", status: "pending", notes: "" },
      { name: "Section 106 Review", status: "pending", notes: "" },
      { name: "Archaeological Resources Assessment", status: "pending", notes: "" },
    ]
  },
  {
    id: "hazmat",
    category: "Hazardous Materials",
    items: [
      { name: "Phase I Environmental Site Assessment", status: "pending", notes: "" },
      { name: "Asbestos and Lead-Based Paint Review", status: "pending", notes: "" },
      { name: "Underground Storage Tank Check", status: "pending", notes: "" },
    ]
  },
  {
    id: "regulatory",
    category: "Regulatory Compliance",
    items: [
      { name: "Clean Air Act Compliance", status: "pending", notes: "" },
      { name: "Clean Water Act Compliance", status: "pending", notes: "" },
      { name: "Local Zoning and Land Use Review", status: "pending", notes: "" },
    ]
  }
];

export default function Compliance() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: complianceItems = [], isLoading: complianceLoading } = useQuery<ComplianceItem[]>({
    queryKey: ['/api/compliance'],
    enabled: isAuthenticated,
  });

  const createComplianceMutation = useMutation({
    mutationFn: async (data: { category: string; itemName: string; status: string; notes?: string }) => {
      const res = await apiRequest("POST", "/api/compliance", data);
      return await res.json() as ComplianceItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/compliance'] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Failed to Update",
        description: error.message || "An error occurred while updating compliance.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading || !isAuthenticated) {
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

  const getItemFromBackend = (category: string, itemName: string) => {
    return complianceItems.find(
      item => item.category === category && item.itemName === itemName
    );
  };

  const handleToggleItem = (category: string, itemName: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    const existingItem = getItemFromBackend(category, itemName);
    
    createComplianceMutation.mutate({
      category,
      itemName,
      status: newStatus,
      notes: existingItem?.notes || "",
    });
  };

  const handleUpdateNotes = (category: string, itemName: string, notes: string, currentStatus: string) => {
    createComplianceMutation.mutate({
      category,
      itemName,
      status: currentStatus,
      notes,
    });
  };

  const getTotalItems = () => {
    return EHP_SECTIONS.reduce((sum, section) => sum + section.items.length, 0);
  };

  const getCompletedItems = () => {
    let count = 0;
    EHP_SECTIONS.forEach(section => {
      section.items.forEach(item => {
        const backendItem = getItemFromBackend(section.category, item.name);
        if (backendItem?.status === "completed") {
          count++;
        }
      });
    });
    return count;
  };

  const totalItems = getTotalItems();
  const completedItems = getCompletedItems();
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const getStatusVariant = (category: string, itemName: string) => {
    const backendItem = getItemFromBackend(category, itemName);
    const status = backendItem?.status || "pending";
    
    if (status === "completed") return "default";
    if (status === "requires_attention") return "destructive";
    return "secondary";
  };

  const getStatusLabel = (category: string, itemName: string) => {
    const backendItem = getItemFromBackend(category, itemName);
    const status = backendItem?.status || "pending";
    
    if (status === "completed") return "Completed";
    if (status === "requires_attention") return "Attention Required";
    return "Pending";
  };

  const isItemChecked = (category: string, itemName: string) => {
    const backendItem = getItemFromBackend(category, itemName);
    return backendItem?.status === "completed";
  };

  const getItemNotes = (category: string, itemName: string) => {
    const backendItem = getItemFromBackend(category, itemName);
    return backendItem?.notes || "";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              data-testid="button-back-dashboard"
              onClick={() => setLocation('/')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Building2 className="w-8 h-8 text-primary" />
              <span className="text-xl font-semibold">EHP Pre-Screening</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="w-9 h-9">
              <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
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

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Card */}
        <Card className="p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Environmental & Historic Preservation Review</h2>
              <p className="text-muted-foreground">
                Complete all required compliance checks for flood mitigation grants
              </p>
            </div>
            <Shield className="w-12 h-12 text-primary" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-2xl font-semibold">{completedItems} / {totalItems}</p>
                </div>
                <Badge variant={progressPercent === 100 ? "default" : "secondary"}>
                  {progressPercent}% Complete
                </Badge>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="font-semibold">{completedItems}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className="font-semibold">{totalItems - completedItems}</p>
                  </div>
                </div>
              </div>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </Card>

        {/* Compliance Sections */}
        <div className="space-y-6">
          {complianceLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-6 w-48 mb-4" />
                  <div className="space-y-4">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="flex items-start gap-4">
                        <Skeleton className="h-5 w-5 mt-1" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-64 mb-2" />
                          <Skeleton className="h-20 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </>
          ) : (
            EHP_SECTIONS.map(section => (
              <Card key={section.id} className="p-6" data-testid={`section-${section.id}`}>
                <h3 className="text-lg font-semibold mb-4">{section.category}</h3>
                <div className="space-y-4">
                  {section.items.map((item, idx) => {
                    const backendItem = getItemFromBackend(section.category, item.name);
                    const currentStatus = backendItem?.status || "pending";
                    
                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-4 p-4 rounded-lg bg-muted/30"
                        data-testid={`item-${section.id}-${idx}`}
                      >
                        <Checkbox
                          checked={isItemChecked(section.category, item.name)}
                          onCheckedChange={() => handleToggleItem(section.category, item.name, currentStatus)}
                          data-testid={`checkbox-${section.id}-${idx}`}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium">{item.name}</p>
                            <Badge variant={getStatusVariant(section.category, item.name)}>
                              {getStatusLabel(section.category, item.name)}
                            </Badge>
                          </div>
                          <Textarea
                            placeholder="Add notes, findings, or required actions..."
                            value={getItemNotes(section.category, item.name)}
                            onChange={(e) => handleUpdateNotes(section.category, item.name, e.target.value, currentStatus)}
                            data-testid={`textarea-${section.id}-${idx}`}
                            className="min-h-[80px]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
