import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: Request) {
  try {
    const { payment_intent, payment_intent_client_secret } = await req.json();
    console.log("Verifying payment:", { payment_intent, payment_intent_client_secret });

    // Retrieve the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent);
    console.log("Payment Intent details:", {
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      client_secret: paymentIntent.client_secret,
      received_client_secret: payment_intent_client_secret,
      currency: paymentIntent.currency,
      payment_method: paymentIntent.payment_method,
      created: new Date(paymentIntent.created * 1000).toISOString(),
    });

    // Verify the client secret matches
    if (paymentIntent.client_secret !== payment_intent_client_secret) {
      console.log("Client secret mismatch:", {
        expected: paymentIntent.client_secret,
        received: payment_intent_client_secret
      });
      return NextResponse.json(
        { verified: false, error: "Invalid client secret" },
        { status: 400 }
      );
    }

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

    console.log("Payment verified successfully");
    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { verified: false, error: "Error verifying payment" },
      { status: 500 }
    );
  }
} 