import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = ({ phone, name, branchName }) => {
  // Sanitize the phone number: remove non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  // Ensure Nepal country code (977) is present
  const formattedPhone = cleanPhone.startsWith('977') ? cleanPhone : `977${cleanPhone}`;

  const message = `Hello ${name} (${branchName} Head), I would like to inquire about some products or order statuses at your branch.`;
  const encodedText = encodeURIComponent(message);
  
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedText}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-emerald-500/20"
      id={`whatsapp-btn-${formattedPhone}`}
    >
      <MessageCircle className="w-5 h-5 fill-current" />
      <span>Chat on WhatsApp</span>
    </a>
  );
};

export default WhatsAppButton;
