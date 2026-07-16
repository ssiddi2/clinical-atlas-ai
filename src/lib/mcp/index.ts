import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listQbank from "./tools/list-qbank-questions";
import getQbank from "./tools/get-qbank-question";
import searchContent from "./tools/search-content";
import getAtlasConvo from "./tools/get-atlas-conversation";
import listAtlasConvos from "./tools/list-atlas-conversations";
import getCourseQuiz from "./tools/get-course-quiz";
import flagContent from "./tools/flag-content";
import listReviews from "./tools/list-reviews";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "livemed-academy-review",
  title: "Livemed Academy — Content Review",
  version: "0.1.0",
  instructions:
    "Admin-only tools for reviewing Livemed Academy content quality. Use list_qbank_questions / search_content to find items, get_qbank_question / get_course_quiz / get_atlas_conversation to read full content, and flag_content_for_review to log a verdict with sources cross-checked (First Aid, UpToDate, USPSTF, AHA/ACC, NBME outlines, etc.). Every tool requires the platform_admin role.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listQbank, getQbank, searchContent, listAtlasConvos, getAtlasConvo, getCourseQuiz, flagContent, listReviews],
});