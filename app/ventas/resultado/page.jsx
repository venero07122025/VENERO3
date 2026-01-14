import { Suspense } from "react";
import ResultadoClient from "./ResultadoClient"

export default function page() {
    return (
        <Suspense fallback={<div>Cargando resultado...</div>}>
            <ResultadoClient />
        </Suspense>
    )
}