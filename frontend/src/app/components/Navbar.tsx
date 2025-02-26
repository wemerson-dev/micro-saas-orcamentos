import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="bg-blue-600 p-4 text-white">
            <div className="container mx-auto flex justify-between">
                <h1 className="text-xl font-bold">Micro SaaS</h1>
                <ul className="flex gap-4">
                    <li>
                        <Link href="/" className="hover:underline">
                        Home
                        </Link>
                    </li>
                    <li>
                        <link href="/clientes" className="hover:underline">
                        Clientes
                        </link>
                    </li>
                    <li>
                        <link href="/orcamentos" className="hover:underline">
                        Orçamentos
                        </link> 
                    </li>
                </ul>
            </div>
        </nav>
    )
}