import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { X, Send, Bot, User, Shield, Heart } from 'lucide-react';

interface AIChatProps {
  onClose: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const sampleResponses = [
  "Thank you for your question. This is a very important topic and I'm glad you want to learn.",
  "Based on accurate information, I can tell you that...",
  "Don't worry, this question is normal and many teens want to know the same thing.",
  "For more detailed information, I suggest you discuss with a health professional.",
  "Remember, taking care of reproductive health is a shared responsibility between you and your partner."
];

export function AIChat({ onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hi! I\'m Jun Kang AI, your personal assistant for reproductive health questions. Whatever you ask will remain private and safe. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const randomResponse = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: randomResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col bg-white">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Jun Kang AI</h3>
                <p className="text-xs text-gray-600">Personal Health Assistant</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center space-x-1">
              <Shield size={12} />
              <span className="text-xs">Private</span>
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 flex items-center space-x-1">
              <Heart size={12} />
              <span className="text-xs">Stigma-Free</span>
            </Badge>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-blue-500' 
                      : 'bg-gradient-to-br from-green-500 to-blue-500'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="text-white" size={16} />
                    ) : (
                      <Bot className="text-white" size={16} />
                    )}
                  </div>
                  <div className={`rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <span className={`text-xs ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'} block mt-1`}>
                      {message.timestamp.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                    <Bot className="text-white" size={16} />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex space-x-3">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your question here..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping}>
              <Send size={16} />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            🔒 All conversations are private and not stored
          </p>
        </div>
      </Card>
    </div>
  );
}