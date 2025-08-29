import { ReactNode } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Shield, Users, Eye, Database, Cookie } from "lucide-react";

interface TermsLayoutProps {
  children?: ReactNode;
}

const termsNavigation = [
  {
    title: "Overview",
    href: "/terms",
    icon: FileText,
    description: "About our legal terms"
  },
  {
    title: "Terms of Use",
    href: "/terms/terms-of-use",
    icon: FileText,
    description: "Website and app usage terms"
  },
  {
    title: "Privacy Policy",
    href: "/terms/privacy-policy",
    icon: Shield,
    description: "How we handle your data"
  },
  {
    title: "Terms of Service",
    href: "/terms/terms-of-service",
    icon: Users,
    description: "Service usage agreement"
  },
  {
    title: "Terms of Business",
    href: "/terms/terms-of-business",
    icon: Users,
    description: "Partner and business terms"
  },
  {
    title: "Data Protection",
    href: "/terms/data-protection",
    icon: Database,
    description: "GDPR compliance details"
  },
  {
    title: "Cookies Policy",
    href: "/terms/cookies",
    icon: Cookie,
    description: "Cookie usage policy"
  }
];

export default function TermsLayout({ children }: TermsLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Legal Terms</h1>
              <p className="text-muted-foreground">Our legal policies and terms</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="font-semibold mb-4 text-foreground">Legal Documents</h2>
              <nav className="space-y-2">
                {termsNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-accent ${
                        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="p-8">
              {children || <Outlet />}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}