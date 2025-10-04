import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Coffee } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Coffee className="w-8 h-8 text-amber-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">Buy Me A Coffee</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
