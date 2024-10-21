import React from 'react'
import { IconChevronCompactLeft, IconChevronCompactRight } from '@tabler/icons-react'

interface ButtonProps {
  onClick: () => void
}

export const PrevButton: React.FC<ButtonProps> = ({ onClick }) => (
  <button
    className="w-10 h-10 flex items-center justify-center bg-white/80  shadow-md hover:bg-white"
    onClick={onClick}
  >
    <IconChevronCompactLeft className="w-6 h-6" />
  </button>
)

export const NextButton: React.FC<ButtonProps> = ({ onClick }) => (
  <button
    className="w-10 h-10 flex items-center justify-center bg-white/80  shadow-md hover:bg-white"
    onClick={onClick}
  >
    <IconChevronCompactRight className="w-6 h-6" />
  </button>
)

export const DotButton: React.FC<ButtonProps & { isSelected: boolean }> = ({ onClick, isSelected }) => (
  <button
    className={`w-2 h-2  ${
      isSelected ? 'bg-blue-500' : 'bg-gray-300'
    }`}
    type="button"
    onClick={onClick}
  />
)