
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface CustomerAnalyticsPanelProps {
  repairRequests: any[];
  stats: {
    completed: number;
  };
}

export function CustomerAnalyticsPanel({ repairRequests, stats }: CustomerAnalyticsPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Request Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Total Requests:</span>
              <span className="font-medium">{repairRequests.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Average Cost:</span>
              <span className="font-medium">
                ${repairRequests.filter(r => r.final_cost).length > 0 
                  ? Math.round(repairRequests.filter(r => r.final_cost).reduce((sum, r) => sum + parseFloat(r.final_cost), 0) / repairRequests.filter(r => r.final_cost).length)
                  : 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Completion Rate:</span>
              <span className="font-medium">
                {repairRequests.length > 0 ? Math.round((stats.completed / repairRequests.length) * 100) : 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
