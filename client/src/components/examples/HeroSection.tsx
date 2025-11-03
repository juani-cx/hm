import { HeroSection } from '../HeroSection';

export default function HeroSectionExample() {
  return <HeroSection onEnterFlow={() => console.log('Enter flow clicked')} />;
}