import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCw, CheckCircle, XCircle, Shuffle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export default function TopicFlashcards() {
  const navigate = useNavigate();
  const { topicId: _topicId } = useParams();
  
  // Mock flashcards data
  const [flashcards] = useState<Flashcard[]>([
    {
      id: 'fc-1',
      question: 'What is an array?',
      answer: 'An array is a data structure that stores a collection of elements in contiguous memory locations. Each element can be accessed using an index.',
      category: 'Arrays',
      difficulty: 'Easy',
    },
    {
      id: 'fc-2',
      question: 'What is the time complexity of accessing an element in an array?',
      answer: 'O(1) - Constant time, because arrays provide direct access to elements using their index.',
      category: 'Arrays',
      difficulty: 'Medium',
    },
    {
      id: 'fc-3',
      question: 'What is a linked list?',
      answer: 'A linked list is a linear data structure where elements are stored in nodes. Each node contains data and a reference (link) to the next node in the sequence.',
      category: 'Linked Lists',
      difficulty: 'Easy',
    },
    {
      id: 'fc-4',
      question: 'What are the advantages of linked lists over arrays?',
      answer: 'Dynamic size, efficient insertions/deletions at any position, no memory wastage. However, they require extra memory for pointers and have slower access time.',
      category: 'Linked Lists',
      difficulty: 'Medium',
    },
    {
      id: 'fc-5',
      question: 'Explain the difference between stack and queue.',
      answer: 'Stack follows LIFO (Last In First Out) principle - last element added is first to be removed. Queue follows FIFO (First In First Out) - first element added is first to be removed.',
      category: 'Stacks & Queues',
      difficulty: 'Hard',
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<string>>(new Set());
  const [difficultCards, setDifficultCards] = useState<Set<string>>(new Set());

  const currentCard = flashcards[currentIndex];
  const progress = Math.round(((currentIndex + 1) / flashcards.length) * 100);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMastered = () => {
    const newMastered = new Set(masteredCards);
    newMastered.add(currentCard.id);
    setMasteredCards(newMastered);
    
    // Remove from difficult if it was there
    const newDifficult = new Set(difficultCards);
    newDifficult.delete(currentCard.id);
    setDifficultCards(newDifficult);
    
    handleNext();
  };

  const handleDifficult = () => {
    const newDifficult = new Set(difficultCards);
    newDifficult.add(currentCard.id);
    setDifficultCards(newDifficult);
    
    // Remove from mastered if it was there
    const newMastered = new Set(masteredCards);
    newMastered.delete(currentCard.id);
    setMasteredCards(newMastered);
    
    handleNext();
  };

  const handleShuffle = () => {
    // In a real app, this would shuffle the flashcards array
    alert('Shuffle functionality - would randomize card order');
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Flashcards</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Introduction to Data Structures</p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={handleShuffle}>
          <Shuffle className="h-4 w-4 mr-2" />
          Shuffle
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <span className="text-sm font-bold">{flashcards.length}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Cards</p>
                <p className="text-xl font-bold font-[family-name:var(--font-heading)]">{flashcards.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 shrink-0">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Mastered</p>
                <p className="text-xl font-bold font-[family-name:var(--font-heading)]">{masteredCards.size}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600 shrink-0">
                <XCircle className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Difficult</p>
                <p className="text-xl font-bold font-[family-name:var(--font-heading)]">{difficultCards.size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold font-[family-name:var(--font-heading)]">Progress</span>
            <span className="text-[10px] text-muted-foreground">
              Card {currentIndex + 1} of {flashcards.length}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div 
              className="h-full bg-primary rounded-full transition-all" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Flashcard */}
      <div className="flex flex-col items-center gap-4">
        <Card 
          className="w-full max-w-2xl cursor-pointer hover:shadow-md transition-all"
          onClick={handleFlip}
        >
          <CardContent className="p-8 min-h-[300px] flex flex-col items-center justify-center">
            <div className="text-center space-y-4 w-full">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="text-[10px]">{currentCard.category}</Badge>
                <Badge 
                  variant={
                    currentCard.difficulty === 'Easy' ? 'success' :
                    currentCard.difficulty === 'Medium' ? 'default' : 'destructive'
                  }
                  className="text-[10px]"
                >
                  {currentCard.difficulty}
                </Badge>
              </div>
              
              {!isFlipped ? (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Question</p>
                  <p className="text-lg font-semibold font-[family-name:var(--font-heading)]">
                    {currentCard.question}
                  </p>
                  <p className="text-xs text-muted-foreground mt-8">Click to reveal answer</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Answer</p>
                  <p className="text-sm leading-relaxed">
                    {currentCard.answer}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleFlip}
          >
            <RotateCw className="h-4 w-4 mr-1" />
            Flip Card
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Mark as Mastered/Difficult */}
        {isFlipped && (
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDifficult}
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Mark Difficult
            </Button>
            <Button
              size="sm"
              onClick={handleMastered}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark Mastered
            </Button>
          </div>
        )}
      </div>

      {/* Card List */}
      <Card>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] mb-3">
            All Cards ({flashcards.length})
          </h3>
          <div className="space-y-2">
            {flashcards.map((card, idx) => (
              <div
                key={card.id}
                className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                  idx === currentIndex ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsFlipped(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xs font-medium text-muted-foreground">#{idx + 1}</span>
                    <p className="text-sm font-medium">{card.question}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {masteredCards.has(card.id) && (
                      <Badge variant="success" className="text-[9px]">
                        <CheckCircle className="h-2.5 w-2.5 mr-1" />
                        Mastered
                      </Badge>
                    )}
                    {difficultCards.has(card.id) && (
                      <Badge variant="warning" className="text-[9px]">
                        <XCircle className="h-2.5 w-2.5 mr-1" />
                        Difficult
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[9px]">{card.category}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
