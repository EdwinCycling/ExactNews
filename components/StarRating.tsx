import React from 'react';
import { Language } from '../types';

interface StarRatingProps {
  rating: number;
  language: Language;
}

const FullStar: React.FC<{ language: Language }> = ({ language }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-amber-400">
    <title>{language === 'nl' ? 'Volledige ster' : 'Full star'}</title>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
  </svg>
);

const HalfStar: React.FC<{ language: Language }> = ({ language }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-amber-400">
    <title>{language === 'nl' ? 'Halve ster' : 'Half star'}</title>
    <path fillRule="evenodd" d="M12 3.25V18.354L7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005L12 3.25Z" clipRule="evenodd" />
  </svg>
);

const EmptyStar: React.FC<{ language: Language }> = ({ language }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500">
    <title>{language === 'nl' ? 'Lege ster' : 'Empty star'}</title>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.321l5.522.802a.563.563 0 0 1 .314.968l-4.001 3.882a.563.563 0 0 0-.162.531l.946 5.397a.563.563 0 0 1-.815.592l-4.924-2.582a.562.562 0 0 0-.517 0l-4.924 2.582a.563.563 0 0 1-.815-.592l.946-5.397a.563.563 0 0 0-.162.531l-4.001-3.882a.563.563 0 0 1 .314-.968l5.522-.802a.563.563 0 0 0 .475-.321L11.48 3.5Z" />
  </svg>
);


const StarRating: React.FC<StarRatingProps> = ({ rating, language }) => {
  const stars = [];
  const totalStars = 5;

  for (let i = 1; i <= totalStars; i++) {
    if (i <= rating) {
      stars.push(<FullStar key={i} language={language} />);
    } else if (i - 0.5 <= rating) {
      stars.push(<HalfStar key={i} language={language} />);
    } else {
      stars.push(<EmptyStar key={i} language={language} />);
    }
  }

  return <div className="flex items-center space-x-0.5">{stars}</div>;
};

export default StarRating;