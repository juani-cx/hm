import { ProductDetailPage } from '../ProductDetailPage';
import jacket from '@assets/generated_images/Product_leather_jacket_a13fb76c.png';
import sweater from '@assets/generated_images/Product_knit_sweater_77d57eeb.png';

export default function ProductDetailPageExample() {
  const product = {
    sku: 'SKU001',
    name: 'Premium Leather Jacket',
    price: 199,
    images: [jacket, sweater],
    description: 'Classic leather jacket with a modern twist. Features premium leather construction, multiple pockets, and adjustable waist. Perfect for layering in transitional weather.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'Black',
    material: 'Genuine Leather',
    sustainTags: ['Eco-friendly tanning', 'Recycled lining'],
    stock: 12,
  };

  return (
    <ProductDetailPage
      product={product}
      onClose={() => console.log('Close PDP')}
      onAddToCart={(sku, size) => console.log('Add to cart:', sku, size)}
    />
  );
}