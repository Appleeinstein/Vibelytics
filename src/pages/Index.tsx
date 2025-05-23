import React, { useState } from 'react';
import ChatSampleForm from '@/components/ChatSampleForm';
import AnalysisResult from '@/components/AnalysisResult';
import { analyzeChatConversation } from '@/utils/chatAnalyzer';
import { useToast } from "@/components/ui-kit";

const Index = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof analyzeChatConversation> | null>(null);
  const { toast } = useToast();

  const handleAnalyze = (text: string, focusedUser: 'first' | 'second' | 'both' = 'both') => {
    setAnalyzing(true);
    
    // Small delay to show we're "thinking" (purely for UX)
    setTimeout(() => {
      try {
        // Always set focusedUser to 'both' to ensure we always get the detailed analysis for both users
        const analysisResult = analyzeChatConversation(text, 'both');
        setResult(analysisResult);
      } catch (error) {
        toast({
          title: "Analysis Error",
          description: "Something went wrong while analyzing the chat. Please try again.",
          variant: "destructive"
        });
      } finally {
        setAnalyzing(false);
      }
    }, 1500);
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-dark-gradient">
      <div className="container py-10">
        {analyzing ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="animate-pulse-slow text-center backdrop-blur-md bg-black/30 p-10 rounded-xl border border-violet-500/20 shadow-lg">
              <div className="text-2xl font-bold mb-3 text-glow bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-200">Analyzing vibes...</div>
              <div className="text-6xl">✨</div>
            </div>
          </div>
        ) : result ? (
          <AnalysisResult result={result} onReset={handleReset} />
        ) : (
          <ChatSampleForm onAnalyze={handleAnalyze} />
        )}
        
        <footer className="mt-16 text-center text-sm text-gray-400">
          <p>Vibelytics - A fun tool for overanalyzing your messages 😅</p>
          <p className="mt-1">All analysis happens locally in your browser - your chats never leave your device!</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
