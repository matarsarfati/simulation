import { StatType } from '../components/PlayerPanel';
import { SurveyResponses } from '../components/SurveyModal';
import { SAALevel } from '../components/SAADisplay';

/**
 * Calculates a normalized performance score (0-100) based on player actions
 * @param actions Array of player actions
 * @returns Performance score between 0-100
 */
export const calculatePerformanceScore = (actions: StatType[]): number => {
  // Define weights for different action types
  const weights: Record<StatType, number> = {
    points: 10,      // Points are highly valued
    assists: 8,      // Assists are valuable playmaking
    rebounds: 6,     // Rebounds show good positioning
    turnovers: -5,   // Turnovers are negative
    goodDecisions: 7, // Good decisions contribute to success
    badDecisions: -6  // Bad decisions hurt performance
  };
  
  // Calculate the weighted sum of all actions
  const rawScore = actions.reduce((total, action) => total + weights[action], 0);
  
  // Normalize to 0-100 scale and ensure it stays within range
  // Adding offset to center around 50 for a balanced score
  return Math.max(0, Math.min(100, rawScore + 50));
};

/**
 * Calculates a salivary alpha-amylase (sAA) value based on psychological survey responses
 * Uses a model based on sport psychology research where:
 * - Emotional arousal (IZOF) increases sAA (more arousal = more stress)
 * - Flow can reduce sAA when in optimal range (5-7) but very high or low flow can increase it
 * - Momentum moderates the relationship
 * 
 * @param responses Survey responses for IZOF, momentum, and flow
 * @returns Object containing sAA value and level category
 */
export const calculateSAAValue = (responses: SurveyResponses): { value: number, level: SAALevel } => {
  // Base sAA value - typical baseline is 30-40 U/mL 
  const baseValue = 35;
  
  // IZOF (emotional arousal) has direct positive relationship with sAA
  // Higher arousal = higher stress marker
  const arousalContribution = responses.emotionalArousal * 3; // 3-27 contribution
  
  // Flow has a U-shaped relationship with stress - optimal flow (5-7) reduces stress
  // Very low flow (disengaged) or very high flow (hyper-engaged) can increase stress
  let flowContribution = 0;
  if (responses.flow < 4) {
    // Low flow = higher stress (disengagement/frustration)
    flowContribution = (4 - responses.flow) * 3; // 0-9 contribution
  } else if (responses.flow > 7) {
    // Very high flow = potential hyper-arousal
    flowContribution = (responses.flow - 7) * 2; // 0-4 contribution
  } else {
    // Optimal flow (4-7) reduces stress
    flowContribution = -((responses.flow - 4) * 2); // -0 to -6 contribution
  }
  
  // Momentum moderates the overall response
  // Low momentum amplifies stress response, high momentum reduces it
  const momentumFactor = 1.5 - (responses.momentum * 0.1); // 1.4 to 0.6 factor
  
  // Calculate raw value with biological variability
  const biologicalVariability = Math.random() * 8 - 4; // -4 to +4 random adjustment
  
  // Combine all factors
  let calculatedValue = baseValue + 
    (arousalContribution * momentumFactor) + 
    flowContribution + 
    biologicalVariability;
  
  // Round to nearest whole number and ensure realistic range (30-160 U/mL)
  calculatedValue = Math.round(Math.max(30, Math.min(160, calculatedValue)));
  
  // Determine level based on established clinical thresholds
  let level: SAALevel = 'moderate';
  if (calculatedValue < 50) level = 'low';
  else if (calculatedValue > 80) level = 'high';
  
  return {
    value: calculatedValue,
    level
  };
};

/**
 * Normalizes a value from one range to another
 * @param value The value to normalize
 * @param fromMin Original range minimum
 * @param fromMax Original range maximum
 * @param toMin Target range minimum
 * @param toMax Target range maximum
 * @returns Normalized value
 */
export const normalizeValue = (
  value: number, 
  fromMin: number, 
  fromMax: number, 
  toMin: number, 
  toMax: number
): number => {
  return ((value - fromMin) / (fromMax - fromMin)) * (toMax - toMin) + toMin;
};

/**
 * Calculates a composite score that represents the athlete's psychological state
 * @param responses Survey responses
 * @returns Psychological state score (0-100)
 */
export const calculatePsychologicalState = (responses: SurveyResponses): number => {
  // Optimal zone is having moderate-high IZOF (4-7), high momentum (7-9), and high flow (7-9)
  
  // IZOF has an inverted-U relationship with performance
  let izofScore = 0;
  if (responses.emotionalArousal >= 4 && responses.emotionalArousal <= 7) {
    izofScore = 100; // Optimal arousal zone
  } else {
    // Penalize deviation from optimal zone
    izofScore = 100 - (Math.abs(5.5 - responses.emotionalArousal) * 15);
  }
  
  // Momentum has a linear relationship with performance
  const momentumScore = normalizeValue(responses.momentum, 1, 9, 30, 100);
  
  // Flow has a linear relationship with performance
  const flowScore = normalizeValue(responses.flow, 1, 9, 30, 100);
  
  // Weight the contributions (IZOF is most critical in sports psychology)
  const compositeScore = (izofScore * 0.4) + (momentumScore * 0.3) + (flowScore * 0.3);
  
  // Ensure boundaries
  return Math.max(0, Math.min(100, compositeScore));
};