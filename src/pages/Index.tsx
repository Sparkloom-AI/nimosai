
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MessageCircle, Sparkles, Users } from "lucide-react";

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-calm p-8">
        <div className="max-w-4xl mx-auto text-center space-y-12" style={{ minHeight: '750px' }}>
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground font-body">Creating your wellness space...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-calm p-8">
      <div className="max-w-4xl mx-auto text-center space-y-12" style={{ minHeight: '750px' }}>
        {/* Logo and branding - Calm & Trustworthy */}
        <div className="space-y-6 animate-fade-in">
          <h1 className="text-6xl font-heading font-bold gradient-text">Nimos</h1>
          <p className="text-xl font-body text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform your wellness studio with our calm, WhatsApp-first management platform. 
            Seamlessly connect with clients while maintaining the peace and organization your business deserves.
          </p>
        </div>

        {/* Features grid - Wellness & Serenity focused */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16 animate-slide-up">
          <div className="p-8 rounded-xl bg-card border border-border text-left group hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
              <MessageCircle className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-heading font-semibold mb-3 text-card-foreground">WhatsApp-First Experience</h3>
            <p className="text-sm font-body text-muted-foreground leading-relaxed">
              Your clients book and communicate through WhatsApp's familiar interface. 
              No apps to download, no learning curves – just seamless connection.
            </p>
          </div>
          
          <div className="p-8 rounded-xl bg-card border border-border text-left group hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-wellness/20 flex items-center justify-center mb-4 group-hover:bg-wellness/30 transition-colors">
              <Sparkles className="w-6 h-6 text-wellness" />
            </div>
            <h3 className="font-heading font-semibold mb-3 text-card-foreground">AI-Powered Harmony</h3>
            <p className="text-sm font-body text-muted-foreground leading-relaxed">
              Our intelligent assistant handles bookings and client questions with care, 
              freeing you to focus on what matters most – your clients' wellbeing.
            </p>
          </div>
          
          <div className="p-8 rounded-xl bg-card border border-border text-left group hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading font-semibold mb-3 text-card-foreground">Multi-Studio Simplicity</h3>
            <p className="text-sm font-body text-muted-foreground leading-relaxed">
              Grow with confidence. Manage multiple locations with secure, role-based access 
              that keeps each studio's data private and organized.
            </p>
          </div>
        </div>

        {/* CTA buttons - Calm & Empowering */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in">
          <Button asChild size="lg" className="px-8 py-3 font-heading font-medium">
            <Link to="/auth">Start Your Journey</Link>
          </Button>
          <Button variant="outline" size="lg" className="px-8 py-3 font-body">
            Discover More
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-sm font-body text-muted-foreground">
            Trusted by wellness professionals • GDPR compliant • Built for growth
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
