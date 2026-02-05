
import { GoogleGenAI, Type } from "@google/genai";

// Initialize with named parameter and direct process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Compares Government ID image against registered name.
 * Target: 90% similarity.
 */
export const verifyIdentityIntegrity = async (idBase64: string, registeredName: string): Promise<{ confidence: number; verified: boolean; reason: string }> => {
  const imagePart = {
    inlineData: {
      data: idBase64.split(',')[1] || idBase64,
      mimeType: "image/jpeg"
    }
  };

  const prompt = `Analyze this government ID. 
  1. Extract the full name from the ID.
  2. Compare it with the registered name: "${registeredName}".
  3. Evaluate the authenticity of the ID document.
  4. Provide a similarity score between 0 and 100 for the names.
  5. Check if the document appears tampered.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts: [imagePart, { text: prompt }] },
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extractedName: { type: Type.STRING },
            similarity: { type: Type.NUMBER },
            isTampered: { type: Type.BOOLEAN },
            reason: { type: Type.STRING }
          },
          required: ["extractedName", "similarity", "isTampered", "reason"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    const isVerified = (result.similarity || 0) >= 90 && !result.isTampered;

    return {
      confidence: result.similarity || 0,
      verified: isVerified,
      reason: result.reason || "Verification completed"
    };
  } catch (error) {
    console.error("Identity Verification Error", error);
    return { confidence: 0, verified: false, reason: "Verification service unreachable" };
  }
};

/**
 * Compares live face capture with ID image for biometric verification.
 */
export const compareFaceWithId = async (idBase64: string, faceBase64: string): Promise<{ confidence: number; verified: boolean; reason: string }> => {
  const idPart = {
    inlineData: {
      data: idBase64.split(',')[1] || idBase64,
      mimeType: "image/jpeg"
    }
  };
  const facePart = {
    inlineData: {
      data: faceBase64.split(',')[1] || faceBase64,
      mimeType: "image/jpeg"
    }
  };

  const prompt = `Compare the person in the government ID (Image 1) with the live face capture (Image 2).
  Are they the same person?
  1. Look for facial features, bone structure, and distinctive marks.
  2. Provide a biometric confidence score (0-100).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts: [idPart, facePart, { text: prompt }] },
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSamePerson: { type: Type.BOOLEAN },
            confidence: { type: Type.NUMBER },
            reason: { type: Type.STRING }
          },
          required: ["isSamePerson", "confidence", "reason"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      confidence: result.confidence || 0,
      verified: !!(result.isSamePerson && result.confidence >= 85),
      reason: result.reason || "Face comparison completed"
    };
  } catch (error) {
    console.error("Face Comparison Error", error);
    return { confidence: 0, verified: false, reason: "Comparison service error" };
  }
};

/**
 * Compares property documents with registered owner name.
 */
export const verifyDocumentOwnership = async (docBase64: string, ownerName: string): Promise<boolean> => {
  const imagePart = {
    inlineData: {
      data: docBase64.split(',')[1] || docBase64,
      mimeType: "image/jpeg"
    }
  };

  const prompt = `This is a property deed/document. Does the name "${ownerName}" appear as the owner or beneficiary? 
  Check for exact or high-similarity name match (90%+).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts: [imagePart, { text: prompt }] },
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchFound: { type: Type.BOOLEAN },
            confidence: { type: Type.NUMBER }
          },
          required: ["matchFound", "confidence"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return !!(result.matchFound && result.confidence >= 90);
  } catch (error) {
    console.error("Document Ownership Verification Error", error);
    return false;
  }
};
