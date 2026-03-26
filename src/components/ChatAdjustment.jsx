import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Loader2, Sparkles, ChefHat } from 'lucide-react';
import { getChatHistory, saveChatHistory, getMealPlan, saveMealPlan, getUserProfile, logAdjustment } from '../utils/localStorageUtils';
import { adjustMealPlan } from '../utils/geminiApi';

const ChatAdjustment = ({ setView, setMealPlan, setIsLoadingGlobal }) => {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load chat history or set initial greeting
    const history = getChatHistory();
    if (history.length === 0) {
      const initialGreet = {
        role: 'agent',
        content: "Hi there! I'm your NutriSense AI Coach. 🥗 How's your day going? Need to adjust today's meals or skipped a meal?"
      };
      setMessages([initialGreet]);
      saveChatHistory([initialGreet]);
    } else {
      setMessages(history);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textOverride) => {
    const text = textOverride || inputVal;
    if (!text.trim()) return;

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInputVal('');
    saveChatHistory(newMessages);
    setIsTyping(true);

    try {
      const profile = getUserProfile();
      let currentPlan = getMealPlan();
      
      // We assume user is adjusting the current day. For simplicity, we just pass the first day or Monday
      // In a real app, we would determine "Today" by actual date. Here we use Day 0.
      const currentDayData = currentPlan?.days?.[0]; 

      if (!profile || !currentDayData) {
        throw new Error("Missing profile or meal plan logic. Did you complete onboarding?");
      }

      // Call Gemini for adjustment
      const response = await adjustMealPlan(profile, currentDayData, text);

      // response should have the adjusted day AND an agentReply
      const updatedDayData = {
        day: response.day || currentDayData.day,
        meals: response.meals,
        totalCalories: response.totalCalories,
        macros: response.macros
      };

      // Update the main meal plan in local storage
      const newWeeklyPlan = { ...currentPlan };
      newWeeklyPlan.days[0] = updatedDayData; // Update just that day
      
      saveMealPlan(newWeeklyPlan);
      logAdjustment(text, currentDayData.day);
      setMealPlan(newWeeklyPlan);

      const agentReply = {
        role: 'agent',
        content: response.agentReply || "I've carefully adjusted your day's meals based on what you told me! Let me know if you need anything else."
      };

      const finalMessages = [...newMessages, agentReply];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);

    } catch (err) {
      const errorMsg = { role: 'agent', content: "Oops, I couldn't process that. " + (err.message || "Please try again.") };
      const finalMsg = [...newMessages, errorMsg];
      setMessages(finalMsg);
      saveChatHistory(finalMsg);
    } finally {
      setIsTyping(false);
    }
  };

  const quickActions = [
    "I skipped breakfast",
    "I had a heavy lunch",
    "I'm feeling sick",
    "I want something spicy for dinner"
  ];

  return (
    <div className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto h-screen flex flex-col bg-[#f0f2f5] relative overflow-hidden">
      
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center shadow-sm z-10 border-b border-gray-100 sticky top-0">
        <button onClick={() => setView('mealplan')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center ml-2">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3 relative shadow-inner">
            <ChefHat className="w-5 h-5 text-green-600" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-[15px] leading-tight flex items-center gap-1">NutriSense Coach <Sparkles className="w-3 h-3 text-yellow-400 fill-yellow-400"/></h2>
            <p className="text-xs text-green-600 font-medium tracking-wide">Always Active</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 flex flex-col relative z-0 hide-scrollbar" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%239C92AC\\' fill-opacity=\\'0.05\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')"}}>
        
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-green-500 text-white rounded-tr-sm' 
                : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'
            }`}>
              <p className="text-[15px] leading-relaxed break-words font-medium">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm border border-gray-100">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-2 tracking-element" />
      </div>

      {/* Quick Actions & Input wrapper - positioned above bottom nav space */}
      <div className="bg-transparent pb-[84px] sticky bottom-0 z-10">
        
        {/* Quick actions (fade bg so it looks cool floating) */}
        <div className="bg-gradient-to-t from-white to-transparent pt-6 pb-3 px-4 flex overflow-x-auto hide-scrollbar gap-2">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => handleSend(action)}
              disabled={isTyping}
              className="whitespace-nowrap bg-white border border-gray-200 text-gray-600 text-[13px] font-medium px-4 py-2 rounded-full shadow-sm hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all disabled:opacity-50"
            >
              "{action}"
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="bg-white px-4 py-3 border-t border-gray-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="relative flex items-center">
            <input
              type="text"
              className="w-full bg-gray-100 text-gray-800 rounded-full pl-5 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-medium text-[15px]"
              placeholder="Message your Coach..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              disabled={isTyping}
            />
            <button
              onClick={() => handleSend()}
              disabled={isTyping || !inputVal.trim()}
              className="absolute right-1.5 p-2.5 bg-green-500 text-white rounded-full hover:bg-green-600 focus:outline-none disabled:opacity-50 disabled:bg-gray-300 transition-colors shadow-sm"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 translate-x-[-1px] translate-y-[1px]" />}
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default ChatAdjustment;
