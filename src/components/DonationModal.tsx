import React from 'react';
import { X, Heart } from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col relative">
        {/*
          Stripe's buy button is a web component that inherently renders on a white background or tries to inject its own iframe styling.
          We provide a clean container so it looks native to their checkout experience.
        */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={onClose}
            className="p-1.5 bg-gray-100/80 hover:bg-gray-200 text-gray-500 hover:text-gray-800 rounded-full transition-colors backdrop-blur-sm"
          >
            <X size={18} />
          </button>
        </div>

        <div className="pt-8 pb-4 px-4 flex flex-col items-center justify-center text-center border-b border-gray-100">
          <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mb-3">
             <Heart size={24} className="text-rose-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 tracking-tight">Support NetMajik</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-[250px]">
            Your support helps me maintain the project and develop new features for the Open Source community!
          </p>
        </div>

        <div className="p-4 bg-gray-50 flex justify-center min-h-[350px]">
           <stripe-buy-button
             buy-button-id="buy_btn_1TGo41GjA3xaDfNx16s6yY7W"
             publishable-key="pk_live_51TD6bAGjA3xaDfNxHKR5EWbgt4ZhXTnpM5dT0aYEEiOW1XQLMabk6CFz7HMoMYVUANd9lf5yAZyn6dseZXvAKxRB00UXvG9uof"
           />
        </div>
      </div>
    </div>
  );
};
