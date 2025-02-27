{/*export default function ClientesPage() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold">Lista de Clientes</h1>
            <p>Conteúdo da página de clientes</p>
        </div>
    );
}*/}

export default function ClientesPage() {
    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
            {/* Container principal */}
            <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    Lista de Clientes
                </h1>

                {/* Área de conteúdo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Card 1 */}
                    <div className="bg-blue-200 p-4 rounded-md shadow-md">
                        <h2 className="text-lg font-semibold">Clientes Cadastrados</h2>
                        <p>Aqui aparecerão os clientes cadastrados.</p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-green-200 p-4 rounded-md shadow-md">
                        <h2 className="text-lg font-semibold">Filtros</h2>
                        <p>Adicione filtros para buscar clientes.</p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-yellow-200 p-4 rounded-md shadow-md">
                        <h2 className="text-lg font-semibold">Ações</h2>
                        <p>Botões para adicionar ou excluir clientes.</p>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-red-200 p-4 rounded-md shadow-md">
                        <h2 className="text-lg font-semibold">Resumo</h2>
                        <p>Estatísticas gerais dos clientes.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
