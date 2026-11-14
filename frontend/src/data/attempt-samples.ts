import type { HighlightId, HighlightNote } from "../components/attempts/types";
// Dữ liệu minh họa của mẫu thiết kế. API lượt làm sẽ cung cấp nội dung thực.
export const readingHighlightText = {
  h1: "reduce stress and encourage physical activity",
  h2: "Local residents now grow vegetables there and take part in weekend workshops.",
  h3: "the benefits to public health make the investment worthwhile",
};

export const readingHighlights: Record<HighlightId, HighlightNote> = {
  h1: { color: "vang", note: "", on: true },
  h2: {
    color: "xanhla",
    note: "Ví dụ cho ý: dự án do cộng đồng điều hành.",
    on: true,
  },
  h3: { color: "hong", note: "", on: true },
};

export const readingAnswers = { 1: "A", 2: "B" };

export const readingFlags = [3];

export const readingQuestions = [
  {
    n: 1,
    text: "What is one benefit of spending time in parks?",
    o: ["Reduced stress", "Higher traffic levels", "Longer working hours"],
  },
  {
    n: 2,
    text: "When was the car park transformed?",
    o: ["2009", "2019", "2023"],
  },
  {
    n: 3,
    text: "Who manages the garden?",
    o: ["A private company", "The police", "Volunteers"],
  },
  {
    n: 4,
    text: "Why do supporters say the investment is worthwhile?",
    o: ["Benefits to public health", "Lower taxes", "Faster roads"],
  },
];

export const listeningAnswers = {
  1: "Saturday",
  4: "Comfortable shoes",
  5: "by phone",
};

export const listeningFlags = [2];

export const listeningQuestions = [
  {
    n: 4,
    text: "What should visitors bring?",
    o: ["Comfortable shoes", "A camera", "Cash only"],
  },
  {
    n: 5,
    text: "The guide recommends booking",
    o: ["online", "by phone", "at the station"],
  },
  {
    n: 6,
    text: "Which building will the group visit first?",
    o: ["The old library", "City museum", "Town hall"],
  },
];

export const writingTasks = {
  1: {
    label: "Task 1",
    meta: "Writing Task 1 · tối thiểu 150 từ · gợi ý 20 phút",
    title: "Internet access at home",
    prompt:
      "The chart below shows the percentage of households with internet access in three countries between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    hint: "Hình biểu đồ của đề được hiển thị ở đây khi làm bài thật.",
  },
  2: {
    label: "Task 2",
    meta: "Writing Task 2 · tối thiểu 250 từ · gợi ý 40 phút",
    title: "Public transport and traffic",
    prompt:
      "Some people think that governments should spend more money on public transport rather than building new roads. To what extent do you agree or disagree?",
    hint: "Give reasons for your answer and include any relevant examples from your own knowledge or experience.",
  },
};

export const writingAnswers = {
  1: "",
  2: "In recent years, the question of how best to spend public money on transport has become increasingly controversial. While some argue that new roads are necessary to reduce congestion, I strongly believe that investment in public transport is a more effective long-term solution.\n\nFirstly, an efficient network of buses and trains can carry far more passengers than private cars, which reduces both traffic and air pollution. For example, cities such as Singapore have achieved this by making public transport cheap and reliable.",
};

export const writingNotes = {
  1: "",
  2: "Mở bài: nêu quan điểm đồng ý.\nThân bài 1: xe buýt, tàu chở nhiều người, giảm ô nhiễm.\nThân bài 2: chi phí đường mới cao, ví dụ Singapore.",
};

export const sampleResults = {
  reading: {
    name: "Reading",
    retry: "#ReadingTest",
    part: "Passage 1",
    real: [
      ["Band", "6.5", "Reading"],
      ["Đúng", "29/40", "72%"],
      ["Thời gian", "52:10", "trên 60 phút"],
      ["Lần làm", "2", "điểm tăng 0.5"],
    ],
    prac: [
      ["Kết quả", "9/13", "Đúng 9/13 câu, 69%"],
      ["Thời gian đã làm", "12:40", "đồng hồ đếm lên"],
      ["Phần đã làm", "Passage 1", "13 câu"],
      ["Lần làm", "1", "Practice không tính band"],
    ],
    rows: [
      {
        n: 1,
        chosen: "A. Reduced stress",
        ok: true,
        explain:
          "Đoạn 1 nói công viên giúp giảm căng thẳng, trùng với phương án A.",
      },
      {
        n: 2,
        chosen: "B. 2019",
        ok: true,
        explain:
          "Đoạn 2: bãi đỗ xe được cải tạo thành vườn cộng đồng năm 2019.",
      },
      {
        n: 3,
        chosen: "B. The police",
        correct: "C. Volunteers",
        ok: false,
        explain:
          "Đoạn 2 nói dự án do tình nguyện viên quản lý, không phải công ty hay cảnh sát.",
      },
      {
        n: 4,
        chosen: "C. Faster roads",
        correct: "A. Benefits to public health",
        ok: false,
        explain:
          'Cụm "benefits to public health" nằm ở đoạn cuối, khớp phương án A.',
      },
    ],
    bars: {
      real: [
        ["Multiple Choice", 80, "8/10"],
        ["True / False / NG", 50, "5/10"],
        ["Matching Headings", 70, "7/10"],
        ["Completion", 90, "9/10"],
      ],
      prac: [
        ["Multiple Choice", 75, "3/4"],
        ["True / False / NG", 67, "4/6"],
        ["Completion", 67, "2/3"],
      ],
    },
  },
  listening: {
    name: "Listening",
    retry: "#ListeningTest",
    part: "Section 1",
    real: [
      ["Band", "7.0", "Listening"],
      ["Đúng", "31/40", "78%"],
      ["Thời gian", "31:20", "audio phát một lần"],
      ["Lần làm", "1", "lần đầu"],
    ],
    prac: [
      ["Kết quả", "7/10", "Đúng 7/10 câu, 70%"],
      ["Thời gian đã làm", "09:15", "đồng hồ đếm lên"],
      ["Phần đã làm", "Section 1", "10 câu"],
      ["Lần làm", "1", "Practice không tính band"],
    ],
    rows: [
      {
        n: 1,
        chosen: "Saturday",
        ok: true,
        explain: "Nghe ở 00:42: người nói xác nhận tour chạy vào thứ Bảy.",
      },
      {
        n: 2,
        chosen: "north",
        correct: "east",
        ok: false,
        explain:
          "Nghe ở 01:05: điểm hẹn là cổng phía đông, không phải cổng phía bắc.",
      },
      {
        n: 3,
        chosen: "12",
        ok: true,
        explain: "Nghe ở 01:28: giá mỗi người là 12 bảng.",
      },
      {
        n: 4,
        chosen: "Comfortable shoes",
        ok: true,
        explain: "Nghe ở 01:52: hướng dẫn viên nhắc mang giày thoải mái.",
      },
    ],
    bars: {
      real: [
        ["Form completion", 83, "5/6"],
        ["Multiple Choice", 75, "9/12"],
        ["Map labelling", 80, "8/10"],
        ["Sentence completion", 80, "8/10"],
      ],
      prac: [
        ["Form completion", 67, "4/6"],
        ["Multiple Choice", 75, "3/4"],
      ],
    },
  },
};
