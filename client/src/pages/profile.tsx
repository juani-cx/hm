import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { UserProfile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ProfilePage() {
  const { toast } = useToast();
  const userId = "default-user";

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/profile", userId],
  });

  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      const response = await apiRequest("POST", "/api/profile", {
        userId,
        ...profile,
        ...updates,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", userId] });
      toast({
        title: "Success",
        description: "Your preferences have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update preferences.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const currentData = { ...profile, ...formData };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2" data-testid="text-profile-title">
            User Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your shopping preferences and experience settings
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Desired Experience</CardTitle>
              <CardDescription>How would you like us to personalize your experience?</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={currentData.desiredExperience || ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, desiredExperience: value as any }))
                }
                data-testid="radio-desired-experience"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ultra_personalized" id="ultra" data-testid="radio-ultra-personalized" />
                  <Label htmlFor="ultra" className="cursor-pointer">
                    Ultra personalized
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="non_intrusive" id="non-intrusive" data-testid="radio-non-intrusive" />
                  <Label htmlFor="non-intrusive" className="cursor-pointer">
                    Only non intrusive suggestions
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="traditional" id="traditional" data-testid="radio-traditional" />
                  <Label htmlFor="traditional" className="cursor-pointer">
                    I am traditional
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shopping Mood</CardTitle>
              <CardDescription>What kind of shopping experience do you prefer?</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={currentData.shoppingMood || ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, shoppingMood: value as any }))
                }
                data-testid="radio-shopping-mood"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="magazine" id="magazine" data-testid="radio-magazine" />
                  <Label htmlFor="magazine" className="cursor-pointer">
                    Magazine
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="funny_interactive" id="funny" data-testid="radio-funny-interactive" />
                  <Label htmlFor="funny" className="cursor-pointer">
                    Funny and interactive
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fashionist" id="fashionist" data-testid="radio-fashionist" />
                  <Label htmlFor="fashionist" className="cursor-pointer">
                    Fashionist
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Body Type</CardTitle>
              <CardDescription>Help us show you the most relevant fits</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={currentData.bodyType || ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, bodyType: value as any }))
                }
                data-testid="radio-body-type"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="athletic" id="athletic" data-testid="radio-athletic" />
                  <Label htmlFor="athletic" className="cursor-pointer">
                    Athletic Build
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="petite" id="petite" data-testid="radio-petite" />
                  <Label htmlFor="petite" className="cursor-pointer">
                    Petite
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="curvy" id="curvy" data-testid="radio-curvy" />
                  <Label htmlFor="curvy" className="cursor-pointer">
                    Curvy
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tall_slim" id="tall-slim" data-testid="radio-tall-slim" />
                  <Label htmlFor="tall-slim" className="cursor-pointer">
                    Tall & Slim
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="plus_size" id="plus-size" data-testid="radio-plus-size" />
                  <Label htmlFor="plus-size" className="cursor-pointer">
                    Plus Size
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Pages Style</CardTitle>
              <CardDescription>Choose how you'd like to browse products</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={currentData.productPagesStyle || ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, productPagesStyle: value as any }))
                }
                data-testid="radio-product-pages-style"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="magazine" id="magazine-style" data-testid="radio-magazine-style" />
                  <Label htmlFor="magazine-style" className="cursor-pointer">
                    Magazine style
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="board" id="board-style" data-testid="radio-board-style" />
                  <Label htmlFor="board-style" className="cursor-pointer">
                    Board style
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="virtual_gallery" id="gallery-style" data-testid="radio-gallery-style" />
                  <Label htmlFor="gallery-style" className="cursor-pointer">
                    Virtual gallery
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insights Preference</CardTitle>
              <CardDescription>What kind of insights are most valuable to you?</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={currentData.insightsPreference || ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, insightsPreference: value as any }))
                }
                data-testid="radio-insights-preference"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fashion_recommendations" id="fashion-rec" data-testid="radio-fashion-recommendations" />
                  <Label htmlFor="fashion-rec" className="cursor-pointer">
                    Fashion recommendations
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pricing_first" id="pricing" data-testid="radio-pricing-first" />
                  <Label htmlFor="pricing" className="cursor-pointer">
                    Pricing considerations first
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="try_on" id="try-on" data-testid="radio-try-on" />
                  <Label htmlFor="try-on" className="cursor-pointer">
                    Try on
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              onClick={handleSave}
              disabled={updateProfileMutation.isPending || Object.keys(formData).length === 0}
              data-testid="button-save"
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
