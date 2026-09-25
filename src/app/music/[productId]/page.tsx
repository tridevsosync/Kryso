import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products } from "@/data/catalog";
import { ProductDetailClient } from "./product-detail-client";

interface Props {
  params: Promise<{ productId: string }>;
}

export async function generateStaticParams() {
  return products.map((product) => ({
    productId: product.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;
  const product = products.find((item) => item.id === productId);
  if (!product) {
    return {
      title: "Instrument Not Found | Kryso Music Shop",
    };
  }

  return {
    title: `${product.name} | Kryso Music Shop`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Kryso Music Shop`,
      description: product.description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { productId } = await params;
  const product = products.find((item) => item.id === productId);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
