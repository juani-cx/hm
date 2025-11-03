import { LoadingCard } from '../LoadingCard';

export default function LoadingCardExample() {
  return (
    <div className="p-4 grid grid-cols-2 gap-4 max-w-md">
      <LoadingCard />
      <LoadingCard />
    </div>
  );
}