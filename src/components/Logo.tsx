import { Hotel } from 'lucide-react';

export default function Logo({ className = "w-8 h-8", textClassName = "text-xl" }: { className?: string, textClassName?: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center bg-orange-100 rounded-lg p-1.5`}>
                <Hotel className={`${className} text-orange-600`} />
            </div>
            <span className={`font-bold text-gray-900 tracking-tight ${textClassName}`}>
                Food<span className="text-orange-600">Book</span>
            </span>
        </div>
    );
}
