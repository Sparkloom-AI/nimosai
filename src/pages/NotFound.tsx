
import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, ArrowLeft, RotateCcw } from "lucide-react";

// Using placeholder images since generation failed

const funnyScenarios = [
  {
    id: 1,
    title: "This page is doing yoga in another dimension",
    description: "We think it achieved enlightenment and transcended to a higher realm.",
    image: null,
    icon: "🧘‍♀️"
  },
  {
    id: 2,
    title: "Our page is at the gym, getting stronger",
    description: "It's probably doing burpees right now. Give it a few more reps!",
    image: null,
    icon: "💪"
  },
  {
    id: 3,
    title: "This URL went for a spa day and never came back",
    description: "Last seen getting a hot stone massage and cucumber facial.",
    image: null,
    icon: "🧖‍♀️"
  },
  {
    id: 4,
    title: "The page you're looking for is in a deep meditation",
    description: "Shh... it's finding its inner peace. Please don't disturb.",
    image: null,
    icon: "🪷"
  },
  {
    id: 5,
    title: "404: Page not found, but your inner peace is still intact",
    description: "Take a deep breath. This too shall pass... unlike this missing page.",
    image: null,
    icon: "☮️"
  },
  {
    id: 6,
    title: "This page is doing cardio... it ran away!",
    description: "Last spotted jogging towards the horizon. Very committed to fitness.",
    image: null,
    icon: "🏃‍♂️"
  },
  {
    id: 7,
    title: "Error 404: Page is getting a massage",
    description: "It's probably face-down on a massage table right now. So relaxed!",
    image: null,
    icon: "💆‍♀️"
  },
  {
    id: 8,
    title: "The URL you want is doing pilates somewhere",
    description: "Working on its core strength and flexibility. Very responsible page.",
    image: null,
    icon: "🤸‍♀️"
  },
  {
    id: 9,
    title: "This page joined a wellness retreat and found itself",
    description: "It's probably journaling by a mountain lake and eating organic granola.",
    image: null,
    icon: "🏔️"
  },
  {
    id: 10,
    title: "404: We lost this page during hot yoga class",
    description: "It might have evaporated in the heat. Namaste and good luck!",
    image: null,
    icon: "🔥"
  }
];

const NotFound = () => {
  const location = useLocation();
  const [currentScenario, setCurrentScenario] = useState(funnyScenarios[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Log 404 error without exposing pathname in production
    if (process.env.NODE_ENV === 'development') {
      console.error("404 Error: Route not found:", location.pathname);
    }

    // Set random scenario on mount
    const randomIndex = Math.floor(Math.random() * funnyScenarios.length);
    setCurrentScenario(funnyScenarios[randomIndex]);
  }, [location.pathname]);

  const getNewScenario = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * funnyScenarios.length);
      setCurrentScenario(funnyScenarios[randomIndex]);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <Card className="glass border-primary/10 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="text-center p-8 border-b border-primary/10">
            <div className="text-8xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4 animate-gentle-bounce">
              404
            </div>
            <div className="text-2xl text-muted-foreground mb-2">
              Page Not Found
            </div>
            <div className="text-sm text-muted-foreground">
              But we found something way more interesting...
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8">
            <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                {/* Image */}
                <div className="order-2 lg:order-1">
                  <div className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-muted/20 min-h-[250px] flex items-center justify-center">
                    <div className="text-6xl animate-calm-pulse">
                      {currentScenario.icon}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="order-1 lg:order-2 text-center lg:text-left">
                  <h1 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4 leading-tight">
                    {currentScenario.title}
                  </h1>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    {currentScenario.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Button asChild size="lg" className="group">
                      <Link to="/">
                        <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                        Go Home
                      </Link>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="lg" 
                      onClick={() => window.history.back()}
                      className="group"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                      Go Back
                    </Button>
                    
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      onClick={getNewScenario}
                      className="group"
                      disabled={isAnimating}
                    >
                      <RotateCcw className={`w-4 h-4 mr-2 group-hover:rotate-180 transition-transform ${isAnimating ? 'animate-spin' : ''}`} />
                      Another Story
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Fun Stats */}
            <div className="mt-12 pt-8 border-t border-primary/10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                <div className="group cursor-pointer">
                  <div className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform">
                    {funnyScenarios.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Funny Stories</div>
                </div>
                <div className="group cursor-pointer">
                  <div className="text-2xl font-bold text-accent group-hover:scale-110 transition-transform">
                    ∞
                  </div>
                  <div className="text-sm text-muted-foreground">Patience Required</div>
                </div>
                <div className="group cursor-pointer">
                  <div className="text-2xl font-bold text-wellness-primary group-hover:scale-110 transition-transform">
                    100%
                  </div>
                  <div className="text-sm text-muted-foreground">Zen Level</div>
                </div>
                <div className="group cursor-pointer">
                  <div className="text-2xl font-bold text-secondary group-hover:scale-110 transition-transform">
                    0
                  </div>
                  <div className="text-sm text-muted-foreground">Stress Added</div>
                </div>
              </div>
            </div>

            {/* Popular Pages */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Maybe you were looking for one of these instead?
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/calendar">Calendar</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/services">Services</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/team">Team</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/settings">Settings</Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export { NotFound };
export default NotFound;
