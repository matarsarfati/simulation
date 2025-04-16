import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EventData } from './EventBlockGenerator';
import { calculatePerformanceScore, normalizeValue } from '../utils/calculationUtils';

// Define the correlation data point type
export type CorrelationDataPoint = {
  timePoint: string;
  quarter: number;
  izof: number;
  momentum: number;
  flow: number;
  saa: number;
  performanceScore: number;
  // Original values for display
  originalIzof: number;
  originalMomentum: number;
  originalFlow: number;
  originalSaa: number;
};

interface CorrelationDashboardProps {
  timelineEvents: EventData[];
}

const CorrelationDashboard: React.FC<CorrelationDashboardProps> = ({ 
  timelineEvents 
}) => {
  // Transform timeline events into correlation data points
  const correlationData = useMemo(() => {
    console.log("Processing timeline events for correlation data:", timelineEvents);
    
    return timelineEvents.map(event => {
      // Calculate performance score based on actions using utility function
      const performanceScore = calculatePerformanceScore(event.actions);
      
      // Get survey responses or use default values
      const surveyResponses = event.surveyResponses || { 
        emotionalArousal: 0, 
        momentum: 0, 
        flow: 0 
      };
      
      console.log("Survey responses for T" + event.timelinePoint + ":", surveyResponses);
      
      // Normalize survey responses to 0-100 scale
      const izof = normalizeValue(surveyResponses.emotionalArousal, 1, 9, 0, 100);
      const momentum = normalizeValue(surveyResponses.momentum, 1, 9, 0, 100);
      const flow = normalizeValue(surveyResponses.flow, 1, 9, 0, 100);
      
      // Normalize sAA values to 0-100 scale
      // Assuming sAA typically ranges from 30-160 U/mL
      const saa = event.saaValue ? normalizeValue(event.saaValue, 30, 160, 0, 100) : 0;
      
      return {
        timePoint: `T${event.timelinePoint}`,
        quarter: event.quarter,
        izof,
        momentum,
        flow,
        saa,
        performanceScore,
        // Store original values for display in table
        originalIzof: surveyResponses.emotionalArousal,
        originalMomentum: surveyResponses.momentum,
        originalFlow: surveyResponses.flow,
        originalSaa: event.saaValue || 0
      };
    });
  }, [timelineEvents]);
  
  // Generate interpretation text based on correlation data
  const interpretations = useMemo(() => {
    return correlationData.map((point, index) => {
      // Skip if this is the first point (need at least 2 points to identify trends)
      if (index === 0) {
        return `At ${point.timePoint}, initial measures were recorded.`;
      }
      
      const prevPoint = correlationData[index - 1];
      
      // Identify highest values
      const metrics = [
        { name: 'IZOF', value: point.izof, change: point.izof - prevPoint.izof },
        { name: 'Momentum', value: point.momentum, change: point.momentum - prevPoint.momentum },
        { name: 'Flow', value: point.flow, change: point.flow - prevPoint.flow },
        { name: 'sAA', value: point.saa, change: point.saa - prevPoint.saa }
      ];
      
      // Sort by value (highest first)
      const highestMetrics = [...metrics].sort((a, b) => b.value - a.value);
      const highestMetric = highestMetrics[0];
      
      // Sort by change (biggest increase first)
      const biggestChanges = [...metrics].sort((a, b) => b.change - a.change);
      const biggestChange = biggestChanges[0];
      
      // Performance change
      const perfChange = point.performanceScore - prevPoint.performanceScore;
      const perfDirection = perfChange > 0 ? 'increased' : perfChange < 0 ? 'decreased' : 'remained stable';
      
      // Generate interpretation
      if (Math.abs(perfChange) > 10) {
        // Significant performance change
        if (biggestChange.change > 10 && biggestChange.name !== 'sAA') {
          return `At ${point.timePoint}, ${biggestChange.name} showed a notable increase, and performance ${perfDirection} significantly.`;
        } else if (highestMetric.value > 70) {
          return `At ${point.timePoint}, high ${highestMetric.name} aligned with a ${perfChange > 0 ? 'peak' : 'change in'} performance.`;
        } else {
          return `At ${point.timePoint}, performance ${perfDirection} while psychological measures showed mixed responses.`;
        }
      } else {
        // Stable performance
        if (highestMetric.value > 70) {
          return `At ${point.timePoint}, ${highestMetric.name} was elevated while performance remained relatively stable.`;
        } else {
          return `At ${point.timePoint}, all measures showed moderate stability.`;
        }
      }
    });
  }, [correlationData]);

  // Return placeholder when no data is available
  if (correlationData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mt-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Correlation Dashboard</h2>
        <div className="text-center text-gray-700 py-10 font-medium">
          No data available yet. Generate event blocks to see correlations.
        </div>
      </div>
    );
  }

  // Prepare data for chart
  const chartData = correlationData.map(point => ({
    name: point.timePoint,
    IZOF: Math.round(point.izof),
    Momentum: Math.round(point.momentum),
    Flow: Math.round(point.flow),
    sAA: Math.round(point.saa),
    Performance: Math.round(point.performanceScore)
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mt-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Correlation Dashboard</h2>
      
      {/* Chart Visualization using Recharts */}
      <div className="mb-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="IZOF" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Momentum" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Flow" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="sAA" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Performance" stroke="#6366F1" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Data Table */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                Time Point
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                Quarter
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                IZOF
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">
                Momentum
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                Flow
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                sAA (U/mL)
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                Performance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {correlationData.map((point, index) => (
              <tr key={point.timePoint} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="px-3 py-2 whitespace-nowrap font-semibold text-gray-800">
                  {point.timePoint}
                </td>
                <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-800">
                  Q{point.quarter}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="font-semibold text-green-700">{point.originalIzof}</span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="font-semibold text-yellow-700">{point.originalMomentum}</span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="font-semibold text-blue-700">{point.originalFlow}</span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="font-semibold text-red-700">{point.originalSaa}</span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="font-semibold text-indigo-700">{Math.round(point.performanceScore)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Interpretation Block */}
      <div className="bg-blue-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2 text-white">Interpretation</h3>
        <div className="space-y-2">
          {interpretations.map((text, index) => (
            <p key={index} className="text-sm text-white font-medium">
              {text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CorrelationDashboard;