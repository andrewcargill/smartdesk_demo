import ReusableLearningModuleShell from './ReusableLearningModuleShell.jsx';

export default function LearningModule({ config, onBack }) {
  return <ReusableLearningModuleShell moduleData={config} onBack={onBack} />;
}
