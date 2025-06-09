
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, UserCheck, Wrench, CheckCircle } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      step: 1,
      icon: Upload,
      title: "Submit Request",
      description: "Upload device photos, describe the issue, and provide contact details. Our system automatically categorizes and prioritizes your request."
    },
    {
      step: 2,
      icon: UserCheck,
      title: "Technician Assignment",
      description: "Our intelligent matching system assigns the best-suited technician based on expertise, location, and availability."
    },
    {
      step: 3,
      icon: Wrench,
      title: "Repair Process",
      description: "Track real-time progress with live updates. Communicate directly with your technician through our built-in chat system."
    },
    {
      step: 4,
      icon: CheckCircle,
      title: "Completion & Payment",
      description: "Receive notification when repair is complete. Pay securely online and rate your experience to help improve our service."
    }
  ];

  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How FixMate Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From request to completion in four simple steps. Experience the future of repair management.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="h-full transition-all duration-300 hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div className="flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full">
                        <step.icon className="h-8 w-8" />
                      </div>
                      <Badge className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center p-0 text-xs">
                        {step.step}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
              
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-muted transform -translate-y-1/2 z-10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
