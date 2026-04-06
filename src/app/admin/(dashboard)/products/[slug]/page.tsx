import ProductForm from "../_components/ProductForm";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { slug } = await params;
  return <ProductForm mode="edit" productId={slug} />;
}
