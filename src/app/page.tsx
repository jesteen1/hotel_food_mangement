
import Link from 'next/link';
import { ArrowRight, ChefHat } from 'lucide-react';
import { seedInitialData } from './actions';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] bg-gradient-to-br from-orange-50 to-red-100 p-6">
      <div className="max-w-3xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-white rounded-full shadow-xl">
            <ChefHat size={64} className="text-orange-500" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">
          Delicious Food, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
            Delivered to Your Seat
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Order directly from your mobile. No lines, no waiting. Just sit back and enjoy the show.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link
            href="/menu"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all bg-orange-600 rounded-full hover:bg-orange-700 hover:scale-105 shadow-lg hover:shadow-orange-500/30"
          >
            Order Now
            <ArrowRight className="ml-2 -mr-1" />
          </Link>

          <Link
            href="/admin"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-orange-600 transition-all bg-white border-2 border-orange-100 rounded-full hover:border-orange-200 hover:bg-orange-50 hover:scale-105 shadow-sm"
          >
            Admin Dashboard
          </Link>
        </div>

        <form action={seedInitialData} className="mt-12">
          <button className="text-sm text-gray-400 underline hover:text-gray-600">
            (Dev Only) Seed Initial Data
          </button>
        </form>
      </div>
    </div>
  );
}
