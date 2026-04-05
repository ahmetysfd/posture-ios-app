import React from 'react';
import {
  DIFFICULTY_INFO,
  type ExerciseDifficulty,
} from '../services/UserProfile';

interface DifficultySelectorProps {
  selected: ExerciseDifficulty;
  onChange: (difficulty: ExerciseDifficulty) => void;
}

const T = {
  bg:      '#0A0A0A',
  surface: '#141414',
  border:  'rgba(255,255,255,0.08)',
  text:    '#EDEDED',
  text3:   'rgba(102,102,100,1)',
  font:    "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ selected, onChange }) => {
  const levels: ExerciseDifficulty[] = ['beginner', 'medium', 'hard'];

  return (
    <div style={{
      display: 'flex',
      background: '#161616',
      borderRadius: 10,
      padding: 4,
      gap: 0,
    }}>
      {levels.map(level => {
        const info = DIFFICULTY_INFO[level];
        const isSelected = selected === level;
        return (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '10px 0',
              borderRadius: 7,
              fontSize: 13,
              fontWeight: isSelected ? 600 : 400,
              cursor: 'pointer',
              fontFamily: T.font,
              border: 'none',
              transition: 'all 0.2s ease',
              color: isSelected ? info.color : T.text3,
              background: isSelected ? 'rgba(255,255,255,0.06)' : 'transparent',
            }}
          >
            {info.label}
          </button>
        );
      })}
    </div>
  );
};

export default DifficultySelector;
