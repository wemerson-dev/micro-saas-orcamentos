import Navbar from './Navbar';
import Footer from './Footer'; 

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
        <Navbar /> {/* Cabechalho */}
        <main className="flex-grow p-4">{children}</main>
        <Footer />
        </div>
    );
    }