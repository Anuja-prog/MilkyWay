import { GoogleGenAI, Type } from "@google/genai";
import { Customer } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBillMessage = async (customer: Customer, totalAmount: number, dueDate: string, month: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Write a polite, short, and professional WhatsApp message from a Milk Delivery Service to a customer named ${customer.name}.
      
      Details:
      - Month: ${month}
      - Total Bill Amount: ₹${totalAmount}
      - Due Date: ${dueDate}
      - Payment Method: UPI or Cash
      
      The tone should be friendly but professional. Include a placeholder for the UPI ID.
      Do not include a subject line.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Could not generate message.";
  } catch (error) {
    console.error("Error generating bill message:", error);
    return `Hello ${customer.name}, your milk bill for ${month} is ₹${totalAmount}. Please pay by ${dueDate}. Thanks!`;
  }
};

export const optimizeRoute = async (customers: Customer[]): Promise<string[]> => {
  try {
    const addresses = customers.map(c => `${c.name}: ${c.address}`);
    const prompt = `
      I am a milkman with a list of delivery addresses. Please reorder this list to suggest a logical, efficient route sequence to minimize travel time.
      
      Assume a standard city layout. Group nearby addresses.
      
      Addresses:
      ${addresses.join('\n')}
      
      Return ONLY a JSON array of strings with the customer names in the optimized order. 
      Example: ["Name 1", "Name 2"]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING
            }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as string[];
  } catch (error) {
    console.error("Error optimizing route:", error);
    // Fallback: return original order names
    return customers.map(c => c.name);
  }
};

export const analyzeBusinessInsights = async (totalLiters: number, totalIncome: number, customerCount: number): Promise<string> => {
    try {
        const prompt = `
            As a business analyst for a local milk delivery business, provide 3 short, bulleted strategic tips to improve profitability based on today's stats:
            - Daily Milk Delivered: ${totalLiters} Liters
            - Est. Daily Revenue: ₹${totalIncome}
            - Active Customers: ${customerCount}

            Keep it very concise (max 50 words per bullet).
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text || "Keep tracking your daily sales to see insights here.";
    } catch (e) {
        return "Keep tracking your daily sales to see insights here.";
    }
}