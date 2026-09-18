import { Task, Classroom, ClassStudent } from "@/types";

// ─── Classes ──────────────────────────────────────────────────────────────────

export const mockClasses: Classroom[] = [
  {
    id: "class-01",
    name: "Intermediate English B2",
    subject: "English",
    teacherId: "teacher-01",
    teacherName: "Ms. Sarah Chen",
    studentCount: 24,
    taskCount: 3,
    color: "#2563EB",
    description: "B2 level English for international students.",
    createdAt: "2024-09-01T08:00:00Z",
    maxStudents: 30,
    tasks: [
      "Grammar Quiz — Sentence Structures",
      "Vocabulary Builder: Academic Words",
      "Punctuation Drill",
    ],
  },
  {
    id: "class-02",
    name: "Advanced Grammar",
    subject: "English",
    teacherId: "teacher-01",
    teacherName: "Ms. Sarah Chen",
    studentCount: 18,
    taskCount: 2,
    color: "#f59e0b",
    description: "Deep dive into complex grammar structures.",
    createdAt: "2024-09-01T09:00:00Z",
    maxStudents: 25,
    tasks: ["Error Correction Worksheet", "Paragraph Structure Exercise"],
  },
  {
    id: "class-03",
    name: "IELTS Preparation",
    subject: "English",
    teacherId: "teacher-02",
    teacherName: "Mr. James Park",
    studentCount: 30,
    taskCount: 5,
    color: "#10b981",
    description: "Comprehensive IELTS exam preparation.",
    createdAt: "2024-09-15T08:00:00Z",
    maxStudents: 35,
    tasks: [
      "IELTS Mock Test — Reading",
      "Listening Exercise: News Report",
      "Writing Workshop: Formal Emails",
      "Speaking Practice: Debate Topic",
      "Reading Comprehension — Passage A",
    ],
  },
];

// ─── Students ─────────────────────────────────────────────────────────────────

export const mockStudents: ClassStudent[] = [
  {
    id: "s1",
    name: "Alex Kim",
    email: "alex@school.edu",
    joinedAt: "2024-09-01",
    progress: 78,
  },
  {
    id: "s2",
    name: "Maria Santos",
    email: "maria@school.edu",
    joinedAt: "2024-09-01",
    progress: 92,
  },
  {
    id: "s3",
    name: "James Liu",
    email: "james@school.edu",
    joinedAt: "2024-09-02",
    progress: 55,
  },
  {
    id: "s4",
    name: "Fatima Hassan",
    email: "fatima@school.edu",
    joinedAt: "2024-09-03",
    progress: 88,
  },
  {
    id: "s5",
    name: "Noah Patel",
    email: "noah@school.edu",
    joinedAt: "2024-09-03",
    progress: 41,
  },
  {
    id: "s6",
    name: "Yuki Tanaka",
    email: "yuki@school.edu",
    joinedAt: "2024-09-04",
    progress: 67,
  },
];

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const mockTasks: Task[] = [
  {
    id: "task-vocab-01",
    title: "Weather Vocabulary",
    taskType: "vocabulary",
    description: "Learn and practice weather-related vocabulary.",
    currentStudentProgress: 64,
    published: true,
    dueDate: "2026-03-20",
    questions: [
      {
        id: "q1",
        type: "flashcard",
        word: "Precipitation",
        definition:
          "Any form of water — liquid or solid — falling from the sky.",
        note: "Includes rain, snow, sleet, and hail.",
        image:
          "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=800&auto=format&fit=crop", // Raindrops on glass
      },
      {
        id: "q2",
        type: "mcq",
        question: "What does 'arid' mean?",
        options: [
          { id: "a", text: "Very wet and humid" },
          { id: "b", text: "Extremely dry with little rainfall" },
          { id: "c", text: "Cold and freezing" },
          { id: "d", text: "Windy and stormy" },
        ],
        correctAnswers: ["b"],
        note: "Arid regions include deserts like the Sahara.",
        image:
          "https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=800&auto=format&fit=crop", // Desert landscape
      },
      {
        id: "q3",
        type: "gap_mcq",
        question: "The forecast predicted heavy ___ tomorrow morning.",
        options: [
          { id: "a", text: "sunshine" },
          { id: "b", text: "precipitation" },
          { id: "c", text: "drought" },
          { id: "d", text: "visibility" },
        ],
        correctAnswers: ["b"],
        image:
          "https://images.unsplash.com/photo-1534274988757-a28bf1f539cf?q=80&w=800&auto=format&fit=crop", // Heavy storm/rain
      },
      {
        id: "q4",
        type: "text_input",
        question:
          "What is the term for a long period of abnormally low rainfall?",
        correctAnswers: ["drought", "a drought"],
        note: "Droughts can cause serious water shortages.",
        image:
          "https://images.unsplash.com/photo-1504333638930-c8787321eee0?q=80&w=800&auto=format&fit=crop", // Cracked dry earth
      },
      {
        id: "q5",
        type: "matching",
        question: "Match each weather term with its definition.",
        pairs: [
          { left: "Blizzard", right: "Severe snowstorm with strong winds" },
          { left: "Typhoon", right: "Tropical storm in the northwest Pacific" },
          { left: "Drought", right: "Extended period of low rainfall" },
          {
            left: "Heatwave",
            right: "Prolonged period of excessively hot weather",
          },
        ],
        correctAnswers: [
          "Blizzard::Severe snowstorm with strong winds",
          "Typhoon::Tropical storm in the northwest Pacific",
          "Drought::Extended period of low rainfall",
          "Heatwave::Prolonged period of excessively hot weather",
        ],
        image:
          "https://images.unsplash.com/photo-1592210633468-155e8238806c?q=80&w=800&auto=format&fit=crop", // General weather/lightning
      },
    ],
  },
  {
    id: "task-grammar-01",
    title: "Present Perfect Tense",
    taskType: "grammar",
    description: "Practice using the present perfect tense correctly.",
    currentStudentProgress: 75,
    published: true,
    dueDate: "2026-03-25",
    contentSection: {
      title: "Understanding Present Perfect",
      description: "Read this explanation before answering questions.",
      content:
        "The present perfect tense is formed with have/has + past participle. It connects past actions to the present.",
    },
    questions: [
      {
        id: "g1",
        type: "mcq",
        question: "Which sentence uses the present perfect tense correctly?",
        options: [
          { id: "a", text: "She goes to Paris last year." },
          { id: "b", text: "She has been to Paris." },
          { id: "c", text: "She was going to Paris." },
          { id: "d", text: "She go to Paris." },
        ],
        correctAnswers: ["b"],
        note: "Present perfect: have/has + past participle.",
        // No image field here as per your rule
      },
      {
        id: "g2",
        type: "gap_mcq",
        question: "I ___ never tried sushi before.",
        options: [
          { id: "a", text: "am" },
          { id: "b", text: "was" },
          { id: "c", text: "have" },
          { id: "d", text: "did" },
        ],
        correctAnswers: ["c"],
      },
      {
        id: "g3",
        type: "text_input",
        question: "Correct this sentence: 'They has finished the project.'",
        correctAnswers: [
          "They have finished the project.",
          "They have finished the project",
        ],
        note: "With plural subjects, use 'have' not 'has'.",
      },
    ],
  },
  {
    id: "task-reading-01",
    title: "The Ocean's Secrets",
    taskType: "reading",
    description: "Read the passage and answer comprehension questions.",
    published: false,
    currentStudentProgress: 42,
    contentSection: {
      title: "Ocean Exploration",
      description: "Read the passage carefully.",
      content:
        "More than 80% of the ocean remains unexplored. Scientists continue discovering new species...",
    },
    questions: [
      {
        id: "r1",
        type: "mcq",
        question: "What percentage of the ocean remains unexplored?",
        options: [
          { id: "a", text: "Around 30%" },
          { id: "b", text: "Around 50%" },
          { id: "c", text: "More than 80%" },
          { id: "d", text: "Less than 10%" },
        ],
        correctAnswers: ["c"],
        note: "Scientists estimate over 80% of oceans are unexplored.",
      },
      {
        id: "r2",
        type: "text_input",
        question: "Name one creature that lives in the deep ocean.",
        correctAnswers: ["anglerfish", "giant squid", "viperfish"],
        note: "Many deep-sea creatures produce light via bioluminescence.",
      },
    ],
  },
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export const getTaskById = (id: string): Task | undefined =>
  mockTasks.find((t) => t.id === id);

export const getClassById = (id: string): Classroom | undefined =>
  mockClasses.find((c) => c.id === id);

export const getTasksForClass = (_classId: string): Task[] => mockTasks;
