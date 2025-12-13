import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { seedInitialData } from './actions';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] bg-gradient-to-br from-orange-50 to-red-100 p-6">
      <div className="max-w-3xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">

        <div className="flex justify-center mb-6">
          <div className="p-4 bg-white rounded-full shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chef-hat text-orange-500" aria-hidden="true"><path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"></path><path d="M6 17h12"></path></svg>
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
            href="/admin/inventory"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-orange-600 transition-all bg-white border-2 border-orange-100 rounded-full hover:border-orange-200 hover:bg-orange-50 hover:scale-105 shadow-sm"
          >
            Admin Dashboard
          </Link>
        </div>


      </div>
    </div>
  );
}
