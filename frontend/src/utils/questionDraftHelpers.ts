import { toast } from "sonner";
import {
  type QuestionDraft,
  type QuestionTypeValue,
} from "../components/QuizBuilder";
import { ExternalBlob } from "../backend";
import { MAX_OPTIONS, MIN_OPTIONS, MAX_ACCEPTED_ANSWERS } from "./constants";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export function handleImageUpload(
  file: File,
  question: QuestionDraft,
  onChange: (updated: QuestionDraft) => void,
) {
  if (file.size > MAX_IMAGE_SIZE) {
    toast.error("Image must be under 10 MB");
    return;
  }
  if (!file.type.startsWith("image/")) {
    toast.error("File must be an image");
    return;
  }
  file
    .arrayBuffer()
    .then((buf) => {
      const blob = ExternalBlob.fromBytes(new Uint8Array(buf));
      onChange({ ...question, image: blob });
    })
    .catch(() => {
      toast.error("Failed to read image");
    });
}

export function handleTypeChange(
  newType: QuestionTypeValue,
  question: QuestionDraft,
  onChange: (updated: QuestionDraft) => void,
) {
  const base = { ...question, questionType: newType };
  if (newType === "trueFalse") {
    base.options = ["True", "False"];
    base.correctOptionIndices = [0];
    base.isMultiSelect = false;
  } else if (newType === "quiz" && question.questionType !== "quiz") {
    base.options = ["", ""];
    base.correctOptionIndices = [0];
  }
  onChange(base);
}

export function toggleCorrect(
  index: number,
  question: QuestionDraft,
  onChange: (updated: QuestionDraft) => void,
) {
  if (question.isMultiSelect) {
    const isCorrect = question.correctOptionIndices.includes(index);
    const updated = isCorrect
      ? question.correctOptionIndices.filter((i) => i !== index)
      : [...question.correctOptionIndices, index];
    if (updated.length > 0) {
      onChange({ ...question, correctOptionIndices: updated });
    }
  } else {
    onChange({ ...question, correctOptionIndices: [index] });
  }
}

export function updateOptionText(
  index: number,
  text: string,
  question: QuestionDraft,
  onChange: (updated: QuestionDraft) => void,
) {
  const options = [...question.options];
  options[index] = text;
  onChange({ ...question, options });
}

export function addOption(
  question: QuestionDraft,
  onChange: (updated: QuestionDraft) => void,
) {
  if (question.options.length >= MAX_OPTIONS) return;
  onChange({ ...question, options: [...question.options, ""] });
}

export function removeOption(
  index: number,
  question: QuestionDraft,
  onChange: (updated: QuestionDraft) => void,
) {
  if (question.options.length <= MIN_OPTIONS) return;
  const options = question.options.filter((_, i) => i !== index);
  const correctOptionIndices = question.correctOptionIndices
    .map((i) => (i > index ? i - 1 : i))
    .filter((i) => i !== index && i < options.length);
  onChange({
    ...question,
    options,
    correctOptionIndices:
      correctOptionIndices.length > 0 ? correctOptionIndices : [0],
  });
}

export function updateAcceptedAnswer(
  index: number,
  text: string,
  question: QuestionDraft,
  onChange: (updated: QuestionDraft) => void,
) {
  const answers = [...question.acceptedAnswers];
  answers[index] = text;
  onChange({ ...question, acceptedAnswers: answers });
}

export function addAcceptedAnswer(
  question: QuestionDraft,
  onChange: (updated: QuestionDraft) => void,
) {
  if (question.acceptedAnswers.length >= MAX_ACCEPTED_ANSWERS) return;
  onChange({
    ...question,
    acceptedAnswers: [...question.acceptedAnswers, ""],
  });
}

export function removeAcceptedAnswer(
  index: number,
  question: QuestionDraft,
  onChange: (updated: QuestionDraft) => void,
) {
  if (question.acceptedAnswers.length <= 1) return;
  onChange({
    ...question,
    acceptedAnswers: question.acceptedAnswers.filter((_, i) => i !== index),
  });
}
