
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, QuizDifficulty, AIModelId, ChatMessage, ChatAttachment } from "../types";

export const getAIAssistance = async (
  prompt: string, 
  modelId: AIModelId = 'gemini-flash', 
  history: ChatMessage[] = [],
  attachments?: ChatAttachment[]
): Promise<{ text: string, sources?: { title: string, uri: string }[], generatedImage?: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Detection for image generation requests
  const isImageRequest = /image|photo|बनाओ|चित्र|फोटो|पेंट|आर्ट|इमेज|दृश्य|create|generate|viz|draw|portrait|पिक्चर|तस्वीर|world|place|person|people|व्यक्ति|स्थान|विश्व/i.test(prompt);
  const isQuestionRequest = /question|प्रश्न|mcq|pyq|test|mock/i.test(prompt);
  
  // Verbosity detection
  const isShortRequest = /short|संक्षेप|छोटा|brief|summary|बिंदुओं|points/i.test(prompt);
  const isDetailedRequest = /detail|विस्तार|बड़ा|long|explain|वर्णन/i.test(prompt);

  const detectAspectRatio = (p: string): "1:1" | "3:4" | "4:3" | "9:16" | "16:9" => {
    const text = p.toLowerCase();
    if (text.includes("9:16") || text.includes("portrait")) return "9:16";
    if (text.includes("16:9") || text.includes("landscape")) return "16:9";
    return "1:1"; 
  };

  // Model Selection Strategy
  let modelToUse = 'gemini-3-flash-preview'; 
  if (isImageRequest) {
    modelToUse = 'gemini-2.5-flash-image';
  } else if (modelId === 'gemini-pro' || modelId === 'gpt-4' || modelId === 'gpt-5') {
    modelToUse = 'gemini-3-pro-preview'; 
  }

  const personalityMap: Partial<Record<AIModelId, string>> = {
    'gemini-flash': "सामान्य जानकारी और त्वरित उत्तर के लिए विशेषज्ञ।",
    'gemini-pro': "तकनीकी शोध और गहरे विश्लेषण के लिए विशेषज्ञ।",
    'gpt-4': "वैश्विक डेटा और जटिल समस्याओं के समाधान के लिए विशेषज्ञ।",
    'gpt-5': "अत्याधुनिक तकनीक और भविष्य के रुझानों के लिए विशेषज्ञ।",
    'deepseek': "वैज्ञानिक डेटा और कोडिंग समस्याओं के लिए विशेषज्ञ।",
    'kimi': "सटीक तथ्यों और दस्तावेज़ सत्यापन के लिए विशेषज्ञ।"
  };

  const currentPersonality = personalityMap[modelId] || "एक मददगार एआई सहायक।";

  try {
    const contents: any[] = [];
    
    if (!isImageRequest) {
      history.slice(-6).forEach(msg => {
        const parts: any[] = [{ text: msg.text }];
        if (msg.attachments) {
          msg.attachments.forEach(att => {
            parts.push({ inlineData: { data: att.data, mimeType: att.mimeType } });
          });
        }
        contents.push({ role: msg.role === 'model' ? 'model' : 'user', parts });
      });
    }

    let lengthInstruction = "";
    if (isShortRequest) lengthInstruction = "उत्तर अत्यंत संक्षिप्त और केवल मुख्य बिंदुओं में दें।";
    if (isDetailedRequest) lengthInstruction = "उत्तर विस्तार से और गहराई से समझाते हुए दें।";

    let finalPrompt = "";
    if (isImageRequest) {
      finalPrompt = `Create a high-quality visual for: "${prompt}". Focus on cinematic quality and realism. Ensure accuracy for subjects like ${prompt}.`;
    } else {
      const quizNote = isQuestionRequest ? "\n[उपयोगकर्ता के लिए परीक्षा स्तर के MCQ तैयार करें।]" : "";
      finalPrompt = `${prompt}${quizNote}${lengthInstruction ? `\n[महत्वपूर्ण निर्देश: ${lengthInstruction}]` : ""}`;
    }

    const currentParts: any[] = [{ text: finalPrompt }];
    if (attachments && attachments.length > 0) {
      attachments.forEach(att => {
        currentParts.push({ inlineData: { data: att.data, mimeType: att.mimeType } });
      });
    }

    contents.push({ role: 'user', parts: currentParts });

    const response = await ai.models.generateContent({
      model: modelToUse, 
      contents,
      config: {
        systemInstruction: isImageRequest 
          ? "You are a master of visual creation. Generate high-fidelity images of anything requested (people, places, world, objects)."
          : `आप PQP CORE के एक अत्यंत बुद्धिमान और मददगार सहायक हैं। ${currentPersonality} 
             उपयोगकर्ता के किसी भी सवाल का स्पष्ट जवाब दें। 
             यदि उपयोगकर्ता 'संक्षेप' में जानकारी मांगे तो केवल मुख्य बिंदु लिखें। 
             यदि उपयोगकर्ता 'विस्तार' में मांगे तो पूरी व्याख्या करें।
             जवाब के लिए हिंदी भाषा का प्रयोग करें। महत्वपूर्ण जानकारी को **बोल्ड** करें।`,
        temperature: isImageRequest ? 1.0 : 0.7,
        tools: isImageRequest ? undefined : [{ googleSearch: {} }],
        imageConfig: isImageRequest ? { aspectRatio: detectAspectRatio(prompt) } : undefined
      }
    });
    
    let text = "";
    let generatedImage: string | undefined = undefined;
    const sources: { title: string, uri: string }[] = [];

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) text += part.text;
        if (part.inlineData) {
          generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
        if (chunk.web && chunk.web.uri) {
          sources.push({ title: chunk.web.title || "जानकारी का स्रोत", uri: chunk.web.uri });
        }
      });
    }

    if (!text && !generatedImage) {
      text = "क्षमा करें, मैं इस समय जानकारी नहीं दे पा रहा हूँ। कृपया अपना प्रश्न फिर से पूछें।";
    }

    return { text: text.trim(), sources, generatedImage };
  } catch (error: any) {
    console.error("Critical AI Failure:", error);
    return { text: `सिस्टम अभी थोड़ा व्यस्त है। कृपया एक बार फिर से अपना सवाल लिखें।` };
  }
};

export const generateQuiz = async (topic: string, difficulty: QuizDifficulty = 'intermediate'): Promise<QuizQuestion[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 5 high-quality bilingual MCQ questions for: "${topic}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.NUMBER },
              explanation: { type: Type.STRING }
            },
            required: ["id", "question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) { 
    console.error("Quiz Gen Error:", error);
    return [];
  }
};
