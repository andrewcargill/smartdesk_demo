import LearningModule from './learningModule/LearningModule.jsx';
import { english8AConfig } from './learningModule/data/english8AConfig.js';

export default function English8AModule({ onBackToWeek, onClose }) {
  return <LearningModule config={english8AConfig} onBack={onClose || onBackToWeek} />;
}
