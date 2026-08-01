/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Pencil, X, ListChecks } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { DisabledField } from "@/webcomponents/reusable"
import { PercentageBar } from "../wrapper/PercentageBar"
import { CriteriaInfiniteSelect } from "./CriteriaInfiniteSelect"

interface Sentence {
  id: string
  text: string
  answer: string
}

export interface WordBoxConfig {
  question: string
  words: string[]
  sentences: Sentence[]
  explanation: string
  criterionId?: string
  marks?: number
}

interface Props {
  mode?: "create" | "edit" | "disabled"
  initialData?: WordBoxConfig
  percentage?: number
  onSave?: (data: WordBoxConfig) => void
  onCancel?: () => void
  showCriterion?: boolean
}

const makeSentence = (): Sentence => ({
  id: Math.random().toString(36).slice(2, 8),
  text: "",
  answer: ""
})

const DEFAULT_DATA: WordBoxConfig = {
  question: "",
  words: ["", "", "", ""],
  sentences: [
    makeSentence(),
    makeSentence(),
    makeSentence(),
    makeSentence()
  ],
  explanation: "",
  marks: 1,
}

export const WordBoxQuestion = ({ 
  mode = "create", 
  initialData = DEFAULT_DATA,
  percentage,
  onSave,
  onCancel,
  showCriterion = false
}: Props) => {
  const [currentMode, setCurrentMode] = useState<"create" | "edit" | "disabled">(mode)
  const [data] = useState<WordBoxConfig>(initialData)
  const [draft, setDraft] = useState<WordBoxConfig>(initialData)

  const isDisabled = currentMode === "disabled"
  const isEditing = currentMode === "edit" || currentMode === "create"

  // Ensure sentences count matches words count
  useEffect(() => {
    if (!isEditing) return
    
    const wordCount = draft.words.filter(word => word.trim() !== "").length
    const sentenceCount = draft.sentences.length

    if (sentenceCount !== wordCount) {
      if (sentenceCount < wordCount) {
        const missingCount = wordCount - sentenceCount
        const newSentences = Array(missingCount).fill(null).map(() => makeSentence())
        setDraft(prev => ({
          ...prev,
          sentences: [...prev.sentences, ...newSentences]
        }))
      } else if (sentenceCount > wordCount && wordCount > 0) {
        setDraft(prev => ({
          ...prev,
          sentences: prev.sentences.slice(0, wordCount)
        }))
      }
    }
  }, [draft.words, isEditing])

  const handleSave = (updates: Partial<WordBoxConfig>) => {
    const updatedData = { ...draft, ...updates }
    setDraft(updatedData)
    onSave?.(updatedData)
  }

  const updateWord = (i: number, value: string) => {
    const words = [...draft.words]
    const oldValue = words[i]
    words[i] = value
    
    let updatedSentences = draft.sentences
    
    // If a word is changed/removed, clear answers that used this word
    if (oldValue !== value && oldValue.trim() !== "") {
      updatedSentences = draft.sentences.map(sentence => 
        sentence.answer === oldValue ? { ...sentence, answer: "" } : sentence
      )
    }
    
    handleSave({ words, sentences: updatedSentences })
  }

  const addWord = () => {
    handleSave({ 
      words: [...draft.words, ""],
    })
  }

  const removeWord = (i: number) => {
    const wordToRemove = draft.words[i]
    const words = draft.words.filter((_, index) => index !== i)
    
    // Remove this word from any sentence that had it selected
    const updatedSentences = draft.sentences.map(sentence => 
      sentence.answer === wordToRemove ? { ...sentence, answer: "" } : sentence
    )
    
    handleSave({ words, sentences: updatedSentences })
  }

  const updateSentence = (id: string, value: string) => {
    const sentences = draft.sentences.map((s) =>
      s.id === id ? { ...s, text: value } : s
    )
    handleSave({ sentences })
  }

  const updateAnswer = (sentenceId: string, selectedWord: string) => {
    const currentSentence = draft.sentences.find(s => s.id === sentenceId)
    const oldAnswer = currentSentence?.answer || ""
    
    // Check if the selected word is already used by another sentence
    const isWordUsed = draft.sentences.some(
      s => s.id !== sentenceId && s.answer === selectedWord
    )
    
    if (isWordUsed) {
      alert(`The word "${selectedWord}" is already used in another sentence. Please choose a different word.`)
      return
    }
    
    const updatedSentences = draft.sentences.map((s) =>
      s.id === sentenceId ? { ...s, answer: selectedWord } : s
    )
    
    handleSave({ sentences: updatedSentences })
  }

  // Get available words for a specific sentence (excluding words already used in other sentences)
  const getAvailableWords = (sentenceId: string) => {
    const validWords = draft.words.filter(word => word.trim() !== "")
    const currentSentence = draft.sentences.find(s => s.id === sentenceId)
    const currentAnswer = currentSentence?.answer || ""
    
    const usedByOthers = draft.sentences
      .filter(s => s.id !== sentenceId && s.answer !== "")
      .map(s => s.answer)
    
    return validWords.filter(word => 
      word === currentAnswer || !usedByOthers.includes(word)
    )
  }

  // Get non-empty words for counting
  const availableWords = draft.words.filter(word => word.trim() !== "")
  
  // Check if all words are assigned
  const assignedWords = draft.sentences.filter(s => s.answer !== "").length
  const allWordsAssigned = availableWords.length > 0 && assignedWords === availableWords.length

  // Validation for save
  const isValid = () => {
    if (availableWords.length === 0) return false
    if (!allWordsAssigned) return false
    
    const validSentences = draft.sentences.slice(0, availableWords.length)
    return validSentences.every(s => s.text.trim() !== "")
  }

  const handleFinalSave = () => {
    if (!isValid()) {
      alert("Please ensure all words are assigned and all sentences have text.")
      return
    }
    
    const validWords = draft.words.filter(word => word.trim() !== "")
    const validSentences = draft.sentences.slice(0, validWords.length)
    
    onSave?.({
      question: draft.question,
      words: validWords,
      sentences: validSentences,
      explanation: draft.explanation,
      criterionId: draft.criterionId,
      marks: draft.marks ?? 1
    })
    
    if (currentMode === "create") {
      setDraft(DEFAULT_DATA)
    } else if (currentMode === "edit") {
      setCurrentMode("disabled")
    }
  }

  const handleCancel = () => {
    setDraft(data)
    setCurrentMode("disabled")
    onCancel?.()
  }

  return (
    <Card className={cn("transition-all w-full")}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
            <ListChecks className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-semibold">Word Box Question</p>
            <p className="text-xs text-muted-foreground">
              Match each word to a sentence (each word can be used once)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant={isDisabled ? "secondary" : "info"}
            className="text-[10px]"
          >
            {currentMode === "create"
              ? "New"
              : currentMode === "edit"
                ? "Editing"
                : "Saved"}
          </Badge>

          {isDisabled && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => {
                setDraft(data)
                setCurrentMode("edit")
              }}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 w-full">
        {/* Question */}
        <div className="space-y-1.5 w-full">
          <Label
            className={cn(
              "text-xs font-semibold",
              isDisabled && "text-muted-foreground",
            )}
          >
            Instruction
          </Label>

          {isDisabled ? (
            <DisabledField
              value={draft.question}
              placeholder="No instruction set"
            />
          ) : (
            <Input
              placeholder="Fill the blanks using the word box"
              value={draft.question}
              onChange={(e) => handleSave({ question: e.target.value })}
            />
          )}
        </div>

        {/* Footer row: Criterion */}
        <div className="flex gap-4">
          {showCriterion && (
            <div className="flex-1">
              <CriteriaInfiniteSelect
                value={draft.criterionId}
                disabled={isDisabled}
                onChange={(criterionId) => handleSave({ criterionId })}
              />
            </div>
          )}
        </div>

        {/* Word Box */}
        <div className="space-y-3">
          <Label
            className={cn(
              "text-xs font-semibold",
              isDisabled && "text-muted-foreground",
            )}
          >
            Word Box
            {!isDisabled && (
              <span className="text-muted-foreground font-normal ml-1">
                — each word can be used once
              </span>
            )}
          </Label>

          {isDisabled ? (
            <div className="flex flex-wrap gap-2">
              {availableWords.map((word, i) => (
                <Badge key={i} variant="outline" className="px-3 py-1">
                  {word}
                </Badge>
              ))}
              {availableWords.length === 0 && (
                <DisabledField value="" placeholder="No words added" />
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {availableWords.map((word, i) => (
                  <Badge key={i} variant="outline" className="px-3 py-1">
                    {word}
                    <button
                      onClick={() => removeWord(draft.words.findIndex(w => w === word))}
                      className="ml-2 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>

              {draft.words.map((word, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder={`Word ${i + 1}`}
                    value={word}
                    onChange={(e) => updateWord(i, e.target.value)}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeWord(i)}
                    disabled={availableWords.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <Button size="sm" variant="outline" onClick={addWord}>
                <Plus className="w-4 h-4 mr-1" />
                Add Word
              </Button>
            </>
          )}
        </div>

        {/* Sentences */}
        <div className="space-y-3">
          <Label
            className={cn(
              "text-xs font-semibold",
              isDisabled && "text-muted-foreground",
            )}
          >
            Sentences
            {!isDisabled && availableWords.length > 0 && (
              <span className="text-muted-foreground font-normal ml-1">
                — {assignedWords}/{availableWords.length} words assigned
              </span>
            )}
          </Label>

          {isDisabled ? (
            <div className="space-y-3">
              {draft.sentences.map((s, index) => {
                if (index >= availableWords.length) return null
                return (
                  <div key={s.id} className="border rounded-lg p-3 space-y-1">
                    <p className="text-sm">{s.text}</p>
                    {s.answer && (
                      <Badge variant="success" className="text-xs">
                        Answer: {s.answer}
                      </Badge>
                    )}
                  </div>
                )
              })}
              {availableWords.length === 0 && (
                <DisabledField value="" placeholder="No sentences added" />
              )}
            </div>
          ) : (
            <>
              {draft.sentences.map((s, index) => {
                if (index >= availableWords.length) return null
                
                const availableWordsForThisSentence = getAvailableWords(s.id)
                
                return (
                  <div key={s.id} className="border rounded-lg p-3 space-y-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Sentence {index + 1}</Label>
                      <Input
                        placeholder="Example: He ___ football after school."
                        value={s.text}
                        onChange={(e) => updateSentence(s.id, e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Correct Word</Label>
                      <Select 
                        value={s.answer} 
                        onValueChange={(value) => updateAnswer(s.id, value as string)}
                        disabled={availableWordsForThisSentence.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select correct word" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableWordsForThisSentence.map((word, i) => (
                            <SelectItem key={i} value={word}>
                              {word}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Explanation */}
        <div className="space-y-1.5">
          <Label
            className={cn(
              "text-xs font-semibold",
              isDisabled && "text-muted-foreground",
            )}
          >
            Answer Explanation
            <span
              className={cn(
                "font-normal ml-1",
                isDisabled
                  ? "text-muted-foreground/60"
                  : "text-muted-foreground",
              )}
            >
              (shown after submission)
            </span>
          </Label>

          {isDisabled ? (
            <DisabledField
              value={draft.explanation}
              placeholder="No explanation added"
              multiline
            />
          ) : (
            <Input
              placeholder="Explain the correct answers..."
              value={draft.explanation}
              onChange={(e) => handleSave({ explanation: e.target.value })}
            />
          )}
        </div>

        {/* Percentage Bar */}
        {isDisabled && typeof percentage === "number" && (
          <PercentageBar percentage={percentage} />
        )}

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-2 pt-1">
            {currentMode === "edit" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                className="gap-1.5"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleFinalSave}
              disabled={!isValid()}
              className="gap-1.5"
            >
              {currentMode === "create" ? "Create Question" : "Save Changes"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}