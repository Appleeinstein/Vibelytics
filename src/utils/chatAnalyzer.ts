
type AnalysisResult = {
  verdict: string;
  emoji: string;
  explanation: string;
  score: number; // 0-100
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
  }
};

export function analyzeChatConversation(text: string, focusedUser: 'first' | 'second' | 'both' = 'both'): AnalysisResult {
  // Split the text into lines
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // Check for empty input
  if (lines.length < 5) {
    return {
      verdict: "Need more texts",
      emoji: "🤔",
      explanation: "I need more messages to analyze! Paste at least 5 lines of conversation.",
      score: 50,
      flags: { red: [], green: [] }
    };
  }

  // Separate messages from first and second person (assuming alternating messages)
  const firstPersonLines = lines.filter((_, i) => i % 2 === 0);
  const secondPersonLines = lines.filter((_, i) => i % 2 === 1);

  let result: AnalysisResult;

  // Analyze based on the focused user
  if (focusedUser === 'first') {
    result = analyzeUserMessages(firstPersonLines, "first person");
  } else if (focusedUser === 'second') {
    result = analyzeUserMessages(secondPersonLines, "second person");
  } else {
    // Analyze both users and the overall conversation
    const firstPersonResult = analyzeUserMessages(firstPersonLines, "first person");
    const secondPersonResult = analyzeUserMessages(secondPersonLines, "second person");
    
    // Create combined result
    result = analyzeCombinedConversation(lines);
    
    // Add user-specific analysis
    result.userSpecific = {
      firstUser: {
        score: firstPersonResult.score,
        flags: firstPersonResult.flags
      },
      secondUser: {
        score: secondPersonResult.score,
        flags: secondPersonResult.flags
      }
    };
  }

  return result;
}

function analyzeUserMessages(lines: string[], userLabel: string): AnalysisResult {
  // Initialize flags
  const redFlags: string[] = [];
  const greenFlags: string[] = [];
  let score = 50; // Start with a neutral score

  // Check message length
  const messageLengths = lines.map(line => line.length);
  const averageLength = messageLengths.reduce((sum, length) => sum + length, 0) / lines.length;
  const shortMessages = messageLengths.filter(length => length < averageLength * 0.5).length;
  const shortMessageRatio = shortMessages / lines.length;
  
  if (shortMessageRatio > 0.7) {
    redFlags.push("Lots of short, dry replies");
    score -= 15;
  } else if (shortMessageRatio < 0.3) {
    greenFlags.push("Good message length and engagement");
    score += 10;
  }
  
  // Check for enthusiasm indicators
  const exclamationCount = lines.filter(line => line.includes('!')).length;
  const emojiRegex = /[\p{Emoji}\u200d]+/gu; // Unicode emoji regex
  const emojiMatches = lines.join(' ').match(emojiRegex) || [];
  const emojiCount = emojiMatches.length;
  
  const enthusiasmRatio = (exclamationCount + emojiCount) / lines.length;
  if (enthusiasmRatio < 0.1) {
    redFlags.push("Low enthusiasm (few emojis/exclamations)");
    score -= 10;
  } else if (enthusiasmRatio > 0.3) {
    greenFlags.push("High enthusiasm and energy");
    score += 15;
  }
  
  // Check for question engagement
  const questionCount = lines.filter(line => line.includes('?')).length;
  if (questionCount / lines.length < 0.1) {
    redFlags.push("Rarely asks questions");
    score -= 10;
  } else if (questionCount / lines.length > 0.25) {
    greenFlags.push("Shows interest with questions");
    score += 10;
  }
  
  // Common red flag phrases - expanded
  const redFlagPhrases = [
    "k", "kk", "sure", "whatever", "idk", "fine", "ok", "okay", 
    "busy", "nm", "nvm", "we'll see", "maybe", "hmm", "hm", "oh", 
    "so anyway", "gtg", "talk later", "mhm", "i guess", "if you want", 
    "i'll let you know", "i'll see", "i'll try", "we'll talk later"
  ];
  
  const redFlagCount = lines.filter(line => 
    redFlagPhrases.some(phrase => {
      const lowerLine = line.toLowerCase();
      return lowerLine === phrase || 
        lowerLine.includes(` ${phrase} `) || 
        lowerLine.includes(`${phrase}.`) ||
        lowerLine.includes(`${phrase},`) ||
        lowerLine.endsWith(` ${phrase}`);
    })
  ).length;
  
  if (redFlagCount / lines.length > 0.2) {
    redFlags.push("Uses cold, disinterested language");
    score -= 15;
  }
  
  // Common green flag phrases - expanded
  const greenFlagPhrases = [
    "excited", "can't wait", "looking forward", "miss you", 
    "appreciate", "thank you", "thanks for", "love", "care", 
    "happy to", "glad to", "excited to", "wonderful", "amazing",
    "sounds good", "sounds great", "sounds perfect", "perfect", "great idea", 
    "good idea", "i'd love to", "definitely", "absolutely", "for sure"
  ];
  
  const greenFlagCount = lines.filter(line => 
    greenFlagPhrases.some(phrase => 
      line.toLowerCase().includes(phrase)
    )
  ).length;
  
  if (greenFlagCount > 0) {
    if (greenFlagCount / lines.length > 0.3) {
      greenFlags.push("Uses very warm, enthusiastic language");
      score += 20;
    } else {
      greenFlags.push("Uses warm, appreciative language");
      score += 15;
    }
  }
  
  // Check for politeness and gratitude
  const politeLines = lines.filter(line => 
    line.toLowerCase().includes("please") || 
    line.toLowerCase().includes("thank") ||
    line.toLowerCase().includes("appreciate") ||
    line.toLowerCase().includes("sorry")
  ).length;
  
  if (politeLines / lines.length > 0.15) {
    greenFlags.push("Polite and respectful communication");
    score += 10;
  }
  
  // Ensure the score stays within 0-100
  score = Math.max(0, Math.min(100, score));
  
  // Determine overall verdict
  let verdict: string;
  let emoji: string;
  let explanation: string;
  
  if (score >= 85) {
    verdict = "GREEN FLAG";
    emoji = "💚";
    explanation = `The ${userLabel} shows amazing communication! There's strong interest, engagement, and respect.`;
  } else if (score >= 70) {
    verdict = "Looking good!";
    emoji = "✨";
    explanation = `The ${userLabel} shows genuine interest and positive energy.`;
  } else if (score >= 55) {
    verdict = "Promising";
    emoji = "👍";
    explanation = `The ${userLabel} shows potential with some good interaction patterns.`;
  } else if (score >= 40) {
    verdict = "Mixed signals";
    emoji = "🤷‍♀️";
    explanation = `The ${userLabel} is showing both positive and concerning patterns.`;
  } else if (score >= 25) {
    verdict = "Proceed with caution";
    emoji = "⚠️";
    explanation = `The ${userLabel} is showing several concerning communication patterns.`;
  } else {
    verdict = "BOI RUN";
    emoji = "🏃‍♀️";
    explanation = `The ${userLabel}'s messages are giving major red flags! The interest level seems very low.`;
  }
  
  return {
    verdict,
    emoji,
    explanation,
    score,
    flags: {
      red: redFlags,
      green: greenFlags
    }
  };
}

function analyzeCombinedConversation(lines: string[]): AnalysisResult {
  // This is a simplified version of the original function to analyze the conversation as a whole
  // Initialize flags
  const redFlags: string[] = [];
  const greenFlags: string[] = [];
  let score = 50; // Start with a neutral score
  
  // Check message length imbalance
  const messageLengths = lines.map(line => line.length);
  const averageLength = messageLengths.reduce((sum, length) => sum + length, 0) / lines.length;
  const shortMessages = messageLengths.filter(length => length < averageLength * 0.5).length;
  const shortMessageRatio = shortMessages / lines.length;
  
  if (shortMessageRatio > 0.7) {
    redFlags.push("Lots of short, dry replies in conversation");
    score -= 15;
  }
  
  // NEW: Check for one-sided conversation
  // Get conversation participants (assume alternating lines are different people)
  const oddLinesTotal = lines.filter((_, i) => i % 2 === 0).reduce((acc, line) => acc + line.length, 0);
  const evenLinesTotal = lines.filter((_, i) => i % 2 === 1).reduce((acc, line) => acc + line.length, 0);
  
  // Check if one side is doing significantly more talking
  const imbalanceRatio = Math.max(oddLinesTotal, evenLinesTotal) / Math.min(oddLinesTotal, evenLinesTotal);
  if (imbalanceRatio > 3) {
    redFlags.push("Very one-sided conversation");
    score -= 20;
  } else if (imbalanceRatio > 2) {
    redFlags.push("Somewhat one-sided conversation");
    score -= 10;
  } else if (imbalanceRatio < 1.3) {
    greenFlags.push("Balanced conversation flow");
    score += 10;
  }
  
  // NEW: Detect ghosting patterns
  const possibleGhosting = lines.slice(Math.max(0, lines.length - 5)).every(line => 
    line.length > 30 && 
    (line.includes('?') || line.endsWith('!')) && 
    !line.toLowerCase().includes('bye') && 
    !line.toLowerCase().includes('talk later')
  );
  
  if (possibleGhosting && lines.length > 10) {
    redFlags.push("Possible ghosting/no response to important messages");
    score -= 15;
  }
  
  // Ensure the score stays within 0-100
  score = Math.max(0, Math.min(100, score));
  
  // Determine overall verdict
  let verdict: string;
  let emoji: string;
  let explanation: string;
  
  if (score >= 85) {
    verdict = "GREEN FLAG";
    emoji = "💚";
    explanation = "This chat gives off amazing vibes! There's strong mutual interest, engagement, and respect.";
  } else if (score >= 70) {
    verdict = "Looking good!";
    emoji = "✨";
    explanation = "The conversation shows genuine interest and positive energy.";
  } else if (score >= 55) {
    verdict = "Promising";
    emoji = "👍";
    explanation = "This conversation has potential with some good interaction patterns.";
  } else if (score >= 40) {
    verdict = "Mixed signals";
    emoji = "🤷‍♀️";
    explanation = "This could go either way - there are both positive and concerning patterns.";
  } else if (score >= 25) {
    verdict = "Proceed with caution";
    emoji = "⚠️";
    explanation = "There are several concerning patterns in this conversation.";
  } else {
    verdict = "BOI RUN";
    emoji = "🏃‍♀️";
    explanation = "This convo is giving major red flags! The interest level seems very imbalanced.";
  }
  
  return {
    verdict,
    emoji,
    explanation,
    score,
    flags: {
      red: redFlags,
      green: greenFlags
    }
  };
}
