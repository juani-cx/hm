import { StoryFeed } from '../StoryFeed';
import autumn from '@assets/generated_images/Story_card_autumn_look_7a4bbbf6.png';
import summer from '@assets/generated_images/Story_card_summer_look_b5f6c911.png';
import workwear from '@assets/generated_images/Story_card_workwear_look_a3ea8ce1.png';

export default function StoryFeedExample() {
  const stories = [
    { id: '1', title: 'Autumn Essentials', imageUrl: autumn, lookCount: 6, tags: ['Sustainability'] },
    { id: '2', title: 'Summer Breeze', imageUrl: summer, lookCount: 4, tags: ['Fresh'] },
    { id: '3', title: 'Office Chic', imageUrl: workwear, lookCount: 5, tags: ['Professional'] },
    { id: '4', title: 'Weekend Vibes', imageUrl: autumn, lookCount: 3 },
  ];
  
  return <StoryFeed stories={stories} onStoryClick={(id) => console.log('Story clicked:', id)} />;
}