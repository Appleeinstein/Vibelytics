import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Button, Progress, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from "./ui-kit";

type AnalysisResultProps = {
  result: {
    verdict: string;
    emoji: string;
    explanation: string;
    score: number;
    flags: {
      red: string[];
      green: string[];
    };
    userSpecific?: {
      firstUser: {
        score: number;
        flags: {
          red: string[];
          green: string[];
        }
      };
      secondUser: {
        score: number;
        flags: {
          red: string[];
          green: string[];
        }
      };
    };
  };
  onReset: () => void;
};

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, onReset }) => {
  const [activeTab, setActiveTab] = useState("overall");

  // Updated function to get background color based on score ranges
  const getBgColor = (score: number) => {
    if (score >= 75) return 'bg-gradient-to-br from-green-800/50 to-emerald-700/50 border-green-600/30';
    if (score >= 60) return 'bg-gradient-to-br from-green-900/50 to-emerald-800/50 border-green-700/30';
    if (score >= 45) return 'bg-gradient-to-br from-amber-900/50 to-yellow-800/50 border-amber-700/30';
    if (score >= 30) return 'bg-gradient-to-br from-orange-900/50 to-amber-800/50 border-orange-700/30';
    return 'bg-gradient-to-br from-rose-900/50 to-red-800/50 border-red-700/30';
  };

  // Updated function to get progress color based on score ranges
  const getProgressColor = (score: number) => {
    if (score >= 75) return 'bg-gradient-to-r from-emerald-500 to-green-400';
    if (score >= 60) return 'bg-gradient-to-r from-green-600 to-emerald-500';
    if (score >= 45) return 'bg-gradient-to-r from-amber-600 to-yellow-500';
    if (score >= 30) return 'bg-gradient-to-r from-orange-600 to-amber-500';
    return 'bg-gradient-to-r from-rose-600 to-red-500';
  };

  const getVerdict = (verdict: string, emoji: string) => {
    return (
      <span className="text-2xl md:text-4xl font-bold flex items-center justify-center gap-2">
        {verdict}
        <span className="animate-bounce-subtle inline-block">{emoji}</span>
      </span>
    );
  };

  // Function to render flags
  const renderFlags = (redFlags: string[], greenFlags: string[]) => (
    <div className="grid md:grid-cols-2 gap-4">
      {redFlags.length > 0 && (
        <div className="backdrop-blur-sm bg-black/20 p-4 rounded-lg border border-red-900/30">
          <h3 className="text-lg font-semibold mb-2 text-vibered">Red Flags</h3>
          <div className="flex flex-wrap gap-2">
            {redFlags.map((flag, index) => (
              <Badge key={index} variant="outline" className="bg-red-900/30 text-red-300 border-red-700/50">
                🚩 {flag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {greenFlags.length > 0 && (
        <div className="backdrop-blur-sm bg-black/20 p-4 rounded-lg border border-green-900/30">
          <h3 className="text-lg font-semibold mb-2 text-vibegreen">Green Flags</h3>
          <div className="flex flex-wrap gap-2">
            {greenFlags.map((flag, index) => (
              <Badge key={index} variant="outline" className="bg-green-900/30 text-green-300 border-green-700/50">
                💚 {flag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Score visualization
  const renderScoreBar = (score: number) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-vibered">Red Flag</span>
        <span className="text-vibegreen">Green Flag</span>
      </div>
      <Progress 
        value={score} 
        className="h-3 rounded-full bg-black/50" 
        style={{
          background: 'linear-gradient(to right, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3))',
        }}
        indicatorClassName={getProgressColor(score)}
      />
      <div className="text-center text-sm mt-1 text-gray-300">
        Vibe Score: {score}/100
      </div>
    </div>
  );

  return (
    <Card className={`w-full max-w-3xl mx-auto animate-fade-in shadow-xl card-fancy ${getBgColor(result.score)}`}>
      <CardHeader className="text-center">
        <CardTitle className="text-glow bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-200">
          {getVerdict(result.verdict, result.emoji)}
        </CardTitle>
        <CardDescription className="text-lg mt-2 text-gray-300">{result.explanation}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Show tabs if we have user-specific analysis */}
        {result.userSpecific ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full bg-black/20 p-1">
              <TabsTrigger className="tab-fancy" value="overall">Overall</TabsTrigger>
              <TabsTrigger className="tab-fancy" value="person1">First Person</TabsTrigger>
              <TabsTrigger className="tab-fancy" value="person2">Second Person</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overall" className="space-y-6 mt-4">
              {renderScoreBar(result.score)}
              {renderFlags(result.flags.red, result.flags.green)}
            </TabsContent>
            
            <TabsContent value="person1" className="space-y-6 mt-4">
              {renderScoreBar(result.userSpecific.firstUser.score)}
              {renderFlags(
                result.userSpecific.firstUser.flags.red, 
                result.userSpecific.firstUser.flags.green
              )}
              <div className={`text-center mt-2 p-3 backdrop-blur-sm bg-black/20 rounded-lg border ${
                result.userSpecific.firstUser.score >= 75 ? 'border-green-600/30' : 
                result.userSpecific.firstUser.score >= 60 ? 'border-green-700/30' : 
                result.userSpecific.firstUser.score >= 45 ? 'border-amber-700/30' : 
                result.userSpecific.firstUser.score >= 30 ? 'border-orange-700/30' :
                'border-red-700/30'
              }`}>
                <p className="text-white/80">
                  {result.userSpecific.firstUser.score >= 75 ? (
                    "This person is showing excellent positive communication patterns!"
                  ) : result.userSpecific.firstUser.score >= 60 ? (
                    "This person shows strong interest and positive communication!"
                  ) : result.userSpecific.firstUser.score >= 45 ? (
                    "This person shows mixed communication patterns."
                  ) : result.userSpecific.firstUser.score >= 30 ? (
                    "This person shows some concerning communication patterns."
                  ) : (
                    "This person's messages contain very concerning communication patterns."
                  )}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="person2" className="space-y-6 mt-4">
              {renderScoreBar(result.userSpecific.secondUser.score)}
              {renderFlags(
                result.userSpecific.secondUser.flags.red, 
                result.userSpecific.secondUser.flags.green
              )}
              <div className={`text-center mt-2 p-3 backdrop-blur-sm bg-black/20 rounded-lg border ${
                result.userSpecific.secondUser.score >= 75 ? 'border-green-600/30' : 
                result.userSpecific.secondUser.score >= 60 ? 'border-green-700/30' : 
                result.userSpecific.secondUser.score >= 45 ? 'border-amber-700/30' : 
                result.userSpecific.secondUser.score >= 30 ? 'border-orange-700/30' :
                'border-red-700/30'
              }`}>
                <p className="text-white/80">
                  {result.userSpecific.secondUser.score >= 75 ? (
                    "This person is showing excellent positive communication patterns!"
                  ) : result.userSpecific.secondUser.score >= 60 ? (
                    "This person shows strong interest and positive communication!"
                  ) : result.userSpecific.secondUser.score >= 45 ? (
                    "This person shows mixed communication patterns."
                  ) : result.userSpecific.secondUser.score >= 30 ? (
                    "This person shows some concerning communication patterns."
                  ) : (
                    "This person's messages contain very concerning communication patterns."
                  )}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <>
            {renderScoreBar(result.score)}
            {renderFlags(result.flags.red, result.flags.green)}
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-center pb-6">
        <Button onClick={onReset} className="button-dark-gradient text-white">
          Analyze Another Chat
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AnalysisResult;
