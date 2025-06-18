import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: Request) {
  try {
    const { paymentIntentId } = await req.json();
    console.log("Verifying payment status for intent:", paymentIntentId);

    if (!paymentIntentId) {
      console.log("No payment intent ID provided");
      return NextResponse.json(
        { verified: false, error: "No payment intent ID provided" },
        { status: 400 }
      );
    }

    // Retrieve the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log("Payment Intent details:", {
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      created: new Date(paymentIntent.created * 1000).toISOString(),
    });

    // Check if the payment was successful
    if (paymentIntent.status !== "succeeded") {
      console.log("Payment not successful, status:", paymentIntent.status);
      return NextResponse.json(
        { verified: false, error: `Payment not successful. Status: ${paymentIntent.status}` },
        { status: 400 }
      );
    }

    // Verify the amount matches our expected amount (4999 pence = £49.99)
    if (paymentIntent.amount !== 4999) {
      console.log("Amount mismatch:", {
        expected: 4999,
        received: paymentIntent.amount,
        currency: paymentIntent.currency
      });
      return NextResponse.json(
        { verified: false, error: `Invalid payment amount. Expected: £49.99, Received: £${(paymentIntent.amount / 100).toFixed(2)}` },
        { status: 400 }
      );
    }

    console.log("Payment status verified successfully");
    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("Error verifying payment status:", error);
    return NextResponse.json(
      { verified: false, error: "Error verifying payment status" },
      { status: 500 }
    );
  }
} 