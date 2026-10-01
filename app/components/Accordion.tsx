import type { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";
import { cn } from "~/lib/utils";

interface AccordionContextType {
  activeItems: string[];
  toggleItem: (id: string) => void;
  isItemActive: (id: string) => boolean;
}

const AccordionContext = createContext<AccordionContextType | undefined>(
  undefined
);

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion");
  }
  return context;
};

interface AccordionProps {
  children: ReactNode;
  defaultOpen?: string;
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  children,
  defaultOpen,
  allowMultiple = false,
  className = "",
}) => {
  const [activeItems, setActiveItems] = useState<string[]>(
    defaultOpen ? [defaultOpen] : []
  );

  const toggleItem = (id: string) => {
    setActiveItems((prev) => {
      if (allowMultiple) {
        return prev.includes(id)
          ? prev.filter((item) => item !== id)
          : [...prev, id];
      } else {
        return prev.includes(id) ? [] : [id];
      }
    });
  };

  const isItemActive = (id: string) => activeItems.includes(id);

  return (
    <AccordionContext.Provider value={{ activeItems, toggleItem, isItemActive }}>
      <div className={cn("divide-y divide-gray-100", className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

interface AccordionItemProps {
  children: ReactNode;
  id: string;
  className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  children,
  id,
  className = "",
}) => {
  return (
    <div className={cn("py-1", className)} data-accordion-id={id}>
      {children}
    </div>
  );
};

interface AccordionHeaderProps {
  children: ReactNode;
  id: string;
  className?: string;
}

export const AccordionHeader: React.FC<AccordionHeaderProps> = ({
  children,
  id,
  className = "",
}) => {
  const { toggleItem, isItemActive } = useAccordion();
  const isActive = isItemActive(id);

  return (
    <button
      type="button"
      onClick={() => toggleItem(id)}
      className={cn(
        "w-full flex items-center justify-between py-3 text-left cursor-pointer",
        className
      )}
      aria-expanded={isActive}
    >
      {children}
      <svg
        className={cn(
          "w-5 h-5 text-gray-400 transition-transform duration-200 shrink-0",
          isActive && "rotate-180"
        )}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );
};

interface AccordionContentProps {
  children: ReactNode;
  id: string;
  className?: string;
}

export const AccordionContent: React.FC<AccordionContentProps> = ({
  children,
  id,
  className = "",
}) => {
  const { isItemActive } = useAccordion();
  const isActive = isItemActive(id);

  if (!isActive) return null;

  return (
    <div className={cn("pb-4", className)}>
      {children}
    </div>
  );
};
