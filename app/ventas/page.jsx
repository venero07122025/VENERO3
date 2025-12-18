"use client";

import { useForm } from "react-hook-form";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BiChevronLeft } from "react-icons/bi";

export default function Ventas() {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm();
    const router = useRouter();

    const [expValue, setExpValue] = useState("");

    const handleExpChange = (e) => {
        let value = e.target.value.replace(/\D/g, "");

        if (value.length >= 3) {
            value = value.slice(0, 4);
            value = value.replace(/(\d{2})(\d{1,2})/, "$1/$2");
        }

        setExpValue(value);
        setValue("exp", value, { shouldValidate: true });
    };

    const onSubmit = async (values) => {
        try {
            ("📤 Enviando al backend:", values);

            toast.loading("Procesando pago...");

            const res = await fetch("/api/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            ("📥 Respuesta cruda:", res);

            const json = await res.json();
            ("📥 JSON:", json);

            toast.dismiss();

            if (!res.ok) {
                console.error("❌ Error desde el server:", json.error);
                return toast.error(json.error);
            }

            toast.success("Pago aprobado 👍");

        } catch (e) {
            toast.dismiss();
            console.error("🔥 Error en submit:", e);
            toast.error("Error procesando pago");
        }
    };

    const goBack = () => router.back();

    return (
        <ProtectedRoute>
            <Navbar />

            <div className="p-6 max-w-xl mx-auto">
                <button
                    onClick={goBack}
                    className="mb-6 flex items-center text-gray-700 hover:text-black transition cursor-pointer"
                >
                    <BiChevronLeft className="w-6 h-6" />
                    <span>Volver</span>
                </button>

                <h1 className="text-3xl font-bold mb-6">Venta Forzada</h1>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    {/* MONTO */}
                    <input
                        {...register("amount", {
                            required: "El monto es obligatorio",
                            min: { value: 1, message: "Mínimo S/ 1" },
                            max: { value: 10000, message: "Máximo S/ 10000" },
                        })}
                        className="w-full border p-3 rounded outline-none"
                        type="number"
                        step="0.01"
                        placeholder="Monto (S/)"
                    />
                    {errors.amount && (
                        <p className="text-red-500 text-sm">{errors.amount.message}</p>
                    )}

                    {/* TARJETA */}
                    <input
                        {...register("card_number", {
                            required: "Número obligatorio",
                            validate: (value) =>
                                /^\d{16}$/.test(value) ||
                                "Debe ser un número de 16 dígitos",
                        })}
                        className="w-full border p-3 rounded outline-none"
                        placeholder="Número de tarjeta"
                        maxLength={16}
                        inputMode="numeric"
                    />
                    {errors.card_number && (
                        <p className="text-red-500 text-sm">{errors.card_number.message}</p>
                    )}

                    {/* EXP + CVC */}
                    <div className="flex gap-3">
                        <div className="flex flex-col gap-2 w-full">
                            {/* EXP */}
                            <input
                                {...register("exp", {
                                    required: "Obligatorio",
                                    validate: (value) => {
                                        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value))
                                            return "Formato inválido (MM/YY)";

                                        const [mm, yy] = value.split("/");
                                        const month = parseInt(mm, 10);
                                        const year = 2000 + parseInt(yy, 10);

                                        const now = new Date();
                                        const currentMonth = now.getMonth() + 1;
                                        const currentYear = now.getFullYear();

                                        if (year < currentYear) return "Tarjeta expirada";
                                        if (year === currentYear && month < currentMonth)
                                            return "Tarjeta expirada";

                                        return true;
                                    },
                                })}
                                value={expValue}
                                onChange={handleExpChange}
                                className="w-full border p-3 rounded outline-none"
                                placeholder="MM/YY"
                                maxLength={5}
                                inputMode="numeric"
                            />

                            {errors.exp && (
                                <p className="text-red-500 text-sm">{errors.exp.message}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            {/* CVC */}
                            <input
                                {...register("cvc", {
                                    required: "Obligatorio",
                                    pattern: {
                                        value: /^[0-9]{3,4}$/,
                                        message: "CVC inválido",
                                    },
                                })}
                                className="w-full border p-3 rounded outline-none"
                                placeholder="CVC"
                                maxLength={4}
                                inputMode="numeric"
                            />

                            {errors.cvc && (
                                <p className="text-red-500 text-sm">{errors.cvc.message}</p>
                            )}
                        </div>
                    </div>

                    {/* ZIP */}
                    <input
                        {...register("zip", {
                            required: "Código postal obligatorio",
                        })}
                        className="w-full border p-3 rounded outline-none"
                        placeholder="ZIP"
                    />
                    {errors.zip && (
                        <p className="text-red-500 text-sm">{errors.zip.message}</p>
                    )}

                    {/* BOTÓN */}
                    <button className="w-full py-3 bg-blue-600 text-white rounded-xl cursor-pointer">
                        Procesar Pago
                    </button>
                </form>
            </div>
        </ProtectedRoute>
    );
}