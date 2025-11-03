import { StoryCard } from '../StoryCard';
import heroImage from '@assets/generated_images/Story_card_autumn_look_7a4bbbf6.png';

export default function StoryCardExample() {
  return (
    <div className="p-4 max-w-sm">
      <StoryCard
        id="1"
        title="Autumn Essentials"
        imageUrl={heroImage}
        lookCount={6}
        tags={['Sustainability']}
        onClick={() => console.log('Story card clicked')}
      />
    </div>
  );
}