import Navbar from './Navbar';
import Footer from './Footer'; 

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt">
            <body className="flex flex-col min-h-screen bg-gray-100">
                <Navbar /> {/* Cabeçalho */}
                <main className="flex-grow p-4">{children}</main>
                <Footer />
            </body>
        </html>
    );
}
