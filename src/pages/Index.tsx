
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted p-8">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Logo and branding */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold gradient-text">Nimos</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The WhatsApp-first salon management platform that transforms how you connect with clients and run your business.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
          <div className="p-6 rounded-lg bg-card border text-left">
            <h3 className="font-semibold mb-2">WhatsApp-First</h3>
            <p className="text-sm text-muted-foreground">
              All client bookings and communication happen through WhatsApp - no apps to download.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card border text-left">
            <h3 className="font-semibold mb-2">AI-Powered</h3>
            <p className="text-sm text-muted-foreground">
              Smart booking assistant handles appointments, FAQs, and client communication automatically.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card border text-left">
            <h3 className="font-semibold mb-2">Multi-Studio</h3>
            <p className="text-sm text-muted-foreground">
              Manage multiple locations with role-based access and isolated data.
            </p>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="px-8">
            <Link to="/auth">Get Started</Link>
          </Button>
          <Button variant="outline" size="lg" className="px-8">
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
