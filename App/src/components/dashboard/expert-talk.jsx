import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone } from "lucide-react";

const experts = [
  {
    id: 1,
    name: "Dr. Anya Sharma",
    specialty: "Soil Health",
    center: "Greenfield Agri-Research",
    avatarUrl: "https://picsum.photos/seed/expert1/100/100",
  },
  {
    id: 2,
    name: "Dr. Ben Carter",
    specialty: "Pest Management",
    center: "Valley Crop Protection",
    avatarUrl: "https://picsum.photos/seed/expert2/100/100",
  },
  {
    id: 3,
    name: "Dr. Chloe Garcia",
    specialty: "Irrigation Tech",
    center: "Aqua-Growth Solutions",
    avatarUrl: "https://picsum.photos/seed/expert3/100/100",
  },
];

export function ExpertTalk() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-6 h-6 text-primary" />
          Expert Talk
        </CardTitle>
        <CardDescription>
          Connect with local agricultural advisory centers for personalized advice.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {experts.map((expert) => (
          <div key={expert.id} className="rounded-lg border bg-card p-4 flex flex-col items-center text-center gap-2">
            <Image
              src={expert.avatarUrl}
              alt={`Portrait of ${expert.name}`}
              width={80}
              height={80}
              className="rounded-full"
              data-ai-hint="person portrait"
            />
            <div className="space-y-1">
                <p className="font-semibold">{expert.name}</p>
                <p className="text-xs text-muted-foreground">{expert.center}</p>
            </div>
            <Badge variant="outline">{expert.specialty}</Badge>
            <Button size="sm" className="w-full mt-2">Schedule Call</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
