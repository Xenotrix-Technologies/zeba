import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton({ text = 'Hi ZEBA, I want to inquire about the Heating Pads' }) {
  const encodedText = encodeURIComponent(text);
  const whatsappUrl = `https://wa.me/919876543210?text=${encodedText}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      className="hidden md:flex fixed bottom-6 right-6 z-30 group items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-full shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all duration-300 transform hover:-translate-y-1"
      aria-label="Chat with ZEBA Care on WhatsApp"
    >
      <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
      <span className="text-xs font-bold tracking-wide pr-1">WhatsApp Us</span>
      <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
    </a>
  );
}
