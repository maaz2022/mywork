import { NextResponse } from "next/server";

export async function GET(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  try {
    const res = await fetch(`https://hackinsportswear.co.uk/wp-json/wc/v3/products/${id}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
        ).toString("base64")}`,
      },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
    }
    const product = await res.json();
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching product" }, { status: 500 });
  }
} 