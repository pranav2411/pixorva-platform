import Link from 'next/link';
import { Oswald, Inter } from "next/font/google";
import { ArrowLeft, Home, Briefcase } from "lucide-react";

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

export default function NotFound() {
  return (
    <div className={`min-h-screen bg-yellow-400 text-black ${inter.className} flex items-center justify-center p-6 select-none`}>
      <div className="bg-white border-4 border-black p-8 md:p-12 rounded-3xl max-w-lg w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle,_black_1px,_transparent_1px)] bg-[length:10px_10px] pointer-events-none"></div>

        <div className="relative z-10">
          {/* Big Neobrutalist Badges */}
          <div className="inline-block bg-black text-white px-6 py-2 border-2 border-black rounded-lg text-sm font-black uppercase tracking-wider mb-6 rotate-[-1deg] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]">
            Security Blocked
          </div>

          <h1 className={`text-7xl md:text-9xl font-black uppercase leading-none mb-4 ${oswald.className}`}>
            404
          </h1>

          <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-wide mb-6 ${oswald.className}`}>
            Lost in the Cloud?
          </h2>

          <p className="text-sm font-semibold text-gray-600 mb-8 leading-relaxed">
            The page you are looking for does not exist, has moved, or has been taken down. All connections have been securely terminated.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-black text-white hover:bg-yellow-400 hover:text-black px-6 py-4 rounded-xl border-2 border-black font-black uppercase text-xs tracking-wider transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1 flex items-center justify-center gap-2">
                <Home size={16} /> Go back home
              </button>
            </Link>
            <Link href="/employees" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-white text-black hover:bg-black hover:text-white px-6 py-4 rounded-xl border-2 border-black font-black uppercase text-xs tracking-wider transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1 flex items-center justify-center gap-2">
                <Briefcase size={16} /> Hire Employees
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
