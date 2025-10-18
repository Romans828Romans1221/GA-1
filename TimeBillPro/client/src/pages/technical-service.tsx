import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, MapPin, Home, Ruler, Waves, TrendingUp, Users as UsersIcon, ArrowLeft, LogOut, Search, Loader2 } from "lucide-react";
import type { PropertyAnalysis } from "@shared/schema";

export default function TechnicalService() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [selectedReport, setSelectedReport] = useState<PropertyAnalysis | null>(null);

  const { data: properties = [], isLoading: propertiesLoading } = useQuery<PropertyAnalysis[]>({
    queryKey: ['/api/properties'],
    enabled: isAuthenticated,
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data: { address?: string; latitude?: string; longitude?: string }) => {
      const res = await apiRequest("POST", "/api/properties/analyze", data);
      return await res.json() as PropertyAnalysis;
    },
    onSuccess: (newProperty: PropertyAnalysis) => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      setSelectedReport(newProperty);
      setAddress("");
      setLatitude("");
      setLongitude("");
      toast({
        title: "Analysis Complete",
        description: "Property report generated successfully.",
      });
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
        title: "Analysis Failed",
        description: error.message || "Failed to analyze property. Please try again.",
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

  useEffect(() => {
    if (properties.length > 0 && !selectedReport) {
      setSelectedReport(properties[0]);
    }
  }, [properties]);

  if (authLoading || !isAuthenticated) {
    return null;
  }

  const handleAnalyze = async () => {
    if (!address && (!latitude || !longitude)) {
      toast({
        title: "Input Required",
        description: "Please provide either an address or both latitude and longitude.",
        variant: "destructive",
      });
      return;
    }

    analyzeMutation.mutate({ address, latitude, longitude });
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getFloodZoneColor = (zone?: string | null) => {
    if (!zone) return "secondary";
    if (zone === "X") return "secondary";
    if (zone.startsWith("V")) return "destructive";
    return "default";
  };

  const formatDecimal = (value: string | null | undefined, decimals: number = 2) => {
    if (!value) return null;
    return parseFloat(value).toFixed(decimals);
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
              <span className="text-xl font-semibold">Technical Service Page</span>
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
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Analysis Form */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Property Search</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Property Address</Label>
                  <Input
                    id="address"
                    data-testid="input-address"
                    placeholder="123 Main St, City, State ZIP"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={analyzeMutation.isPending}
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      data-testid="input-latitude"
                      placeholder="40.7128"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      disabled={analyzeMutation.isPending}
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      data-testid="input-longitude"
                      placeholder="-74.0060"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      disabled={analyzeMutation.isPending}
                      className="font-mono"
                    />
                  </div>
                </div>

                <Button
                  className="w-full"
                  data-testid="button-analyze"
                  onClick={handleAnalyze}
                  disabled={analyzeMutation.isPending}
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Analyze Property
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Session History */}
            {propertiesLoading ? (
              <Card className="p-6">
                <Skeleton className="h-4 w-32 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </Card>
            ) : properties.length > 0 ? (
              <Card className="p-6">
                <h3 className="text-sm font-semibold mb-4">Session History ({properties.length})</h3>
                <div className="space-y-2">
                  {properties.map((property) => (
                    <button
                      key={property.id}
                      data-testid={`button-report-${property.id}`}
                      onClick={() => setSelectedReport(property)}
                      className={`w-full text-left p-3 rounded-lg hover-elevate active-elevate-2 transition-all ${
                        selectedReport?.id === property.id ? 'bg-primary/10 border-2 border-primary' : 'border'
                      }`}
                    >
                      <p className="text-sm font-medium truncate">{property.address}</p>
                      <p className="text-xs text-muted-foreground">
                        {property.femaFloodZone && `Zone: ${property.femaFloodZone}`}
                      </p>
                    </button>
                  ))}
                </div>
              </Card>
            ) : null}
          </div>

          {/* Right: Property Report */}
          <div className="lg:col-span-2">
            {propertiesLoading ? (
              <Card className="p-6">
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-8" />
                <div className="grid md:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                  ))}
                </div>
              </Card>
            ) : selectedReport ? (
              <Card className="p-6">
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-2xl font-semibold">Property Analysis Report</h2>
                    <Badge variant={getFloodZoneColor(selectedReport.femaFloodZone)}>
                      Zone {selectedReport.femaFloodZone || "Unknown"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {selectedReport.address}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Coordinates */}
                  {selectedReport.latitude && selectedReport.longitude && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>Coordinates</span>
                      </div>
                      <p className="text-lg font-mono">
                        {formatDecimal(selectedReport.latitude, 6)}, {formatDecimal(selectedReport.longitude, 6)}
                      </p>
                    </div>
                  )}

                  {/* Ground Elevation */}
                  {selectedReport.groundElevation && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="w-4 h-4" />
                        <span>Ground Elevation</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {formatDecimal(selectedReport.groundElevation)} ft
                      </p>
                    </div>
                  )}

                  {/* Estimated Home Price */}
                  {selectedReport.estimatedHomePrice && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Home className="w-4 h-4" />
                        <span>Estimated Home Price</span>
                      </div>
                      <p className="text-lg font-semibold">
                        ${parseFloat(selectedReport.estimatedHomePrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  )}

                  {/* Property Square Footage */}
                  {selectedReport.propertySquareFootage && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Ruler className="w-4 h-4" />
                        <span>Property Square Footage</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {selectedReport.propertySquareFootage.toLocaleString()} sq ft
                      </p>
                    </div>
                  )}

                  {/* Base Flood Elevation */}
                  {selectedReport.baseFloodElevation && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Waves className="w-4 h-4" />
                        <span>Base Flood Elevation (BFE)</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {formatDecimal(selectedReport.baseFloodElevation)} ft
                      </p>
                    </div>
                  )}

                  {/* Census Data */}
                  {selectedReport.censusData && typeof selectedReport.censusData === 'object' && 'population' in selectedReport.censusData && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <UsersIcon className="w-4 h-4" />
                        <span>Area Population (Census)</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {((selectedReport.censusData as Record<string, number>).population as number).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h3 className="font-semibold">FEMA Flood Zone Information</h3>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Zone {selectedReport.femaFloodZone}:</span>{" "}
                      {selectedReport.femaFloodZone === "X" && "Area of minimal flood hazard, outside the 100-year and 500-year floodplain."}
                      {selectedReport.femaFloodZone === "AE" && "Areas subject to inundation by the 1% annual chance flood determined by detailed methods. Base Flood Elevations (BFEs) are shown."}
                      {selectedReport.femaFloodZone === "A" && "Areas subject to inundation by the 1% annual chance flood determined by approximate methods."}
                      {selectedReport.femaFloodZone === "VE" && "Coastal areas with a 1% or greater chance of flooding and an additional hazard associated with storm waves."}
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">No Property Selected</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter a property address or coordinates to begin your analysis. Your results will appear here.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
