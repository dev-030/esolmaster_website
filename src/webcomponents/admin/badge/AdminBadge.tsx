/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import * as Icons from "lucide-react";
import { useCreateBadgeMutation } from "@/api/badge";
import { BadgeConditionType } from "@/api/badge/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const conditionTypes: BadgeConditionType[] = [
  "COMPLETE_TASKS_WITHIN_DAYS",
  "SCORE_PERCENTAGE",
  "CONSECUTIVE_SCORE_PERCENTAGE",
  "SCORE_PERCENTAGE_IN_TASKS_WITHIN_DAYS",
  "XP_WITHIN_TIME",
  "STREAK_DAYS",
  "ATTEMPT_COUNT",
];

const conditionLabels: Record<BadgeConditionType, string> = {
  COMPLETE_TASKS_WITHIN_DAYS: "Complete Tasks Within Days",
  SCORE_PERCENTAGE: "Score Percentage",
  CONSECUTIVE_SCORE_PERCENTAGE: "Consecutive Score Percentage",
  SCORE_PERCENTAGE_IN_TASKS_WITHIN_DAYS:
    "Score Percentage in Tasks Within Days",
  XP_WITHIN_TIME: "XP Within Time",
  STREAK_DAYS: "Streak Days",
  ATTEMPT_COUNT: "Attempt Count",
};

// Get all icon names from lucide-react
const getAllIconNames = () => {
  return Object.keys(Icons).filter(
    (key) =>
      key !== "createLucideIcon" &&
      key !== "default" &&
      typeof (Icons as any)[key] === "function",
  );
};

// Popular icons grouped by category
const iconCategories = {
  Gaming: [
    "Trophy",
    "Award",
    "Medal",
    "Crown",
    "Star",
    "Gem",
    "Gamepad2",
    "Swords",
  ],
  Achievement: [
    "BadgeCheck",
    "Verified",
    "CheckCircle",
    "Target",
    "Flag",
    "Ribbon",
  ],
  Progress: ["Flame", "Rocket", "TrendingUp", "Zap", "Brain", "Lightbulb"],
  Social: ["Users", "Heart", "ThumbsUp", "Share2", "Award"],
};

export const AdminBadge = () => {
  const createBadgeMutation = useCreateBadgeMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconName, setIconName] = useState("Trophy");
  const [searchTerm, setSearchTerm] = useState("");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [conditionType, setConditionType] =
    useState<BadgeConditionType>("SCORE_PERCENTAGE");
  const [activeTab, setActiveTab] = useState("popular");

  const [config, setConfig] = useState<Record<string, number>>({
    minPercentage: 80,
  });

  const allIcons = useMemo(() => getAllIconNames(), []);

  const filteredIcons = useMemo(() => {
    if (!searchTerm) return [];
    return allIcons.filter((icon) =>
      icon.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, allIcons]);

  const SelectedIcon = (Icons as any)[iconName] || Icons.Trophy;

  const updateConditionType = (type: BadgeConditionType) => {
    setConditionType(type);

    const configMap = {
      COMPLETE_TASKS_WITHIN_DAYS: { targetTasks: 10, withinDays: 7 },
      SCORE_PERCENTAGE: { minPercentage: 80 },
      CONSECUTIVE_SCORE_PERCENTAGE: { minPercentage: 80, consecutiveTasks: 5 },
      SCORE_PERCENTAGE_IN_TASKS_WITHIN_DAYS: {
        minPercentage: 80,
        targetTasks: 10,
        withinDays: 30,
      },
      XP_WITHIN_TIME: { targetXp: 500, withinDays: 7 },
      STREAK_DAYS: { targetDays: 7 },
      ATTEMPT_COUNT: { targetAttempts: 20 },
    };

    setConfig(configMap[type] || { minPercentage: 80 });
  };

  const handleConfigChange = (key: string, value: string) => {
    setConfig((prev) => ({
      ...prev,
      [key]: Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createBadgeMutation.mutateAsync({
        name,
        description,
        iconName,
        conditionType,
        conditionConfig: config,
        isActive: true,
      });

      toast.success("Badge created successfully!");

      // Reset form
      setName("");
      setDescription("");
      setIconName("Trophy");
      setConditionType("SCORE_PERCENTAGE");
      setConfig({ minPercentage: 80 });
    } catch (error) {
      toast.error("Failed to create badge");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Badge</h1>
          <p className="text-muted-foreground mt-2">
            Design and configure dynamic badge rules for achievements
          </p>
        </div>

        {/* Live Preview Card */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50">
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>See how your badge will look</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed p-8">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
                <SelectedIcon
                  size={80}
                  className="relative text-primary"
                  strokeWidth={1.5}
                />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold">{name || "Badge Name"}</h3>
                <p className="text-muted-foreground ">
                  {description || "Badge description will appear here"}
                </p>
                <Badge variant="secondary" className="mt-2">
                  {conditionLabels[conditionType]}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Define the badge details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Badge Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., XP Master, Task Champion"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what users need to do to earn this badge"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Icon *</Label>
              <Dialog open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
                <DialogTrigger
                  className="inline-flex items-center justify-start whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground w-full gap-2 h-auto py-3 px-4"
                >
                  <SelectedIcon className="h-5 w-5" />
                  <span>{iconName}</span>
                  <span className="ml-auto text-muted-foreground">
                    Change
                  </span>
                </DialogTrigger>
                <DialogContent className=" max-h-[80vh] min-w-md">
                  <DialogHeader>
                    <DialogTitle>Choose an Icon</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <Input
                      placeholder="Search icons..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />

                    {searchTerm ? (
                      <ScrollArea className="h-[60vh]">
                        <div className="grid grid-cols-6 gap-2">
                          {filteredIcons.slice(0, 100).map((icon) => {
                            const IconComponent = (Icons as any)[icon];
                            return (
                              <Button
                                key={icon}
                                variant={
                                  iconName === icon ? "default" : "outline"
                                }
                                className="h-auto flex-col gap-1 p-3"
                                onClick={() => {
                                  setIconName(icon);
                                  setIconPickerOpen(false);
                                  setSearchTerm("");
                                }}
                              >
                                <IconComponent className="h-6 w-6" />
                                <span className="text-xs truncate w-full">
                                  {icon}
                                </span>
                              </Button>
                            );
                          })}
                        </div>
                        {filteredIcons.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            No icons found
                          </div>
                        )}
                      </ScrollArea>
                    ) : (
                      <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="popular">Popular</TabsTrigger>
                          <TabsTrigger value="gaming">Gaming</TabsTrigger>
                          <TabsTrigger value="achievement">
                            Achievement
                          </TabsTrigger>
                          <TabsTrigger value="progress">Progress</TabsTrigger>
                        </TabsList>

                        {Object.entries(iconCategories).map(
                          ([category, icons]) => (
                            <TabsContent
                              key={category}
                              value={category.toLowerCase()}
                              className="mt-4"
                            >
                              <ScrollArea className="h-[50vh]">
                                <div className="grid grid-cols-6 gap-2">
                                  {icons.map((icon) => {
                                    const IconComponent = (Icons as any)[icon];
                                    return (
                                      <Button
                                        key={icon}
                                        variant={
                                          iconName === icon
                                            ? "default"
                                            : "outline"
                                        }
                                        className="h-auto flex-col gap-1 p-3"
                                        onClick={() => {
                                          setIconName(icon);
                                          setIconPickerOpen(false);
                                        }}
                                      >
                                        <IconComponent className="h-6 w-6" />
                                        <span className="text-xs truncate w-full">
                                          {icon}
                                        </span>
                                      </Button>
                                    );
                                  })}
                                </div>
                              </ScrollArea>
                            </TabsContent>
                          ),
                        )}
                      </Tabs>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <p className="text-xs text-muted-foreground">
                Choose from {allIcons.length}+ icons or search for specific ones
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Condition Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Condition Rules</CardTitle>
            <CardDescription>
              Define how users can earn this badge
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Condition Type</Label>
              <Select
                value={conditionType}
                onValueChange={(value) =>
                  updateConditionType(value as BadgeConditionType)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {conditionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {conditionLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border p-4 space-y-3">
              <Label>Configuration Parameters</Label>
              {Object.entries(config).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <Label className="text-sm capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={value}
                    onChange={(e) => handleConfigChange(key, e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={createBadgeMutation.isPending}
            className="flex-1"
            size="lg"
          >
            {createBadgeMutation.isPending ? "Creating..." : "Create Badge"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => {
              setName("");
              setDescription("");
              setIconName("Trophy");
              setConditionType("SCORE_PERCENTAGE");
              setConfig({ minPercentage: 80 });
            }}
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
};
