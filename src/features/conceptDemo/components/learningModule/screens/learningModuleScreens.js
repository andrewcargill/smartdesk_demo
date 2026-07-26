import AssessmentScreen from './AssessmentScreen.jsx';
import ClassPictureScreen from './ClassPictureScreen.jsx';
import NowScreen from './NowScreen.jsx';
import PlanScreen from './PlanScreen.jsx';

export const learningModuleScreens = [
  {
    id: 'class-picture',
    label: 'Class picture',
    component: ClassPictureScreen,
  },
  {
    id: 'plan',
    label: 'Plan',
    component: PlanScreen,
  },
  {
    id: 'now',
    label: 'Now',
    component: NowScreen,
  },
  {
    id: 'assessment',
    label: 'Assessment',
    component: AssessmentScreen,
  },
];

export const defaultLearningModuleScreenId = learningModuleScreens[0].id;

export function getLearningModuleScreen(screenId) {
  return learningModuleScreens.find((screen) => screen.id === screenId) || learningModuleScreens[0];
}

export function getLearningModuleNavigationItems() {
  return learningModuleScreens.map(({ id, label }) => ({ id, label }));
}
