
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MessageSquare, 
  Calendar, 
  Users, 
  BarChart3,
  Smartphone,
  Shield,
  Zap,
  ArrowRight,
  Check
} from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: MessageSquare,
      title: 'WhatsApp-First Booking',
      description: 'Clients book appointments naturally through WhatsApp chat with AI assistance'
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Automated scheduling with staff availability and service duration management'
    },
    {
      icon: Users,
      title: 'Multi-Studio Support',
      description: 'Manage multiple salon locations with role-based access and data isolation'
    },
    {
      icon: BarChart3,
      title: 'Business Analytics',
      description: 'Track revenue, client retention, and staff performance with detailed insights'
    },
    {
      icon: Smartphone,
      title: 'Mobile-Optimized',
      description: 'Beautiful dashboard that works perfectly on desktop and mobile devices'
    },
    {
      icon: Shield,
      title: 'Secure & Compliant',
      description: 'Enterprise-grade security with GDPR compliance and encrypted data storage'
    }
  ];

  const benefits = [
    'Increase bookings by 40% with WhatsApp automation',
    'Reduce no-shows with automated reminders',
    'Save 10+ hours per week on admin tasks',
    'Improve client satisfaction with instant responses',
    'Scale to multiple locations seamlessly'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Nimos</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost">Features</Button>
              <Button variant="ghost">Pricing</Button>
              <Button variant="outline">Sign In</Button>
              <Button className="gradient-primary text-white border-0">
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              The <span className="gradient-text">WhatsApp-First</span> Salon Management Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Streamline your salon operations with AI-powered WhatsApp booking, 
              smart scheduling, and comprehensive business management tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gradient-primary text-white border-0 text-lg px-8 py-6">
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to run your salon
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From WhatsApp booking to advanced analytics, Nimos provides all the tools 
              your salon needs to thrive in the digital age.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-up">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Transform your salon operations
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join hundreds of salon owners who have revolutionized their business 
                with Nimos. Experience the power of WhatsApp-first booking and AI automation.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
                  <Zap className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to revolutionize your salon?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Start your free trial today and see why salon owners love Nimos.
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6">
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Nimos</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 Nimos. All rights reserved. Built with ❤️ for salon professionals.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
