import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
    try {
        const { searchParams, origin } = new URL(req.url);

        const estatus = searchParams.get("estatus");
        const orden = searchParams.get("orden");
        const monto = searchParams.get("monto");

        if (!estatus || !orden) {
            return NextResponse.json(
                { error: "Parámetros inválidos" },
                { status: 400 }
            );
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { error } = await supabase
            .from("orders")
            .update({
                status: estatus === "Aprobada" ? "paid" : "failed",
            })
            .eq("external_id", orden);

        if (error) {
            console.error("❌ Supabase update error:", error);
            return NextResponse.json(
                { error: "Error actualizando orden" },
                { status: 500 }
            );
        }

        // ✅ REDIRECT ABSOLUTO CORRECTO
        return NextResponse.redirect(
            `${origin}/ventas/resultado?status=${estatus}&orden=${orden}&monto=${monto}`
        );

    } catch (err: any) {
        console.error("🔥 Confirmación crash:", err);
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}