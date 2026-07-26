import LearningModule from './learningModule/LearningModule.jsx';
import { maths7CConfig } from './learningModule/data/maths7CConfig.js';

export default function Maths7CModule({ onBackToWeek, onClose }) {
  return <LearningModule config={maths7CConfig} onBack={onClose || onBackToWeek} />;
}
