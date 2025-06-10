
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Square, Clock, Calendar, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TimeEntry {
  id: string;
  repairId: string;
  customerName: string;
  deviceType: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  description: string;
  billable: boolean;
}

interface ActiveTimer {
  repairId: string;
  startTime: Date;
  description: string;
}

export const TimeTracking = () => {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedRepair, setSelectedRepair] = useState('');
  const [description, setDescription] = useState('');

  // Sample time entries
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    {
      id: '1',
      repairId: 'REP-001',
      customerName: 'John Doe',
      deviceType: 'iPhone 13 Pro',
      startTime: new Date('2024-01-15T09:00:00'),
      endTime: new Date('2024-01-15T11:30:00'),
      duration: 150,
      description: 'Screen replacement and testing',
      billable: true
    },
    {
      id: '2',
      repairId: 'REP-002',
      customerName: 'Jane Smith',
      deviceType: 'Samsung Galaxy S21',
      startTime: new Date('2024-01-15T14:00:00'),
      endTime: new Date('2024-01-15T15:45:00'),
      duration: 105,
      description: 'Battery replacement',
      billable: true
    },
    {
      id: '3',
      repairId: 'REP-003',
      customerName: 'Mike Johnson',
      deviceType: 'iPad Pro',
      startTime: new Date('2024-01-16T10:00:00'),
      endTime: new Date('2024-01-16T12:00:00'),
      duration: 120,
      description: 'Diagnostic and quote preparation',
      billable: false
    }
  ]);

  // Available repairs for selection
  const availableRepairs = [
    { id: 'REP-004', customer: 'Sarah Wilson', device: 'MacBook Pro' },
    { id: 'REP-005', customer: 'David Brown', device: 'iPhone 14' },
    { id: 'REP-006', customer: 'Lisa Davis', device: 'Samsung Tab S8' },
  ];

  // Update elapsed time every second when timer is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - activeTimer.startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const startTimer = () => {
    if (!selectedRepair || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a repair and add a description.",
        variant: "destructive"
      });
      return;
    }

    const timer: ActiveTimer = {
      repairId: selectedRepair,
      startTime: new Date(),
      description: description.trim()
    };

    setActiveTimer(timer);
    setElapsedTime(0);
    toast({
      title: "Timer Started",
      description: `Started tracking time for ${selectedRepair}`,
    });
  };

  const stopTimer = () => {
    if (!activeTimer) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - activeTimer.startTime.getTime()) / 60000); // in minutes
    const selectedRepairInfo = availableRepairs.find(r => r.id === activeTimer.repairId);

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      repairId: activeTimer.repairId,
      customerName: selectedRepairInfo?.customer || 'Unknown',
      deviceType: selectedRepairInfo?.device || 'Unknown',
      startTime: activeTimer.startTime,
      endTime,
      duration,
      description: activeTimer.description,
      billable: true
    };

    setTimeEntries(prev => [newEntry, ...prev]);
    setActiveTimer(null);
    setElapsedTime(0);
    setSelectedRepair('');
    setDescription('');

    toast({
      title: "Time Logged",
      description: `Logged ${duration} minutes for ${activeTimer.repairId}`,
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getTodayEntries = () => {
    const today = new Date().toDateString();
    return timeEntries.filter(entry => entry.startTime.toDateString() === today);
  };

  const getTotalTimeToday = () => {
    return getTodayEntries().reduce((total, entry) => total + entry.duration, 0);
  };

  const getBillableTimeToday = () => {
    return getTodayEntries().filter(entry => entry.billable).reduce((total, entry) => total + entry.duration, 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Time Tracking</h2>
        <p className="text-muted-foreground">Track time spent on repairs and generate accurate billing</p>
      </div>

      {/* Timer Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Active Timer</span>
          </CardTitle>
          <CardDescription>Start tracking time for your current repair task</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeTimer ? (
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-primary mb-4">
                {formatTime(elapsedTime)}
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                Working on: {activeTimer.repairId} - {activeTimer.description}
              </div>
              <Button onClick={stopTimer} variant="destructive">
                <Square className="h-4 w-4 mr-2" />
                Stop Timer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Repair Request</label>
                <Select value={selectedRepair} onValueChange={setSelectedRepair}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a repair request" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRepairs.map(repair => (
                      <SelectItem key={repair.id} value={repair.id}>
                        {repair.id} - {repair.customer} ({repair.device})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Task Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Screen replacement, diagnostic testing..."
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md"
                />
              </div>
              <Button onClick={startTimer} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Start Timer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(getTotalTimeToday())}</div>
            <p className="text-xs text-muted-foreground">
              {getTodayEntries().length} time entries
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billable Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(getBillableTimeToday())}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((getBillableTimeToday() / Math.max(getTotalTimeToday(), 1)) * 100)}% of total time
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Earnings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${((getBillableTimeToday() / 60) * 75).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              @ $75/hour rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
          <CardDescription>Your logged time for the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeEntries.slice(0, 10).map(entry => (
              <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium">{entry.repairId}</span>
                    <Badge variant={entry.billable ? "default" : "secondary"}>
                      {entry.billable ? "Billable" : "Non-billable"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {entry.customerName} - {entry.deviceType}
                  </p>
                  <p className="text-sm">{entry.description}</p>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatDuration(entry.duration)}</div>
                  <div className="text-sm text-muted-foreground">
                    {entry.startTime.toLocaleDateString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {entry.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                    {entry.endTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {timeEntries.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No time entries yet. Start your first timer!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
