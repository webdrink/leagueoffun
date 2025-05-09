import React from 'react';
import { Card, CardContent } from '../core/Card'; // Adjusted path
import { Question } from '../../types'; // Path should be correct if types is in blamegame/

interface QuestionCardProps {
  question: Question;
}

/**
 * Renders a styled card displaying a question, including its category emoji, category name, and question text.
 *
 * @param question - The question object containing the text, category emoji, and category name to display.
 * @returns A React functional component that displays the question details inside a styled card.
 */
const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  console.log('QuestionCard received question:', question);
    // Ensure we have fallbacks for potentially missing category information
  const categoryEmoji = question.categoryEmoji || '❓';
  const categoryName = question.categoryName || question.categoryId || '';

  return (
    <Card className="w-full h-full shadow-xl border-2 border-pink-100 bg-white rounded-2xl flex items-center justify-center p-1">
      <CardContent className="p-3 sm:p-6 flex flex-col items-center text-center justify-center h-full w-full">
        {categoryEmoji && (
          <div
            className="mb-2 sm:mb-3"
            style={{
              fontSize: 'clamp(2rem, 7vw, 5rem)', // Slightly smaller max for emoji
              lineHeight: 1,
            }}
          >
            {categoryEmoji}
          </div>
        )}
        {categoryName && (
          <span
            className="inline-flex items-center px-2.5 py-1 mb-3 sm:mb-6 rounded-full text-xs sm:text-sm font-semibold bg-pink-100 text-pink-700 border border-pink-200 shadow-sm"
          >
            {categoryName}
          </span>
        )}
        <h2
          className="font-semibold text-gray-800 leading-tight sm:leading-snug"
          style={{
            fontSize: 'clamp(1.1rem, 3.5vw, 2rem)', // Adjusted font size for readability
            lineHeight: '1.35',
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
