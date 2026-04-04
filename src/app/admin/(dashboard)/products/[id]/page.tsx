import ProductForm from "../_components/ProductForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  return <ProductForm mode="edit" productId={id} />;
}
