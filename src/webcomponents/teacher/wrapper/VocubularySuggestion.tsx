"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { VocabSuggestion } from "./allShared";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

interface VocabSuggestionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectSuggestion?: (s: VocabSuggestion, type: 'definition' | 'image') => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  suggestions?: VocabSuggestion[];
  onSearchSuggestion?: (value: string) => void;
}

export const VocabSuggestionInput = ({
  value,
  onChange,
  onSelectSuggestion,
  placeholder,
  disabled,
  className,
  suggestions,
  onSearchSuggestion,
}: VocabSuggestionInputProps) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  suggestions = suggestions ?? [];

  const handleInputChange = (val: string) => {
    setInputValue(val);
    onChange(val);
    onSearchSuggestion?.(val);
    setOpen(true);
  };

  const handleSelectDefinition = (suggestion: VocabSuggestion) => {
    const definitionValue = suggestion.definition;
    setInputValue(definitionValue);
    onChange(definitionValue);
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion, 'definition');
    }
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleSelectImage = (suggestion: VocabSuggestion) => {
    const imageValue = suggestion.imageUrl || '';
    if (imageValue) {
      setInputValue(imageValue);
      onChange(imageValue);
      if (onSelectSuggestion) {
        onSelectSuggestion(suggestion, 'image');
      }
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <DropdownMenu open={open && !disabled && suggestions.length > 0} onOpenChange={setOpen}>
        <DropdownMenuTrigger className="w-full">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn("text-sm w-full", className)}
          />
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className="max-h-96 overflow-y-auto"
          align="start"
          sideOffset={4}
          
        >
          {suggestions.length === 0 ? (
            <div className="px-2 py-6 text-center text-xs text-muted-foreground">
              No results found
            </div>
          ) : (
            suggestions.map((s: VocabSuggestion) => (
              <DropdownMenuGroup key={s.id}>
                <DropdownMenuLabel className="text-xs font-semibold bg-muted/50">
                  {s.wordName}
                </DropdownMenuLabel>
                
                <DropdownMenuItem 
                  onClick={() => handleSelectDefinition(s)}
                  className="flex items-center gap-3 py-2 cursor-pointer"
                >
                  <div className="shrink-0 w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                    <span className="text-sm">📝</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">Definition</p>
                    <p className="text-sm truncate">{s.definition}</p>
                  </div>
                </DropdownMenuItem>
                
                {s.imageUrl && (
                  <DropdownMenuItem 
                    onClick={() => handleSelectImage(s)}
                    className="flex items-center gap-3 py-2 cursor-pointer"
                  >
                    <div className="shrink-0">
                      <Image
                        src={s.imageUrl}
                        alt={s.wordName}
                        height={32}
                        width={32}
                        className="w-8 h-8 rounded object-cover border"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">Image</p>
                      <p className="text-xs truncate text-muted-foreground">Click to select this image</p>
                    </div>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
              </DropdownMenuGroup>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};