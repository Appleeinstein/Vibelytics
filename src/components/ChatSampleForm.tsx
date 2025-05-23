import React, { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from "./ui-kit";

type ChatSampleFormProps = {
  onAnalyze: (text: string, focusedUser: 'first' | 'second' | 'both') => void;
};

const SAMPLE_CONVERSATIONS = {
  positive: 
`Hey! How was your day? 
Pretty good! Just finished a big project at work. How about yours?
That's awesome! Congrats on finishing the project! 🎉
Mine was good too - went for a run and feeling great!
I've been meaning to get back into running! Any tips?
Start slow and be consistent! Would love to go for a run together sometime?
That would be fun! I'm free this weekend if you want to try?
Sounds perfect! Looking forward to it! 😊
Me too! I'll text you Saturday morning then!
Can't wait! 💪`,

  negative:
`Hey
Hi
What's up
nm
Cool
Did you want to go out this weekend?
Idk. Maybe.
Oh ok. We could go to that new restaurant?
We'll see
k, let me know
k
Are you mad at me?
Whatever
Fine`,

  mixed:
`Hey! How are you?
Good
Did you have a good day?
It was fine
Cool! Want to get coffee this weekend?
Idk
Is everything alright?
Yea
Ok... just checking because you seem distant
I'm just busy
I understand. Let me know when you're free
k
Miss you! 💕
👍`
};

const ChatSampleForm: React.FC<ChatSampleFormProps> = ({ onAnalyze }) => {
  const [chatText, setChatText] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [shouldGlow, setShouldGlow] = useState(false);

  // Check if chat text was pasted or manually changed
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setChatText(newText);
    
    // If text was suddenly added in a large chunk, it was likely pasted
    if (newText.length > chatText.length + 10) {
      setShouldGlow(true);
    }
  };

  // Reset glow effect after some time
  useEffect(() => {
    if (shouldGlow) {
      const timer = setTimeout(() => {
        setShouldGlow(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [shouldGlow]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatText.trim().length > 0) {
      onAnalyze(chatText, 'both'); // Always analyze both users
    }
  };

  const loadSample = (type: keyof typeof SAMPLE_CONVERSATIONS) => {
    setChatText(SAMPLE_CONVERSATIONS[type]);
    setActiveTab(type);
    setShouldGlow(true);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl card-fancy bg-dark-gradient">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-center text-2xl md:text-4xl font-bold text-glow bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-200">
            Vibelytics
          </CardTitle>
          <CardDescription className="text-center text-lg text-gray-300">
            Paste your conversation below to get a playful vibe check! 
            <br />
            <span className="text-sm text-muted-foreground">Built with ❤️ by <a href="https://www.instagram.com/_harshhero?igsh=MXRrNDlydDFrdTQ1bg%3D%3D&utm_source=qr" className="text-blue-500 hover:underline">Harsh</a></span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Textarea 
            placeholder="Paste your conversation here... (Insta Dms, Imessage, WhatsApp chats, etc.)"
            className="min-h-[200px] font-mono text-sm resize-y p-4 input-fancy placeholder:text-gray-500"
            value={chatText}
            onChange={handleTextChange}
          />
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-center text-gray-400">Or try a sample conversation:</p>
            <Tabs defaultValue="" value={activeTab || ""} className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full bg-black/20 p-1">
                <TabsTrigger className="tab-fancy" value="positive" onClick={() => loadSample('positive')}>Positive</TabsTrigger>
                <TabsTrigger className="tab-fancy" value="mixed" onClick={() => loadSample('mixed')}>Mixed Signals</TabsTrigger>
                <TabsTrigger className="tab-fancy" value="negative" onClick={() => loadSample('negative')}>Red Flags</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pb-8">
          <Button 
            type="submit" 
            className={`button-dark-gradient text-white px-8 py-6 text-lg transition-all ${shouldGlow ? 'button-glow' : 'button-no-glow'}`}
            disabled={chatText.trim().length === 0}
          >
            Analyze the Vibes ✨
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ChatSampleForm;
