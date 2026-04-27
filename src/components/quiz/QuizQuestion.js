import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

export default function QuizQuestion({ data, index, onAnswer, disabled }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleSelect = (optionIdx) => {
    if (disabled || isRevealed) return;
    
    setSelectedOption(optionIdx);
    setIsRevealed(true);
    
    const isCorrect = optionIdx === data.correct;
    onAnswer(isCorrect);
  };

  return (
    <div className="bg-white rounded-2xl border border-brand-steel/20 shadow-sm p-6">
      <h3 className="text-lg font-bold text-brand-taupe mb-4">
        {index + 1}. {data.question}
      </h3>

      <div className="space-y-3">
        {data.options.map((option, idx) => {
          let optionStyle = "border-brand-steel/30 bg-white hover:bg-brand-blush/10 text-brand-taupe cursor-pointer";
          let icon = null;

          if (isRevealed) {
            if (idx === data.correct) {
              optionStyle = "border-green-500 bg-green-50 text-green-800 cursor-default font-medium";
              icon = <CheckCircle className="h-5 w-5 text-green-500" />;
            } else if (idx === selectedOption) {
              optionStyle = "border-red-400 bg-red-50 text-red-800 cursor-default";
              icon = <XCircle className="h-5 w-5 text-red-500" />;
            } else {
              optionStyle = "border-brand-steel/20 bg-gray-50 text-brand-steel/60 cursor-default";
            }
          }

          return (
            <div 
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex justify-between items-center ${optionStyle}`}
            >
              <span>{option}</span>
              {icon && <span>{icon}</span>}
            </div>
          );
        })}
      </div>

      {isRevealed && (
        <div className="mt-6 p-4 bg-brand-teal/5 border border-brand-teal/20 rounded-xl">
          <p className="text-sm font-semibold text-brand-teal mb-1">Explicación:</p>
          <p className="text-sm text-brand-taupe leading-relaxed">
            {data.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
