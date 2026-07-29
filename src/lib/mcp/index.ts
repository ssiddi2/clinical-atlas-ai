import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listQbank from "./tools/list-qbank-questions";
import getQbank from "./tools/get-qbank-question";
import searchContent from "./tools/search-content";
import getAtlasConvo from "./tools/get-atlas-conversation";
import listAtlasConvos from "./tools/list-atlas-conversations";
import getCourseQuiz from "./tools/get-course-quiz";
import flagContent from "./tools/flag-content";
import listReviews from "./tools/list-reviews";
import me from "./tools/me";
import myCourses from "./tools/my-courses";
import myProgress from "./tools/my-progress";
import myNotifications from "./tools/my-notifications";
import myTaughtCourses from "./tools/my-taught-courses";
import listCourseStudents from "./tools/list-course-students";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "livemed-academy-review",
  title: "Livemed Academy — Content Review",
  version: "0.1.0",
  instructions:
    "Role-aware tools for Livemed Academy. Any signed-in user: me, my_courses, my_progress, my_notifications. Physicians: my_taught_courses, list_course_students. Platform admins: list_qbank_questions, get_qbank_question, search_content, list_atlas_conversations, get_atlas_conversation, get_course_quiz, flag_content_for_review, list_content_reviews. Each tool enforces its own role check via the OAuth-verified session.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    me,
    myCourses,
    myProgress,
    myNotifications,
    myTaughtCourses,
    listCourseStudents,
    listQbank,
    getQbank,
    searchContent,
    listAtlasConvos,
    getAtlasConvo,
    getCourseQuiz,
    flagContent,
    listReviews,
  ],
});