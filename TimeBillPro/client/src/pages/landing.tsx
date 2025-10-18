import { Building2, Shield, ClipboardCheck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-primary" />
            <span className="text-xl font-semibold">Property Grant Analyzer</span>
          </div>
          <Button
            data-testid="button-login"
            onClick={() => window.location.href = '/api/login'}
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-semibold text-foreground">
              Streamline Flood Mitigation Grant Analysis
            </h1>
            <p className="text-lg text-muted-foreground">
              A comprehensive platform for grant analysts and environmental planners to assess property eligibility, track compliance, and collaborate on flood-related grant applications.
            </p>
            <div className="pt-4">
              <Button
                size="lg"
                data-testid="button-get-started"
                onClick={() => window.location.href = '/api/login'}
                className="px-8"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-12 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-12">
            Everything You Need for Grant Analysis
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Property Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Instant property assessment with FEMA flood zone data, elevation information, and census demographics.
              </p>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-chart-2" />
              </div>
              <h3 className="text-lg font-semibold">Compliance Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Structured EHP pre-screening and regulatory review framework to ensure grant compliance early in the process.
              </p>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6 text-chart-3" />
              </div>
              <h3 className="text-lg font-semibold">Team Collaboration</h3>
              <p className="text-sm text-muted-foreground">
                Shared workspace for task assignment, status tracking, and team collaboration on grant applications.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold">
                Accelerate Your Grant Workflow
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Centralized Data</h4>
                    <p className="text-sm text-muted-foreground">
                      Access FEMA maps, county assessors, and census data from a single platform.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Faster Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      Generate comprehensive property reports in seconds instead of hours.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Better Collaboration</h4>
                    <p className="text-sm text-muted-foreground">
                      Keep your entire team aligned with shared task management and status tracking.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="p-8 bg-primary/5 border-primary/20">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Ready to Get Started?</h3>
                <p className="text-muted-foreground">
                  Sign in now to start analyzing properties for flood mitigation grant eligibility.
                </p>
                <Button
                  data-testid="button-sign-in-cta"
                  onClick={() => window.location.href = '/api/login'}
                  className="w-full"
                >
                  Sign In to Your Account
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-primary" />
              <span className="font-medium">Property Grant Analyzer</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Professional flood mitigation grant analysis platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
