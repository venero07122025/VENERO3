"use client";

import { useSearchParams } from "next/navigation";
import { FaCheck, FaXmark } from "react-icons/fa6";

export default function Resultado() {
    const params = useSearchParams();

    const status = params.get("status");
    const orden = params.get("orden");
    const monto = params.get("monto");

    const aprobado = status === "Aprobada";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow text-center">
                <div className="flex justify-center mb-4">
                    {aprobado ? (
                        <FaCheck className="w-16 h-16 text-green-500" />
                    ) : (
                        <FaXmark className="w-16 h-16 text-red-500" />
                    )}
                </div>

                <h1 className="text-2xl font-bold mb-2">
                    {aprobado ? "Pago aprobado" : "Pago rechazado"}
                </h1>

                <p className="text-gray-600 mb-6">
                    {aprobado
                        ? "Tu pago fue procesado correctamente."
                        : "No se pudo completar el pago."}
                </p>

                <div className="border rounded p-4 text-left text-sm mb-6">
                    <p><strong>Orden:</strong> {orden}</p>
                    <p><strong>Monto:</strong> ${monto} USD</p>
                </div>

                <a
                    href="/ventas"
                    className="inline-block w-full bg-black text-white py-3 rounded hover:bg-gray-800 transition"
                >
                    Volver
                </a>
            </div>
        </div>
    );
}