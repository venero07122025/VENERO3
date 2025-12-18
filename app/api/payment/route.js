import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
    ("⏳ Iniciando POST /api/pagar ...");

    try {
        const body = await req.json();
        ("📥 Body recibido:", body);

        ("🔑 Creando cliente de Supabase...");
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        ("📡 Consultando settings...");
        const { data: settings, error: settingsError } = await supabase
            .from("settings")
            .select("*")
            .eq("id", 1)
            .single();

        ("📄 Settings:", settings);

        if (settingsError) {
            ("❌ Error consultando settings:", settingsError);
            return NextResponse.json(
                { error: "Error leyendo configuración" },
                { status: 400 }
            );
        }

        if (!settings || !settings.stripe_sk) {
            ("❌ No hay Stripe SK configurada.");
            return NextResponse.json(
                { error: "Stripe no está configurado" },
                { status: 400 }
            );
        }

        ("💳 Inicializando Stripe...");
        const stripe = new Stripe(settings.stripe_sk);

        const token = body.token || "tok_visa";
        ("💳 Token usado:", token);

        ("⚡ Creando PaymentIntent...");
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(Number(body.amount) * 100),
            currency: "pen",
            payment_method_types: ["card"],

            payment_method_data: {
                type: "card",
                card: { token }
            },

            confirm: true,
        });

        ("✅ PaymentIntent creado:", paymentIntent);

        const last4 =
            paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.last4 || null;

        ("💠 Últimos 4 dígitos:", last4);

        ("📝 Guardando transacción en Supabase...");
        const { data: insertData, error: insertError } = await supabase
            .from("transactions")
            .insert({
                amount: Number(body.amount),
                operator_id: settings.current_operator_id || null,
                status: paymentIntent.status,
                stripe_id: paymentIntent.id,
                stripe_payment_id: paymentIntent.latest_charge,
                card_last4: last4
            })
            .select()
            .single();

        if (insertError) {
            ("❌ Error insertando transacción:", insertError);
            return NextResponse.json(
                { error: "Error guardando transacción", details: insertError },
                { status: 400 }
            );
        }

        ("🟢 Transacción guardada:", insertData);

        return NextResponse.json({
            ok: true,
            payment: paymentIntent,
            transaction: insertData
        });

    } catch (err) {
        ("🔥 Error en /api/pagar:", err);
        return NextResponse.json(
            { error: err.message },
            { status: 400 }
        );
    }
}