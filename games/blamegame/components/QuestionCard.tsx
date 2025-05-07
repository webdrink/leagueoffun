import React from 'react';
import { Card, CardContent } from './ui/card';
import { getEmoji } from '../utils';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  return (
    <Card className="w-full h-full shadow-8xl border-2 border-pink-100 bg-white rounded-2xl flex items-center justify-center">
      <CardContent className="p-4 sm:p-8 flex flex-col items-center text-center justify-center h-full w-full">
        {/* Category Emoji */}
        {question.category && (
          <div
          className="mb-2 sm:mb-4"
          style={{
            fontSize: 'clamp(2.5rem, 8vw, 6rem)',
            lineHeight: 1,
          }}
        >
          {getEmoji(question.category)}
        </div>
        )}
        {/* Category Badge */}
        {question.category && (
          <span
            className="inline-flex items-center px-3 py-1 mb-4 sm:mb-8 rounded-full text-sm font-semibold bg-pink-100 text-pink-700 border border-pink-200 shadow-sm"
            style={{ gap: '0.5em' }}
          >
            {question.category}
          </span>
        )}
        <h2
          className="font-semibold text-gray-800 leading-snug"
          style={{
            fontSize: 'clamp(1.2rem, 4vw, 2.5rem)',
            lineHeight: '1.3',
            wordBreak: 'break-word',
          }}
        >
          {question.text}
        </h2>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
