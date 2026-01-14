import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export async function POST(req: Request) {
    try {
        const { amount } = await req.json();

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: config } = await supabase
            .from("settings_venero_2")
            .select("stripe_sk")
            .eq("id", 1)
            .single();

        if (!config?.stripe_sk) {
            return NextResponse.json(
                { error: "Stripe no configurado" },
                { status: 500 }
            );
        }

        const stripe = new Stripe(config.stripe_sk);

        const orderId = `ORD-${Date.now()}`;

        await supabase.from("orders").insert({
            external_id: orderId,
            amount,
            currency: "usd",
            status: "pending",
        });

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            customer_email: "auto@forzado.com",
            billing_address_collection: "auto",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: { name: "Venta Forzada" },
                        unit_amount: Math.round(amount * 100),
                    },
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/ventas/resultado?status=Aprobada&orden=${orderId}&monto=${amount}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/ventas/resultado?status=Rechazada&orden=${orderId}&monto=${amount}`,
        });

        return NextResponse.json({ redirectUrl: session.url });

    } catch (err: any) {
        console.error(err);
        return NextResponse.json(
            { error: "Error interno" },
            { status: 500 }
        );
    }
}