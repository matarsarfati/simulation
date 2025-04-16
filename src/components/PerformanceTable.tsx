import React from 'react';
import { EventData } from './EventBlockGenerator';
import { StatType } from './PlayerPanel';
import { calculatePerformanceScore } from '../utils/calculationUtils';

interface PerformanceTableProps {
  timelineEvents: EventData[];
  currentTimelinePoint?: number;
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
  performance: number;
}

/**
 * Calculates a weighted efficiency score based on Hollinger's Game Score formula
 * adapted from Salmerón & Gómez-Haro (2019) with improvements for scale
 */
const calculateHollingerScore = (stats: TimelineStats): { 
    gameScore: number;
    maxPossibleScore: number;
    efficiencyPercentage: number | null;
    hasActions: boolean;
  } => {
    // Count total actions to determine if we have any data
    const totalActions = 
      stats.points + 
      stats.assists + 
      stats.rebounds + 
      stats.turnovers + 
      stats.goodDecisions + 
      stats.badDecisions;
    
    // If no actions, return null for efficiency
    if (totalActions === 0) {
      return { 
        gameScore: 0, 
        maxPossibleScore: 0, 
        efficiencyPercentage: null,
        hasActions: false
      };
    }
    
    // Calculate positive contributions with weights based on Hollinger's formula
    const positiveScore = 
      (stats.points) + 
      (0.7 * stats.rebounds) + 
      (0.7 * stats.assists) + 
      (0.3 * stats.goodDecisions);
    
    // Calculate negative contributions
    const negativeScore = 
      (1.0 * stats.turnovers) + 
      (0.7 * stats.badDecisions);
    
    // Calculate game score (positive - negative)
    const gameScore = positiveScore - negativeScore;
    
    // Minimum threshold for significant contribution
    // This ensures that minimal actions don't result in 100% efficiency
    const SIGNIFICANT_CONTRIBUTION_THRESHOLD = 4.0;
    
    // Scale factor for handling small actions
    // If there are very few actions, we need to be stricter with efficiency rating
    const scaleFactor = Math.min(1.0, totalActions / 8.0);
    
    // Calculate efficiency percentage based on both quality and quantity
    let efficiencyPercentage = 0;
    
    if (gameScore <= 0) {
      // Negative or zero game score
      // Scale from 0-40% based on how negative
      efficiencyPercentage = Math.max(0, 40 + (gameScore * 10));
    } else if (gameScore < SIGNIFICANT_CONTRIBUTION_THRESHOLD) {
      // Small positive contribution
      // Scale from 40-80% based on how close to threshold
      const ratio = gameScore / SIGNIFICANT_CONTRIBUTION_THRESHOLD;
      efficiencyPercentage = 40 + (ratio * 40);
      
      // Apply scale factor to reduce score for minimal actions
      efficiencyPercentage = 40 + ((efficiencyPercentage - 40) * scaleFactor);
    } else {
      // Significant positive contribution
      // Scale from 80-100% based on how much above threshold
      efficiencyPercentage = Math.min(100, 80 + ((gameScore - SIGNIFICANT_CONTRIBUTION_THRESHOLD) * 5));
    }
    
    // Round to nearest whole number
    efficiencyPercentage = Math.round(efficiencyPercentage);
    
    // Special case: If there's only one action and it's positive, cap at 80%
    if (totalActions === 1 && gameScore > 0) {
      efficiencyPercentage = Math.min(efficiencyPercentage, 80);
    }
    
    // Special case: If there are only negative actions, efficiency should be low
    if (positiveScore === 0 && negativeScore > 0) {
      efficiencyPercentage = Math.max(0, Math.min(30, 30 - (negativeScore * 10)));
    }
    
    // Debug log
    console.log(`Timeline T${stats.timePoint} efficiency calculation:`, {
      points: stats.points,
      assists: stats.assists,
      rebounds: stats.rebounds,
      turnovers: stats.turnovers,
      goodDecisions: stats.goodDecisions,
      badDecisions: stats.badDecisions,
      totalActions,
      positiveScore,
      negativeScore,
      gameScore,
      scaleFactor,
      efficiencyPercentage
    });
    
    return { 
      gameScore, 
      maxPossibleScore: positiveScore + negativeScore, // Used for reference
      efficiencyPercentage,
      hasActions: true
    };
  };

  
const PerformanceTable: React.FC<PerformanceTableProps> = ({ 
  timelineEvents,
  currentTimelinePoint = 1
}) => {
  // Process timeline events into stats structure
  // Initialize all timeline points with default values
  const timelineStats: TimelineStats[] = Array.from({ length: 7, }, (_, index) => ({
    timePoint: index + 1,
    quarter: 0,
    points: 0,
    assists: 0,
    rebounds: 0,
    turnovers: 0,
    goodDecisions: 0,
    badDecisions: 0,
    performance: 0
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

      // Calculate performance score using the utility function
      const performanceScore = calculatePerformanceScore(event.actions);

      // Update the stats for this timeline point
      timelineStats[statsIndex] = {
        timePoint: event.timelinePoint,
        quarter: event.quarter,
        points: actionCounts.points,
        assists: actionCounts.assists,
        rebounds: actionCounts.rebounds,
        turnovers: actionCounts.turnovers,
        goodDecisions: actionCounts.goodDecisions,
        badDecisions: actionCounts.badDecisions,
        performance: performanceScore
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

  // Determine current active timeline point
  const activeTimelinePoint = currentTimelinePoint || 
    (timelineEvents.length > 0 ? timelineEvents[timelineEvents.length - 1].timelinePoint : 1);

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
              
              // Calculate efficiency using Hollinger's formula
              const { efficiencyPercentage, hasActions } = calculateHollingerScore(stats);
              
              // Determine efficiency display and styling
              let efficiencyDisplay: React.ReactNode = "—";
              let efficiencyColor = "text-gray-500";
              
              if (hasActions && efficiencyPercentage !== null) {
                // Color coding based on the efficiency score
                efficiencyColor = efficiencyPercentage >= 70 
                  ? "text-green-800 bg-green-100" 
                  : efficiencyPercentage >= 40 
                  ? "text-yellow-800 bg-yellow-100" 
                  : "text-red-800 bg-red-100";
                
                efficiencyDisplay = (
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${efficiencyColor}`}>
                    {efficiencyPercentage}%
                  </span>
                );
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
                    {efficiencyDisplay}
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
                {/* Calculate overall efficiency using Hollinger's method */}
                {(() => {
                  // Aggregate all stats into a single record
                  const totalStats: TimelineStats = {
                    timePoint: 0,
                    quarter: 0,
                    points: timelineStats.reduce((sum, point) => sum + point.points, 0),
                    assists: timelineStats.reduce((sum, point) => sum + point.assists, 0),
                    rebounds: timelineStats.reduce((sum, point) => sum + point.rebounds, 0),
                    turnovers: timelineStats.reduce((sum, point) => sum + point.turnovers, 0),
                    goodDecisions: timelineStats.reduce((sum, point) => sum + point.goodDecisions, 0),
                    badDecisions: timelineStats.reduce((sum, point) => sum + point.badDecisions, 0),
                    performance: 0
                  };
                  
                  // Calculate efficiency for the aggregate stats
                  const { efficiencyPercentage, hasActions } = calculateHollingerScore(totalStats);
                  
                  if (!hasActions || efficiencyPercentage === null) {
                    return <span className="text-gray-700">—</span>;
                  }
                  
                  const overallColor = efficiencyPercentage >= 70 
                    ? "text-green-800 bg-green-100" 
                    : efficiencyPercentage >= 40 
                    ? "text-yellow-800 bg-yellow-100" 
                    : "text-red-800 bg-red-100";
                  
                  return (
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${overallColor}`}>
                      {efficiencyPercentage}%
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