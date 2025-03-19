import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Baby, Heart, Shield, Users, HandHeart, RefreshCw, ChevronDown, ChevronUp, Calendar, CheckSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import RescueAnimation from './RescueAnimation';

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: number;
  target: number;
  color: string;
  unit: string;
  animationDelay?: number;
  monthlyTarget?: number;
  monthlyValue?: number;
}

// More compact StatCard component
const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  target, 
  color, 
  unit, 
  animationDelay = 0,
  monthlyTarget = 30,
  monthlyValue = 12
}: StatCardProps) => {
  const [currentValue, setCurrentValue] = useState(0);
  
  useEffect(() => {
    // Animate the value counting up
    const timer = setTimeout(() => {
      if (currentValue < value) {
        setCurrentValue(Math.min(currentValue + Math.ceil(value / 20), value));
      }
    }, 50);
    
    return () => clearTimeout(timer);
  }, [currentValue, value]);
  
  const percentage = Math.min(100, (currentValue / target) * 100);
  const monthlyPercentage = Math.min(100, (monthlyValue / monthlyTarget) * 100);
  const delayClass = `horizontal-stagger-${animationDelay + 1}`;
  
  return (
    <Card className="overflow-hidden hover-scale transition-all duration-300 border-t-4" style={{ borderTopColor: color }}>
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-2 items-center">
            <div className={`p-1.5 rounded-full animate-horizontal-slide-in ${delayClass}`} style={{ backgroundColor: `${color}30` }}>
              <Icon className="h-4 w-4" style={{ color: color }} />
            </div>
            <h3 className="font-medium text-sm text-gray-700">{title}</h3>
          </div>
          <span className="text-xs font-medium text-gray-500">Target: {target.toLocaleString()}</span>
        </div>
        
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-2xl font-bold">{currentValue.toLocaleString()}</span>
          <span className="text-xs text-gray-500">{unit}</span>
        </div>
        
        <div className="relative h-1.5 mt-1 rounded-full overflow-hidden bg-gray-100">
          <div 
            className="absolute top-0 left-0 h-full"
            style={{ 
              backgroundColor: color, 
              width: `${percentage}%`,
            }}
          ></div>
        </div>
        
        <div className="text-right mt-0.5 mb-2">
          <span className="text-xs font-medium" style={{ color }}>
            {percentage.toFixed(0)}% of target
          </span>
        </div>
        
        {/* Monthly progress */}
        <div className="mt-2">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-xs font-medium text-gray-600">Monthly Progress</span>
            <span className="text-xs font-medium text-gray-600">{monthlyValue} of {monthlyTarget}</span>
          </div>
          <Progress value={monthlyPercentage} className="h-1.5" />
          <div className="text-right mt-0.5">
            <span className="text-xs font-medium" style={{ color }}>
              {monthlyPercentage.toFixed(0)}% completed
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Updated LiveImpactCounter to include activities planned and completed
const LiveImpactCounter = () => {
  const [womenHelped, setWomenHelped] = useState(0);
  const [childrenSaved, setChildrenSaved] = useState(0);
  const [activitiesPlanned, setActivitiesPlanned] = useState(0);
  const [activitiesCompleted, setActivitiesCompleted] = useState(0);
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    // Initialize Zoho Creator SDK and fetch data
    const fetchData = async () => {
      try {
        await window.ZOHO.CREATOR.init();
        const config = {
          appName: "react-widgets",
          reportName: "All_Activity_Reports"
        };
        const response = await window.ZOHO.CREATOR.API.getAllRecords(config);
        if (response && response.data && response.data.length > 0) {
          const data = response.data[0]; // Assuming the first record contains the required fields
          setWomenHelped(data.Women_Supported || 0);
          setChildrenSaved(data.Child_Protected || 0);
          setActivitiesPlanned(data.Activities_Planned || 0);
          setActivitiesCompleted(data.Activities_Completed || 0);
          setError(null); // Clear any previous errors
        } else {
          throw new Error("No data returned from Zoho Creator API.");
        }
      } catch (err) {
        console.error("Error fetching data from Zoho Creator:", err);
        setError("Failed to fetch data. Please try again later.");
      }
    };

    fetchData();
  }, []); // Removed dependency on `activitiesPlanned`

  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-2 border border-green-100 animate-fade-in">
      <h3 className="text-center text-gray-700 font-medium text-sm mb-1">Live Impact Counter</h3>
      {error && (
        <div className="text-center text-red-500 text-xs mb-2">
          {error}
        </div>
      )}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="flex flex-col items-center">
          <div className="bg-pink-100 p-1.5 rounded-full mb-1 pulse">
            <HandHeart className="h-3.5 w-3.5 text-pink-500" />
          </div>
          <div className="text-lg font-bold text-pink-600">{womenHelped.toLocaleString()}</div>
          <div className="text-xs text-gray-600">Women Supported</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-blue-100 p-1.5 rounded-full mb-1 pulse">
            <Baby className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <div className="text-lg font-bold text-blue-600">{childrenSaved.toLocaleString()}</div>
          <div className="text-xs text-gray-600">Children Protected</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-purple-100 p-1.5 rounded-full mb-1 pulse">
            <Calendar className="h-3.5 w-3.5 text-purple-500" />
          </div>
          <div className="text-lg font-bold text-purple-600">{activitiesPlanned.toLocaleString()}</div>
          <div className="text-xs text-gray-600">Activities Planned</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-green-100 p-1.5 rounded-full mb-1 pulse">
            <CheckSquare className="h-3.5 w-3.5 text-green-500" />
          </div>
          <div className="text-lg font-bold text-green-600">{activitiesCompleted.toLocaleString()}</div>
          <div className="text-xs text-gray-600">Activities Completed</div>
        </div>
      </div>
    </div>
  );
};

// More compact ImpactDataChart
const ImpactDataChart = () => {
  const [chartVisible, setChartVisible] = useState(false);
  const data = [
    { name: 'Jan', maternal: 65, child: 48 },
    { name: 'Feb', maternal: 70, child: 53 },
    { name: 'Mar', maternal: 75, child: 60 },
    { name: 'Apr', maternal: 78, child: 63 },
    { name: 'May', maternal: 82, child: 68 },
    { name: 'Jun', maternal: 87, child: 74 },
  ];
  
  useEffect(() => {
    // Show chart with slight delay for animation effect
    const timer = setTimeout(() => {
      setChartVisible(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const config = {
    maternal: {
      label: "Maternal Health",
      color: "#ec4899"
    },
    child: {
      label: "Child Health",
      color: "#3b82f6"
    }
  };
  
  return (
    <Card className="shadow-sm animate-fade-in">
      <CardContent className="p-4">
        <h3 className="font-medium text-gray-700 mb-2 text-sm">Health Impact Trends</h3>
        <div className={`h-[250px] transition-opacity duration-500 ${chartVisible ? 'opacity-100' : 'opacity-0'}`}>
          <ChartContainer config={config} className="h-full w-full">
            <BarChart data={data} className="animate-horizontal-slide-in">
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip cursor={{ fill: '#f3f4f6' }} />
              <Legend />
              <Bar dataKey="maternal" stackId="a" fill="#ec4899" radius={[4, 4, 0, 0]} />
              <Bar dataKey="child" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Updated ZohoAnalyticsDashboard to include toggle between multiple reports
const ZohoAnalyticsDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [dashboardHeight, setDashboardHeight] = useState(800);
  const [isOpen, setIsOpen] = useState(true);
  const [selectedReport, setSelectedReport] = useState("main");

  // Dashboard report sources
  const reports = {
    main: "https://analytics.zoho.in/open-view/384516000000149412",
    secondary: "https://analytics.zoho.in/open-view/384516000000149022",
    detailed: "https://analytics.zoho.in/open-view/384516000000151355",
    d3visual: "https://dev-edzola.github.io/D3js-/"
  };

  useEffect(() => {
    // Adjust height based on viewport
    const updateHeight = () => {
      const viewportHeight = window.innerHeight;
      setDashboardHeight(Math.max(600, viewportHeight * 0.7));
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    
    // Set a timeout to consider the dashboard as loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);
    
    return () => {
      window.removeEventListener('resize', updateHeight);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    // Reset loading state when switching reports
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [selectedReport]);

  const handleRefresh = () => {
    setIsLoading(true);
    // Refresh the iframe by changing the src slightly
    const iframe = document.getElementById('zoho-analytics-frame') as HTMLIFrameElement;
    if (iframe) {
      const currentSrc = iframe.src;
      iframe.src = '';
      setTimeout(() => {
        iframe.src = currentSrc + (currentSrc.includes('?') ? '&' : '?') + 'refresh=' + Date.now();
        // Set a timeout to consider the dashboard as loaded again
        setTimeout(() => setIsLoading(false), 3000);
      }, 100);
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="rounded-lg overflow-hidden border shadow-lg mt-6 hover-scale transition-all duration-300"
    >
      <div className="bg-green-50 p-4 border-b border-green-100 flex justify-between items-center">
        <h3 className="font-medium text-green-700 flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-600" /> 
          Antara Foundation's Live Data Dashboard
        </h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="text-green-600 border-green-200 hover:bg-green-100"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-green-600 hover:bg-green-100"
            >
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>
      
      <CollapsibleContent>
        <div className="bg-white p-2 border-b flex justify-center">
          <ToggleGroup type="single" value={selectedReport} onValueChange={(value) => value && setSelectedReport(value)}>
            <ToggleGroupItem value="main" aria-label="Main Dashboard">
              Main Dashboard
            </ToggleGroupItem>
            <ToggleGroupItem value="secondary" aria-label="Secondary Report">
              Health Metrics
            </ToggleGroupItem>
            <ToggleGroupItem value="detailed" aria-label="Detailed Analysis">
              Detailed Analysis
            </ToggleGroupItem>
            <ToggleGroupItem value="d3visual" aria-label="D3 Visualization">
              D3 Visualization
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        <div className="relative" style={{ height: `${dashboardHeight}px` }}>
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10">
              <div className="animate-spin h-12 w-12 rounded-full border-4 border-green-500 border-t-transparent mb-4"></div>
              <p className="text-green-700">Loading dashboard data...</p>
            </div>
          )}
          
          {hasError && (
            <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-10">
              <div className="text-red-500 mb-4 text-6xl">!</div>
              <p className="text-red-700 mb-2">Unable to load the dashboard</p>
              <Button onClick={handleRefresh} variant="outline" className="mt-2">
                Try Again
              </Button>
            </div>
          )}
          
          <ScrollArea variant="fancy" className="h-full w-full">
            <iframe 
              id="zoho-analytics-frame"
              frameBorder="0" 
              width="100%" 
              height={dashboardHeight} 
              src={reports[selectedReport as keyof typeof reports]}
              className="w-full"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            ></iframe>
          </ScrollArea>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

const MissionHealthDashboard = () => {
  // Calculate total monthly progress across all activities
  const monthlyTargetTotal = 30 * 4; // 30 for each of the 4 cards
  const monthlyValueTotal = 12 + 18 + 24 + 8; // Sum of all monthly values
  
  return (
    <div className="p-3 space-y-4 animate-fade-in">
      <RescueAnimation monthlyTarget={monthlyTargetTotal} completedValue={monthlyValueTotal} />
      
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Impact Overview</h3>
          <span className="text-xs text-gray-500">Real-time health impact data</span>
        </div>
        
        <LiveImpactCounter />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <StatCard 
          icon={Heart} 
          title="Women Supported" 
          value={12547} 
          target={15000} 
          color="#ec4899" 
          unit="women"
          animationDelay={0}
          monthlyTarget={30}
          monthlyValue={12}
        />
        <StatCard 
          icon={Baby} 
          title="Healthy Births" 
          value={8932} 
          target={10000} 
          color="#3b82f6" 
          unit="children"
          animationDelay={1}
          monthlyTarget={30}
          monthlyValue={18}
        />
        <StatCard 
          icon={Shield} 
          title="Children Immunized" 
          value={7652} 
          target={9000} 
          color="#8b5cf6" 
          unit="children"
          animationDelay={2}
          monthlyTarget={30}
          monthlyValue={24}
        />
        <StatCard 
          icon={Users} 
          title="Communities Reached" 
          value={342} 
          target={400} 
          color="#10b981" 
          unit="villages"
          animationDelay={3}
          monthlyTarget={30}
          monthlyValue={8}
        />
      </div>
      
      <ImpactDataChart />
      
      <ZohoAnalyticsDashboard />
    </div>
  );
};

export default MissionHealthDashboard;