export const topics = {
  environment: "Môi trường",
  education: "Giáo dục",
  technology: "Công nghệ",
};
export type Topic = keyof typeof topics;
export interface Word {
  id: string;
  word: string;
  meaning: string;
  phonetic: string;
  pos: string;
  example: string;
  translation: string;
  image: string;
  audio: string;
}
const seeds: Record<Topic, string[][]> = {
  environment: [
    [
      "forest",
      "khu rừng",
      "/ˈfɒrɪst/",
      "danh từ",
      "Forests provide shelter for wildlife.",
      "Rừng cung cấp nơi trú ẩn cho động vật hoang dã.",
      "1448375240586-882707db888b",
    ],
    [
      "river",
      "dòng sông",
      "/ˈrɪvə/",
      "danh từ",
      "The river flows through the valley.",
      "Dòng sông chảy qua thung lũng.",
      "1437482078695-73f5ca6c96e2",
    ],
    [
      "habitat",
      "môi trường sống",
      "/ˈhæbɪtæt/",
      "danh từ",
      "Wetlands are a vital habitat for birds.",
      "Đất ngập nước là môi trường sống thiết yếu của chim.",
      "1472396961693-142e6e269027",
    ],
    [
      "conservation",
      "sự bảo tồn",
      "/ˌkɒnsəˈveɪʃən/",
      "danh từ",
      "Conservation protects native species.",
      "Hoạt động bảo tồn bảo vệ các loài bản địa.",
      "1441974231531-c6227db76b6e",
    ],
    [
      "solar",
      "thuộc về mặt trời",
      "/ˈsəʊlə/",
      "tính từ",
      "Solar panels supply clean energy.",
      "Các tấm pin mặt trời cung cấp năng lượng sạch.",
      "1509391366360-2e959784a276",
    ],
    [
      "mountain",
      "ngọn núi",
      "/ˈmaʊntɪn/",
      "danh từ",
      "Snow covers the mountain in winter.",
      "Tuyết phủ ngọn núi vào mùa đông.",
      "1464822759023-fed622ff2c3b",
    ],
  ],
  education: [
    [
      "library",
      "thư viện",
      "/ˈlaɪbrəri/",
      "danh từ",
      "Our library lends digital books.",
      "Thư viện cho mượn sách điện tử.",
      "1507842217343-583bb7270b66",
    ],
    [
      "lecture",
      "bài giảng",
      "/ˈlektʃə/",
      "danh từ",
      "The lecture starts at nine.",
      "Bài giảng bắt đầu lúc chín giờ.",
      "1524178232363-1fb2b075b655",
    ],
  ],
  technology: [
    [
      "network",
      "mạng lưới",
      "/ˈnetwɜːk/",
      "danh từ",
      "A network connects the computers.",
      "Một mạng lưới kết nối các máy tính.",
      "1558494949-ef010cbdcc31",
    ],
    [
      "device",
      "thiết bị",
      "/dɪˈvaɪs/",
      "danh từ",
      "This device measures temperature.",
      "Thiết bị này đo nhiệt độ.",
      "1518770660439-4636190af475",
    ],
  ],
};
export function sampleWords(topic: Topic): Word[] {
  return seeds[topic].map(
    ([word, meaning, phonetic, pos, example, translation, photo]) => ({
      id: topic + "-" + word,
      word,
      meaning,
      phonetic,
      pos,
      example,
      translation,
      image:
        "https://images.unsplash.com/photo-" +
        photo +
        "?auto=format&fit=crop&w=250&q=80",
      audio:
        "https://api.dictionaryapi.dev/media/pronunciations/en/" +
        word +
        "-us.mp3",
    }),
  );
}
export function loadWords(topic: Topic, draft = false): Word[] {
  try {
    const raw = localStorage.getItem(
      "vocab:" + (draft ? "draft:" : "live:") + topic,
    );
    if (raw) {
      const words: unknown = JSON.parse(raw);
      if (
        Array.isArray(words) &&
        words.every(
          (w) =>
            w && typeof w.word === "string" && typeof w.meaning === "string",
        )
      )
        return words;
    }
  } catch {}
  return draft ? loadWords(topic) : sampleWords(topic);
}
export function storeWords(topic: Topic, words: Word[], draft: boolean) {
  localStorage.setItem(
    "vocab:" + (draft ? "draft:" : "live:") + topic,
    JSON.stringify(words),
  );
}
