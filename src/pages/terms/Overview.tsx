import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Shield, Users, Database, Cookie, ArrowRight } from "lucide-react";

const legalDocuments = [
  {
    title: "Terms of Use",
    description: "Please carefully read our Terms of Use before you use our Website or Apps and before booking any services via our platform.",
    href: "/terms/terms-of-use",
    icon: FileText,
    color: "text-blue-600"
  },
  {
    title: "Privacy Policy",
    description: "Please carefully read our Privacy Policy that is intended to inform you how we gather, define, and use your information.",
    href: "/terms/privacy-policy",
    icon: Shield,
    color: "text-green-600"
  },
  {
    title: "Terms of Service",
    description: "Please carefully read our Terms of Service and what that means for using our platform.",
    href: "/terms/terms-of-service",
    icon: Users,
    color: "text-purple-600"
  },
  {
    title: "Terms of Business",
    description: "Please carefully read our Terms of Business and what it means to partner with our platform.",
    href: "/terms/terms-of-business",
    icon: Users,
    color: "text-orange-600"
  },
  {
    title: "Data Protection Policy",
    description: "Please carefully read how we look after your data and what that means for you.",
    href: "/terms/data-protection",
    icon: Database,
    color: "text-red-600"
  },
  {
    title: "Cookie Policy",
    description: "Please carefully read how we use cookies to enhance your experience.",
    href: "/terms/cookies",
    icon: Cookie,
    color: "text-yellow-600"
  }
];

export default function TermsOverview() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">About Our Legal Terms</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Welcome to our legal hub. Here you'll find all the important information about how we operate, 
          protect your data, and maintain our services.
        </p>
      </div>

      {/* Legal Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {legalDocuments.map((doc) => {
          const Icon = doc.icon;
          
          return (
            <Card key={doc.href} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-muted ${doc.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">{doc.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {doc.description}
                  </p>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to={doc.href} className="flex items-center justify-center gap-2">
                      Read {doc.title}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Contact Information */}
      <Card className="p-6 bg-muted/50">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Questions about our legal terms?</h3>
          <p className="text-muted-foreground">
            If you have any questions about these legal documents, please don't hesitate to contact us.
          </p>
          <Button variant="outline" asChild>
            <a href="mailto:legal@nimos.app">Contact Legal Team</a>
          </Button>
        </div>
      </Card>
    </div>
  );
}