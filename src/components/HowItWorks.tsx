
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, UserCheck, Wrench, CheckCircle } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      title: "1. Create Your Request",
      description: "Simply upload a photo of your device and describe the issue. It takes less than two minutes."
    },
    {
      icon: UserCheck,
      title: "2. Get Matched Instantly",
      description: "Our smart system matches you with a certified local technician in seconds."
    },
    {
      icon: Wrench,
      title: "3. Track Your Repair Live",
      description: "Follow your repair in real-time and chat directly with your technician for updates."
    },
    {
      icon: CheckCircle,
      title: "4. Pay & Rate Securely",
      description: "Once the job is done, pay securely online and share your feedback to help our community."
    }
  ];

  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Get Your Devices Fixed in 4 Easy Steps
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our streamlined process makes repair management simple, transparent, and fast.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-105">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full">
                      <step.icon className="h-8 w-8" />
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
                <div className="hidden lg:block absolute top-8 left-[calc(100%_-_1rem)] w-8 h-px bg-muted -translate-y-1/2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
