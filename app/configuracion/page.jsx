"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { BiChevronLeft } from "react-icons/bi";
import { useRouter } from "next/navigation";

export default function Configuracion() {
    const [settings, setSettings] = useState(null);
    const router = useRouter();

    const fetchSettings = async () => {
        const { data, error } = await supabase
            .from("settings")
            .select("*")
            .eq("id", 1)
            .maybeSingle();

        if (error) {
            toast.error("Error cargando configuración");
            return;
        }

        if (!data) {
            setSettings("no-config");
        } else {
            setSettings(data);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const goBack = () => router.back();

    const createDefault = async () => {
        const { error } = await supabase.from("settings").insert([
            {
                id: 1,
                stripe_mode: "test",
                stripe_pk: "",
                stripe_sk: "",
                receiver_account: "",
            },
        ]);

        if (error) {
            toast.error("Error creando configuración");
        } else {
            toast.success("Configuración creada");
            fetchSettings();
        }
    };

    const save = async () => {
        if (!settings || settings === "no-config") return;

        const payload = {
            stripe_mode: settings.stripe_mode,
            stripe_pk: settings.stripe_pk || "",
            stripe_sk: settings.stripe_sk || "",
            receiver_account: settings.receiver_account || "",
            updated_at: new Date(),
        };

        const { error } = await supabase
            .from("settings")
            .update(payload)
            .eq("id", 1);

        if (error) {
            toast.error("Error guardando");
        } else {
            toast.success("Guardado correctamente");
            fetchSettings();
        }
    };

    if (settings === null) return "Cargando...";

    if (settings === "no-config") {
        return (
            <ProtectedRoute>
                <Navbar />

                <div className="p-6 max-w-xl mx-auto">
                    <button
                        onClick={goBack}
                        className="mb-6 flex items-center text-gray-700 hover:text-black cursor-pointer"
                    >
                        <BiChevronLeft className="w-6 h-6" /> Volver
                    </button>

                    <h1 className="text-3xl font-bold mb-4">Configuración</h1>

                    <p className="text-red-500 font-semibold mb-4">
                        No existe configuración en la base de datos.
                    </p>

                    <button
                        onClick={createDefault}
                        className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                        Crear configuración por defecto
                    </button>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <Navbar />

            <div className="p-6 max-w-xl mx-auto">
                <button
                    onClick={goBack}
                    className="mb-6 flex items-center text-gray-700 hover:text-black cursor-pointer"
                >
                    <BiChevronLeft className="w-6 h-6" /> Volver
                </button>

                <h1 className="text-3xl font-bold mb-6">Configuración</h1>

                <div className="space-y-4">
                    {/* Modo */}
                    <select
                        value={settings.stripe_mode}
                        onChange={(e) =>
                            setSettings({ ...settings, stripe_mode: e.target.value })
                        }
                        className="w-full border p-3 rounded"
                    >
                        <option value="test">Modo Test</option>
                        <option value="live">Modo Live</option>
                    </select>

                    {/* PK */}
                    <input
                        value={settings.stripe_pk || ""}
                        onChange={(e) =>
                            setSettings({ ...settings, stripe_pk: e.target.value })
                        }
                        placeholder="Stripe Public Key"
                        className="w-full border p-3 rounded"
                    />

                    {/* SK */}
                    <input
                        value={settings.stripe_sk || ""}
                        onChange={(e) =>
                            setSettings({ ...settings, stripe_sk: e.target.value })
                        }
                        placeholder="Stripe Secret Key"
                        className="w-full border p-3 rounded"
                    />

                    {/* Receiver Account */}
                    <input
                        value={settings.receiver_account || ""}
                        onChange={(e) =>
                            setSettings({
                                ...settings,
                                receiver_account: e.target.value,
                            })
                        }
                        placeholder="Receiver Account (opcional)"
                        className="w-full border p-3 rounded"
                    />

                    {/* Botón Guardar */}
                    <button
                        onClick={save}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </ProtectedRoute>
    );
}