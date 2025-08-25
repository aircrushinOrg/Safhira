import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Award, 
  RefreshCw,
  TrendingUp
} from 'lucide-react';

interface QuizSectionProps {
  onBack: () => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

const quizQuestions: Question[] = [
  {
    id: 1,
    question: "What does STI stand for?",
    options: [
      "Sexually Transmitted Illness",
      "Sexually Transmitted Infections", 
      "Sexual Transfer Infections",
      "Sexually Transmitted Immunodeficiency"
    ],
    correctAnswer: 1,
    explanation: "STI stands for 'Sexually Transmitted Infections'. This is a more accurate term than STD (Sexually Transmitted Diseases).",
    category: "Basics"
  },
  {
    id: 2,
    question: "Which of the following is NOT a way STIs are transmitted?",
    options: [
      "Unprotected sexual contact",
      "Sharing needles",
      "Shaking hands",
      "From mother to baby during birth"
    ],
    correctAnswer: 2,
    explanation: "STIs cannot be transmitted through casual contact like shaking hands, hugging, or sharing food.",
    category: "Prevention"
  },
  {
    id: 3,
    question: "How often should sexually active individuals get tested for STIs?",
    options: [
      "Only once in a lifetime",
      "Only if there are symptoms",
      "Every 6-12 months",
      "Only before marriage"
    ],
    correctAnswer: 2,
    explanation: "STI testing is recommended every 6-12 months for sexually active individuals, even without symptoms.",
    category: "Testing"
  },
  {
    id: 4,
    question: "Which statement about condoms is TRUE?",
    options: [
      "Condoms provide 100% protection",
      "Condoms only protect against HIV",
      "Condoms can be reused",
      "Condoms significantly reduce STI risk"
    ],
    correctAnswer: 3,
    explanation: "While condoms don't provide 100% protection, they are highly effective in reducing STI risk when used correctly.",
    category: "Prevention"
  },
  {
    id: 5,
    question: "What should you do if you suspect STI exposure?",
    options: [
      "Wait and see if symptoms appear",
      "Buy over-the-counter medication",
      "See a doctor for testing and advice",
      "Do nothing if you feel fine"
    ],
    correctAnswer: 2,
    explanation: "If you suspect STI exposure, it's important to see a healthcare professional for proper testing and appropriate treatment.",
    category: "Testing"
  }
];

export function QuizSection({ onBack }: QuizSectionProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizCompleted(true);
      setShowResult(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === quizQuestions[index].correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResult(false);
    setQuizCompleted(false);
  };

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const score = calculateScore();
  const scorePercentage = (score / quizQuestions.length) * 100;

  if (quizCompleted) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-8 text-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30">
            <div className="mb-6">
              <Award size={64} className="text-yellow-500 dark:text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Congratulations!</h2>
              <p className="text-gray-600 dark:text-gray-300">You have successfully completed the quiz</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{score}/{quizQuestions.length}</div>
                <div className="text-gray-600 dark:text-gray-400">Correct Answers</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{scorePercentage.toFixed(0)}%</div>
                <div className="text-gray-600 dark:text-gray-400">Overall Score</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {scorePercentage >= 80 ? 'A' : scorePercentage >= 60 ? 'B' : scorePercentage >= 40 ? 'C' : 'D'}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Grade</div>
              </div>
            </div>

            <div className="mb-8">
              <Badge 
                variant={scorePercentage >= 80 ? 'default' : scorePercentage >= 60 ? 'secondary' : 'destructive'}
                className="text-lg px-4 py-2"
              >
                {scorePercentage >= 80 ? '🌟 Excellent!' : 
                 scorePercentage >= 60 ? '👍 Good Job!' : 
                 '💪 Keep Trying!'}
              </Badge>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Message from Jun Kang:</h3>
              <Card className="p-4 bg-white/80 dark:bg-gray-800/80">
                <p className="text-gray-700 dark:text-gray-300 italic">
                  {scorePercentage >= 80 
                    ? "Wow, amazing! Your knowledge about reproductive health is excellent. Keep learning and share your knowledge with friends!"
                    : scorePercentage >= 60
                    ? "Great! You understand the important basics. Try reviewing the modules to improve your knowledge even more."
                    : "That's okay! This is a good start. I suggest you read the learning modules again before retaking the quiz."
                  }
                </p>
              </Card>
            </div>

            <div className="flex justify-center space-x-4">
              <Button onClick={restartQuiz} variant="outline" className="flex items-center space-x-2">
                <RefreshCw size={16} />
                <span>Try Again</span>
              </Button>
              <Button onClick={onBack} className="flex items-center space-x-2">
                <TrendingUp size={16} />
                <span>Continue Learning</span>
              </Button>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Reproductive Health Quiz</h1>
            <Badge variant="secondary" className="text-sm">
              Question {currentQuestion + 1} of {quizQuestions.length}
            </Badge>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </div>

        <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm mb-6">
          <div className="mb-6">
            <Badge variant="outline" className="mb-4">
              {quizQuestions[currentQuestion].category}
            </Badge>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
              {quizQuestions[currentQuestion].question}
            </h3>
          </div>

          <div className="space-y-4 mb-8">
            {quizQuestions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedAnswers[currentQuestion] === index && (
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {selectedAnswers[currentQuestion] !== undefined && showResult && (
            <Card className="p-4 mb-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30">
              <div className="flex items-start space-x-3">
                {selectedAnswers[currentQuestion] === quizQuestions[currentQuestion].correctAnswer ? (
                  <CheckCircle className="text-green-500 dark:text-green-400 flex-shrink-0 mt-1" size={20} />
                ) : (
                  <XCircle className="text-red-500 dark:text-red-400 flex-shrink-0 mt-1" size={20} />
                )}
                <div>
                  <h4 className={`font-semibold mb-2 ${
                    selectedAnswers[currentQuestion] === quizQuestions[currentQuestion].correctAnswer
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {selectedAnswers[currentQuestion] === quizQuestions[currentQuestion].correctAnswer
                      ? 'Correct! 🎉'
                      : 'Not quite right 😊'
                    }
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {quizQuestions[currentQuestion].explanation}
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            
            <div className="flex space-x-3">
              {!showResult && selectedAnswers[currentQuestion] !== undefined && (
                <Button
                  variant="secondary"
                  onClick={() => setShowResult(true)}
                >
                  Show Answer
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                disabled={selectedAnswers[currentQuestion] === undefined}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
              >
                {currentQuestion === quizQuestions.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">JK</span>
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-100">Jun Kang&apos;s Tip</span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            Take your time to read each question carefully. Don&apos;t rush! 
            Remember, this is for learning, not a real exam.
          </p>
        </Card>
      </div>
    </section>
  );
}