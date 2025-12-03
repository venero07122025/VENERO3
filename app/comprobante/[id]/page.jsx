"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

export default async function Comprobante({ params }) {
    const { id } = params;

    const { data } = await supabase
        .from("transactions")
        .select("*, users(full_name)")
        .eq("id", id)
        .single();

    return (
        <ProtectedRoute>
            <Navbar />
            <div className="p-6 max-w-xl mx-auto space-y-4">
                <h1 className="text-3xl font-bold mb-4">Comprobante</h1>

                <p><strong>Monto:</strong> S/ {data.amount}</p>
                <p><strong>Estado:</strong> {data.status}</p>
                <p><strong>Tarjeta:</strong> **** {data.card_last4}</p>
                <p><strong>Fecha:</strong> {new Date(data.created_at).toLocaleString()}</p>
                <p><strong>Operador:</strong> {data.users?.full_name || "—"}</p>
                <p><strong>ID Stripe:</strong> {data.stripe_payment_id}</p>
            </div>
        </ProtectedRoute>
    );
}