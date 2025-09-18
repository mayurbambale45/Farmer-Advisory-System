import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const posts = [
  {
    id: 1,
    user: "Alex",
    avatar: "https://picsum.photos/seed/farmer1/40/40",
    question: "Has anyone tried the new drought-resistant corn variety? Seeing good results so far.",
    time: "5m ago",
  },
  {
    id: 2,
    user: "Maria",
    avatar: "https://picsum.photos/seed/farmer2/40/40",
    question: "Best organic solution for potato beetles? They are relentless this year.",
    time: "1hr ago",
  },
    {
    id: 3,
    user: "Kenji",
    avatar: "https://picsum.photos/seed/farmer3/40/40",
    question: "Looking for advice on transitioning a field to no-till. What are the first steps?",
    time: "3hr ago",
  },
];

export function FarmerCommunity() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          Farmer Community
        </CardTitle>
        <CardDescription>
          Connect with other farmers, share knowledge, and ask questions.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4 overflow-y-auto">
        {posts.map((post) => (
          <div key={post.id} className="flex items-start gap-3">
            <Avatar className="w-9 h-9 border">
              <AvatarImage src={post.avatar} alt={post.user} data-ai-hint="person avatar"/>
              <AvatarFallback>{post.user.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{post.user}</p>
                <p className="text-xs text-muted-foreground">{post.time}</p>
              </div>
              <p className="text-sm text-muted-foreground">{post.question}</p>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <div className="flex w-full items-center space-x-2">
          <Input placeholder="Ask a question..." />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Post question</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
