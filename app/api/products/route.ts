import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://hackinsportswear.co.uk/wp-json/wc/v3/products", {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
        ).toString("base64")}`,
      },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
    const products = await res.json();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching products" }, { status: 500 });
  }
} 