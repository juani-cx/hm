import { OnboardingWizard } from "@/components/OnboardingWizard";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { UserProfile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const userId = "default-user";

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/profile", userId],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (preferences: Partial<UserProfile>) => {
      const response = await apiRequest("POST", "/api/profile", {
        userId,
        ...profile,
        ...preferences,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", userId] });
      toast({
        title: "Welcome!",
        description: "Your preferences have been saved.",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleComplete = (preferences: Partial<UserProfile>) => {
    updateProfileMutation.mutate(preferences);
  };

  return <OnboardingWizard onComplete={handleComplete} initialData={profile} />;
}
