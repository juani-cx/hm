import { StoryViewer } from '../StoryViewer';
import autumn from '@assets/generated_images/Story_card_autumn_look_7a4bbbf6.png';
import summer from '@assets/generated_images/Story_card_summer_look_b5f6c911.png';

export default function StoryViewerExample() {
  const looks = [
    {
      id: '1',
      title: 'Autumn Layers',
      items: [
        { sku: 'SKU001', name: 'Trench Coat', price: 89 },
        { sku: 'SKU002', name: 'White Turtleneck', price: 29 },
      ]
    },
    {
      id: '2',
      title: 'Summer Fresh',
      items: [
        { sku: 'SKU003', name: 'Floral Dress', price: 59 },
      ]
    }
  ];

  return (
    <StoryViewer
      storyTitle="Autumn Essentials"
      looks={looks}
      images={[autumn, summer]}
      onClose={() => console.log('Close clicked')}
      onShopLook={(id) => console.log('Shop look:', id)}
    />
  );
}