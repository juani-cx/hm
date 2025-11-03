import { QuickPreferences } from '../QuickPreferences';

export default function QuickPreferencesExample() {
  return (
    <div className="h-screen bg-background flex items-center justify-center">
      <QuickPreferences
        onComplete={(prefs) => console.log('Preferences:', prefs)}
        onSkip={() => console.log('Skipped')}
      />
    </div>
  );
}