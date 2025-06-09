
import { TrendingUp, Users, Clock, Star } from "lucide-react";

export const Stats = () => {
  const stats = [
    {
      icon: Users,
      value: "10K+",
      label: "Active Users",
      description: "Repair shops and technicians"
    },
    {
      icon: TrendingUp,
      value: "50K+",
      label: "Repairs Completed",
      description: "Successfully tracked and managed"
    },
    {
      icon: Clock,
      value: "40%",
      label: "Faster Processing",
      description: "Average improvement in repair time"
    },
    {
      icon: Star,
      value: "4.9/5",
      label: "Customer Rating",
      description: "Based on 2,000+ reviews"
    }
  ];

  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-3">
                <stat.icon className="h-8 w-8 opacity-80" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold mb-1">{stat.value}</div>
              <div className="text-lg font-medium mb-1">{stat.label}</div>
              <div className="text-sm opacity-80">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
