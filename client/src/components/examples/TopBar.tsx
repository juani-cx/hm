import { TopBar } from '../TopBar';

export default function TopBarExample() {
  return (
    <TopBar
      cartCount={3}
      onSearchClick={() => console.log('Search clicked')}
      onCartClick={() => console.log('Cart clicked')}
      onProfileClick={() => console.log('Profile clicked')}
    />
  );
}