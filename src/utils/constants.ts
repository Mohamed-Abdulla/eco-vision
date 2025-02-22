export const reportingPrompt = `You are an expert in waste management and recycling. Analyze this image and provide:
1. The type of waste (e.g., plastic, paper, glass, metal, organic)
2. An estimate of the quantity or amount (in kg or liters)
3. Your confidence level in this assessment (as a percentage)

Respond in JSON format like this:
{
  "wasteType": "type of waste",
  "quantity": "estimated quantity with unit",
  "confidence": confidence level as a number between 0 and 1
}`;
