import React from 'react';
import { EventData } from './EventBlockGenerator';
import { StatType } from './PlayerPanel';

interface PerformanceTableProps {
  timelineEvents: EventData[];
}

type TimelineStats = {
  timePoint: number;
  quarter: number;
  points: number;
  assists: number;
  rebounds: number;
  turnovers: number;
  goodDecisions: number;
  badDecisions: number;
}

const PerformanceTable: React.FC<PerformanceTableProps> = ({ 
  timelineEvents 
}) => {
  // Process timeline events into stats structure
  const timelineStats: TimelineStats[] = Array.from({ length: 7 }, (_, index) => ({
    timePoint: index + 1,
    quarter: 0,
    points: 0,
    assists: 0,
    rebounds: 0,
    turnovers: 0,
    goodDecisions: 0,
    badDecisions: 0
  }));

  // Populate timeline stats from events
  timelineEvents.forEach(event => {
    if (event.timelinePoint >= 1 && event.timelinePoint <= 7) {
      const statsIndex = event.timelinePoint - 1;
      const actionCounts: Record<StatType, number> = {
        points: 0,
        assists: 0,
        rebounds: 0,
        turnovers: 0,
        goodDecisions: 0,
        badDecisions: 0
      };

      // Count actions of each type
      event.actions.forEach(action => {
        actionCounts[action]++;
      });

      // Update the stats for this timeline point
      timelineStats[statsIndex] = {
        timePoint: event.timelinePoint,
        quarter: event.quarter,
        points: actionCounts.points,
        assists: actionCounts.assists,
        rebounds: actionCounts.rebounds,
        turnovers: actionCounts.turnovers,
        goodDecisions: actionCounts.goodDecisions,
        badDecisions: actionCounts.badDecisions
      };
    }
  });

  // Calculate total actions for a timeline point
  const calculateTotal = (stats: TimelineStats): number => {
    return (
      stats.points +
      stats.assists +
      stats.rebounds +
      stats.turnovers +
      stats.goodDecisions +
      stats.badDecisions
    );
  };

  // Calculate efficiency score (positive actions / total actions * 100)
  const calculateEfficiency = (stats: TimelineStats): number => {
    const positiveActions = stats.points + stats.assists + stats.rebounds + stats.goodDecisions;
    const totalActions = calculateTotal(stats);
    
    if (totalActions === 0) return 0;
    return Math.round((positiveActions / totalActions) * 100);
  };

  // Determine current active timeline point
  const activeTimelinePoint = timelineEvents.length > 0 
    ? timelineEvents[timelineEvents.length - 1].timelinePoint 
    : 1;

  // Header labels
  const headers = [
    'Time Point', 
    'Quarter',
    'Points', 
    'Assists', 
    'Rebounds', 
    'Turnovers', 
    'Good Dec.', 
    'Bad Dec.', 
    'Total', 
    'Efficiency'
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full">
      <h2 className="text-xl font-bold mb-3 text-gray-900">Performance Summary</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="px-3 py-2 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Generate rows for each timeline point */}
            {timelineStats.map((stats) => {
              const isActive = stats.timePoint === activeTimelinePoint;
              const total = calculateTotal(stats);
              const efficiency = calculateEfficiency(stats);
              
              // Color coding for efficiency
              let efficiencyColor = "text-gray-800 bg-gray-100";
              if (total > 0) {
                efficiencyColor = efficiency >= 70 
                  ? "text-green-800 bg-green-100" 
                  : efficiency >= 40 
                  ? "text-yellow-800 bg-yellow-100" 
                  : "text-red-800 bg-red-100";
              }
              
              return (
                <tr 
                  key={stats.timePoint}
                  className={`${isActive ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900">
                    T{stats.timePoint}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                    {stats.quarter > 0 ? `Q${stats.quarter}` : '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                    {stats.points}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                    {stats.assists}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                    {stats.rebounds}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                    {stats.turnovers}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                    {stats.goodDecisions}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                    {stats.badDecisions}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900">
                    {total}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {total > 0 ? (
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${efficiencyColor}`}>
                        {efficiency}%
                      </span>
                    ) : (
                      <span className="text-gray-700">0%</span>
                    )}
                  </td>
                </tr>
              );
            })}
            
            {/* Totals row */}
            <tr className="bg-gray-200 font-semibold">
              <td className="px-3 py-2 whitespace-nowrap text-gray-900">
                TOTAL
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                -
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                {timelineStats.reduce((sum, point) => sum + point.points, 0)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                {timelineStats.reduce((sum, point) => sum + point.assists, 0)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                {timelineStats.reduce((sum, point) => sum + point.rebounds, 0)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                {timelineStats.reduce((sum, point) => sum + point.turnovers, 0)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                {timelineStats.reduce((sum, point) => sum + point.goodDecisions, 0)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                {timelineStats.reduce((sum, point) => sum + point.badDecisions, 0)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-gray-900">
                {timelineStats.reduce((sum, point) => sum + calculateTotal(point), 0)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                {/* Calculate overall efficiency */}
                {(() => {
                  const totalPositive = timelineStats.reduce(
                    (sum, point) => sum + point.points + point.assists + point.rebounds + point.goodDecisions, 
                    0
                  );
                  const totalActions = timelineStats.reduce(
                    (sum, point) => sum + calculateTotal(point), 
                    0
                  );
                  
                  if (totalActions === 0) return <span className="text-gray-700">0%</span>;
                  
                  const overall = Math.round((totalPositive / totalActions) * 100);
                  const overallColor = overall >= 70 
                    ? "text-green-800 bg-green-100" 
                    : overall >= 40 
                    ? "text-yellow-800 bg-yellow-100" 
                    : "text-red-800 bg-red-100";
                  
                  return (
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${overallColor}`}>
                      {overall}%
                    </span>
                  );
                })()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PerformanceTable;