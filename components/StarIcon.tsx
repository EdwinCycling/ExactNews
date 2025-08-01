import React from 'react';
import { Language } from '../types';

interface StarIconProps {
  filled: boolean;
  language: Language;
}

const StarIcon: React.FC<StarIconProps> = ({ filled, language }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} className={`w-7 h-7 ${filled ? 'text-amber-400' : 'text-slate-500'}`} stroke={filled ? 'none' : 'currentColor'} strokeWidth="2">
    <title>{filled ? (language === 'nl' ? 'Favoriet' : 'Favorite') : (language === 'nl' ? 'Markeer als favoriet' : 'Mark as favorite')}</title>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.321l5.522.802a.563.563 0 0 1 .314.968l-4.001 3.882a.563.563 0 0 0-.162.531l.946 5.397a.563.563 0 0 1-.815.592l-4.924-2.582a.562.562 0 0 0-.517 0l-4.924 2.582a.563.563 0 0 1-.815-.592l.946-5.397a.563.563 0 0 0-.162.531l-4.001-3.882a.563.563 0 0 1 .314-.968l5.522-.802a.563.563 0 0 0 .475-.321L11.48 3.5Z" />
  </svg>
);

export default StarIcon;