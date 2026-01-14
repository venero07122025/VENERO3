"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { BiChevronLeft } from "react-icons/bi";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Ventas() {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const goBack = () => router.push("/");

    const iniciarPago = async () => {
        if (!amount || Number(amount) <= 0) {
            toast.error("Ingresa un monto válido");
            return;
        }

        try {
            setLoading(true);

            const res = await fetch("/api/venta-forzada/crear", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: Number(amount) }),
            });

            if (!res.ok) {
                const err = await res.text();
                console.error(err);
                toast.error("Error iniciando el pago");
                setLoading(false);
                return;
            }

            const data = await res.json();

            if (!data.redirectUrl) {
                toast.error("Respuesta inválida del servidor");
                setLoading(false);
                return;
            }

            window.location.href = data.redirectUrl;

        } catch (err) {
            console.error(err);
            toast.error("Error inesperado");
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="max-w-md mx-auto mt-16 p-6 border rounded-lg shadow">

                <button
                    onClick={goBack}
                    className="mb-6 flex items-center text-gray-700 hover:text-black transition cursor-pointer"
                >
                    <BiChevronLeft className="w-6 h-6" />
                    <span>Volver</span>
                </button>

                <h1 className="text-2xl font-bold mb-6 text-center">
                    Venta Forzada
                </h1>

                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border p-3 mb-4 outline-none rounded"
                    placeholder="Monto en USD"
                    disabled={loading}
                />

                <button
                    onClick={iniciarPago}
                    disabled={loading}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded text-white transition ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-black hover:bg-gray-800 cursor-pointer"
                        }`}
                >
                    {loading ? (
                        <>
                            <FaSpinner className="animate-spin" />
                            Procesando pago…
                        </>
                    ) : (
                        "Continuar"
                    )}
                </button>
            </div>
        </ProtectedRoute>
    );
}