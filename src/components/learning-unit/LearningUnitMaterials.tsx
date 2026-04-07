import CourseMaterials from "@/components/courses/CourseMaterials";

interface Props {
  topicId: string;
  courseId: string;
  isInstructor: boolean;
}

export default function LearningUnitMaterials({ topicId, courseId, isInstructor }: Props) {
  return <CourseMaterials courseId={courseId} isInstructor={isInstructor} topicId={topicId} />;
}
