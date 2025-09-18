"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { aiPoweredAdvisory } from "@/ai/flows/ai-powered-advisory.js";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Loader2, Send, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";


export function AiAdvisor() {
    const [isPending, startTransition] = useTransition();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm your AI farm advisor. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const scrollAreaRef = useRef(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || isPending) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        startTransition(async () => {
            try {
                const response = await aiPoweredAdvisory({
                    location: "Green Valley, CA",
                    cropType: "Grapes",
                    soilData: "pH 6.8, sandy loam",
                    weatherForecast: "Sunny, high 24°C",
                    historicalPerformance: "Yields have been consistent for 5 years.",
                    specificQuery: input,
                });
                const assistantMessage = { role: 'assistant', content: response.advice };
                setMessages(prev => [...prev, assistantMessage]);
            } catch (error) {
                console.error(error);
                const errorMessage = { role: 'assistant', content: "Sorry, I encountered an error. Please try again." };
                setMessages(prev => [...prev, errorMessage]);
            }
        });
    };

    return (
        <Card className="flex flex-col h-[60vh] md:h-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="w-6 h-6 text-primary" />
                    AI-Powered Advisor
                </CardTitle>
                <CardDescription>Chat with our AI to get instant, data-driven advice for your farm.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
                <ScrollArea className="h-full" ref={scrollAreaRef}>
                    <div className="space-y-4 pr-4">
                        {messages.map((message, index) => (
                            <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                {message.role === 'assistant' && (
                                    <Avatar className="w-8 h-8 border">
                                        <AvatarFallback><Bot className="w-5 h-5"/></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`rounded-lg px-3 py-2 max-w-[80%] ${message.role === 'assistant' ? 'bg-secondary' : 'bg-primary text-primary-foreground'}`}>
                                    <p className="text-sm">{message.content}</p>
                                </div>
                                 {message.role === 'user' && (
                                     <Avatar className="w-8 h-8 border">
                                        <AvatarImage src="https://picsum.photos/seed/user99/32/32" data-ai-hint="person avatar" />
                                        <AvatarFallback><User className="w-5 h-5"/></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                        {isPending && (
                            <div className="flex items-start gap-3">
                                 <Avatar className="w-8 h-8 border">
                                    <AvatarFallback><Bot className="w-5 h-5"/></AvatarFallback>
                                </Avatar>
                                <div className="rounded-lg px-3 py-2 bg-secondary">
                                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter>
                <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
                    <Input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about pest control, yields, or anything else..." 
                        disabled={isPending}
                    />
                    <Button type="submit" size="icon" disabled={isPending || !input.trim()}>
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
