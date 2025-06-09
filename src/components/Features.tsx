
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wrench, 
  Clock, 
  MessageSquare, 
  Shield, 
  Smartphone, 
  Star,
  Users,
  TrendingUp,
  Calendar,
  CreditCard,
  Bell,
  FileText
} from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: Wrench,
      title: "Smart Repair Requests",
      description: "Submit detailed repair requests with photos, device info, and problem descriptions. Our smart system categorizes and prioritizes automatically."
    },
    {
      icon: Users,
      title: "Intelligent Technician Assignment",
      description: "AI-powered matching based on expertise, availability, and location. Ensure the right technician gets the right job every time."
    },
    {
      icon: Clock,
      title: "Real-Time Status Tracking",
      description: "Live updates from request submission to completion. Customers stay informed with automated notifications at every step."
    },
    {
      icon: MessageSquare,
      title: "Built-in Chat Support",
      description: "Direct communication between customers and technicians. Share images, documents, and updates in real-time."
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description: "Comprehensive dashboards with performance metrics, customer satisfaction scores, and business insights."
    },
    {
      icon: Calendar,
      title: "Appointment Scheduling",
      description: "Calendar-based booking system with automated reminders and technician availability sync."
    },
    {
      icon: CreditCard,
      title: "Integrated Payments",
      description: "Secure online payments with multiple options including mobile money, cards, and digital wallets."
    },
    {
      icon: Star,
      title: "Rating & Reviews",
      description: "Customer feedback system that helps maintain quality and identify top-performing technicians."
    },
    {
      icon: Shield,
      title: "Warranty Tracking",
      description: "Complete service history and warranty management with automated notifications and coverage tracking."
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Multi-channel notifications via email, SMS, and push notifications to keep everyone informed."
    },
    {
      icon: Smartphone,
      title: "Mobile Responsive",
      description: "Fully optimized for mobile devices with native app-like experience across all platforms."
    },
    {
      icon: FileText,
      title: "Digital Documentation",
      description: "Automated report generation, digital receipts, and comprehensive repair documentation."
    }
  ];

  return (
    <section id="features" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to Manage Repairs
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive platform designed to streamline every aspect of your repair business operations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
