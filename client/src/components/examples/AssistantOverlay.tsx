import { AssistantOverlay } from '../AssistantOverlay';

export default function AssistantOverlayExample() {
  return (
    <div className="h-screen bg-background">
      <AssistantOverlay suggestions={['Show me winter looks', 'What goes with jeans?', 'Sustainable options']} />
    </div>
  );
}