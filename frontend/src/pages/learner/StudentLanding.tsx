import LearnerHeader from "../../components/navigation/LearnerHeader";
import FeaturedSamples from "../../components/samples/FeaturedSamples";
import { useDailyMotivation } from "../../lib/learner/daily-motivation";
import { useAccount } from "../../lib/auth/account";
import StudyProgress from "../../components/learner/StudyProgress";
import StudyResults from "../../components/learner/StudyResults";
import { styleOf, cssText, getAccentColors } from "../../lib/shared/styles";

export default function StudentLanding({ accent }: { accent?: string }) {
  const account = useAccount();
  const motivation = useDailyMotivation();
  const v = getAccentColors(accent);
  return (
    <>
      {"\n"}
      {"\n"}
      <style>
        {cssText(
          "\nbody{margin:0;background:#FCFBF7}\na{color:#2963CC}\n.bu-dd-menu{display:none}.bu-dd:hover .bu-dd-menu,.bu-dd:focus-within .bu-dd-menu{display:block}.bu-dd:hover > a{background:#F3F0EA}\n",
        )}
      </style>
      {"\n"}
      {"\n"}
      <div
        style={styleOf(
          "font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; background: #FCFBF7; font-size: 15px; line-height: 1.6; min-height: 3700px",
        )}
      >
        {"\n"}
        {"\n"}
        <LearnerHeader active="home" />
        {"\n\n"}
        {"\n"}
        <div
          style={styleOf(
            "background: linear-gradient(135deg, #E3ECFD 0%, #E6F3EC 100%); border-bottom: 1.5px solid #D6D4D0",
          )}
        >
          <div
            style={styleOf(
              "max-width: 1200px; margin: 0 auto; padding: 44px 24px 48px; display: flex; flex-direction: column; gap: 24px",
            )}
          >
            {"\n"}
            <div>
              <div
                style={styleOf(
                  "display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #706473",
                )}
              >
                <span
                  style={styleOf(
                    "width: 8px; height: 8px; border-radius: 50%; background: " +
                      v.accent,
                  )}
                ></span>
                <span>{"Chào mừng quay lại"}</span>
              </div>
              <h1
                className="m-0 mt-3 text-[34px] md:text-[44px] leading-tight font-bold tracking-tight text-[var(--attempt-text-352637,#352637)]"
                style={{ fontFamily: "'IBM Plex Serif', Georgia, serif" }}
              >
                {"Học một chút, tiến xa hơn."}
              </h1>
              <p style={styleOf("margin: 6px 0 0; color: #4B3D4D")}>
                {account.name}, hôm nay bạn muốn chinh phục kỹ năng nào?
              </p>
            </div>
            {"\n"}
            <div className="flex flex-col md:flex-row gap-5 items-stretch">
              <div className="flex-1 md:flex-[1.7] min-w-0 p-6 sm:p-9 md:p-10 rounded-[26px] border-solid border-[1.5px] border-[#352637] bg-[#352637] text-white flex flex-col gap-3.5">
                {"\n"}
                <div
                  style={styleOf(
                    "display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #CABFAE",
                  )}
                >
                  <span style={styleOf("color: #FBEDBF")}>
                    <svg
                      width={"16"}
                      height={"16"}
                      viewBox={"0 0 24 24"}
                      fill={"none"}
                      stroke={"currentColor"}
                      strokeWidth={"2"}
                      strokeLinecap={"round"}
                      strokeLinejoin={"round"}
                    >
                      <path
                        d={
                          "M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.3l1-6.2L3 9.7l6.2-.9z"
                        }
                      ></path>
                    </svg>
                  </span>
                  {"Động lực mỗi ngày"}
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 28px; font-weight: 700; line-height: 1.3; letter-spacing: -0.02em; max-width: 26ch; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                  )}
                >
                  {
                    `“${motivation}”`
                  }
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "width: 44px; height: 4px; border-radius: 2px; background: " +
                      v.accent,
                  )}
                ></div>
                {"\n"}
                <div className="mt-auto pt-2.5 flex flex-col sm:flex-row gap-3">
                  <a
                    href={"#"}
                    className="w-full box-border sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border-solid border-[1.5px] border-[var(--attempt-line-d6d4d0,#D6D4D0)] font-semibold text-sm no-underline whitespace-nowrap"
                    style={{ background: v.accent, color: v.onAccent }}
                  >
                    {"Làm tiếp bài dở"}
                    <svg
                      width={"18"}
                      height={"18"}
                      viewBox={"0 0 24 24"}
                      fill={"none"}
                      stroke={"currentColor"}
                      strokeWidth={"2"}
                      strokeLinecap={"round"}
                      strokeLinejoin={"round"}
                    >
                      <path d={"M5 12h14M13 6l6 6-6 6"}></path>
                    </svg>
                  </a>
                  <a
                    href={"#"}
                    className="w-full box-border sm:w-auto inline-flex items-center justify-center h-11 px-5 rounded-xl border-solid border-[1.5px] border-white text-white font-semibold text-sm no-underline whitespace-nowrap hover:bg-white/10"
                  >
                    {"Chọn đề mới"}
                  </a>
                </div>
              </div>
              {"\n"}
              <StudyProgress key={account.id} userId={account.id} />
            </div>
          </div>
        </div>
        {"\n\n"}
        {"\n"}
        <StudyResults key={account.id} recent />
        {"\n\n"}
        {"\n"}
        <section
          id={"bo-de"}
          style={styleOf(
            "max-width: 1200px; margin: 0 auto; padding: 36px 24px",
          )}
        >
          {"\n"}
          <div
            style={styleOf(
              "display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 24px",
            )}
          >
            {"\n"}
            <div>
              {"\n"}
              <h2
                style={styleOf(
                  "margin: 0; font-size: 28px; line-height: 1.25; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                )}
              >
                {"Bộ đề mới nhất"}
              </h2>
              {"\n"}
              <p style={styleOf("margin: 4px 0 0; color: #706473")}>
                {
                  "Mỗi bộ gồm nhiều đề đủ 4 kỹ năng, làm trọn đề hoặc từng kỹ năng."
                }
              </p>
              {"\n"}
            </div>
            {"\n"}
            <a
              href={"#"}
              style={styleOf(
                "display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 15px; color: #352637; text-decoration: none",
              )}
            >
              {"Xem thêm "}
              <svg
                width={"16"}
                height={"16"}
                viewBox={"0 0 24 24"}
                fill={"none"}
                stroke={"currentColor"}
                strokeWidth={"2.2"}
                strokeLinecap={"round"}
                strokeLinejoin={"round"}
              >
                <path d={"M9 6l6 6-6 6"}></path>
              </svg>
            </a>
            {"\n"}
          </div>
          {"\n"}
          <div
            style={styleOf(
              "display: flex; gap: 28px 20px; overflow-x: auto; scroll-snap-type: x proximity; padding: 4px 4px 12px; margin: -4px",
            )}
          >
            {"\n"}
            <div
              style={styleOf(
                "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; color: #352637; text-decoration: none; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
              )}
            >
              {"\n"}
              <div
                style={styleOf(
                  "aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #BFD8F7",
                )}
              ></div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; padding: 4px 8px 0",
                )}
              >
                {"Mock Test 2026 Vol 4"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 14px; color: #706473",
                )}
              >
                <span>{"6 bài test"}</span>
                <span
                  aria-hidden={"true"}
                  style={styleOf(
                    "width: 4px; height: 4px; border-radius: 50%; background: #B3A9B5",
                  )}
                ></span>
                <span>{"12.4K lượt làm"}</span>
              </div>
              <div
                style={styleOf(
                  "font-size: 14px; line-height: 1.5; color: #706473; padding: 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden",
                )}
              >
                {
                  "6 đề Listening, Reading, Writing, Speaking theo format thi trên máy"
                }
              </div>
              {"\n"}
              <a
                href={"ExamDetail.dc.html"}
                style={styleOf(
                  "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                )}
              >
                {"Xem bài test "}
                <svg
                  width={"16"}
                  height={"16"}
                  viewBox={"0 0 24 24"}
                  fill={"none"}
                  stroke={"currentColor"}
                  strokeWidth={"2.2"}
                  strokeLinecap={"round"}
                  strokeLinejoin={"round"}
                >
                  <path d={"M9 6l6 6-6 6"}></path>
                </svg>
              </a>
              {"\n"}
            </div>
            {"\n"}
            <div
              style={styleOf(
                "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; color: #352637; text-decoration: none; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
              )}
            >
              {"\n"}
              <div
                style={styleOf(
                  "aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #F7C4B6",
                )}
              ></div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; padding: 4px 8px 0",
                )}
              >
                {"Actual Test Quý 2/2026"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 14px; color: #706473",
                )}
              >
                <span>{"8 bài test"}</span>
                <span
                  aria-hidden={"true"}
                  style={styleOf(
                    "width: 4px; height: 4px; border-radius: 50%; background: #B3A9B5",
                  )}
                ></span>
                <span>{"21.0K lượt làm"}</span>
              </div>
              <div
                style={styleOf(
                  "font-size: 14px; line-height: 1.5; color: #706473; padding: 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden",
                )}
              >
                {"Tổng hợp từ các kỳ thi tháng 4 đến tháng 6/2026"}
              </div>
              {"\n"}
              <a
                href={"ExamDetail.dc.html"}
                style={styleOf(
                  "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                )}
              >
                {"Xem bài test "}
                <svg
                  width={"16"}
                  height={"16"}
                  viewBox={"0 0 24 24"}
                  fill={"none"}
                  stroke={"currentColor"}
                  strokeWidth={"2.2"}
                  strokeLinecap={"round"}
                  strokeLinejoin={"round"}
                >
                  <path d={"M9 6l6 6-6 6"}></path>
                </svg>
              </a>
              {"\n"}
            </div>
            {"\n"}
            <div
              style={styleOf(
                "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; color: #352637; text-decoration: none; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
              )}
            >
              {"\n"}
              <div
                style={styleOf(
                  "aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #C5CEF5",
                )}
              ></div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; padding: 4px 8px 0",
                )}
              >
                {"Speaking Forecast T9–T12/2026"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 14px; color: #706473",
                )}
              >
                <span>{"42 bài test"}</span>
                <span
                  aria-hidden={"true"}
                  style={styleOf(
                    "width: 4px; height: 4px; border-radius: 50%; background: #B3A9B5",
                  )}
                ></span>
                <span>{"18.7K lượt làm"}</span>
              </div>
              <div
                style={styleOf(
                  "font-size: 14px; line-height: 1.5; color: #706473; padding: 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden",
                )}
              >
                {"Chủ đề Part 1, 2, 3 dự đoán cho quý cuối năm"}
              </div>
              {"\n"}
              <a
                href={"ExamDetail.dc.html"}
                style={styleOf(
                  "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                )}
              >
                {"Xem bài test "}
                <svg
                  width={"16"}
                  height={"16"}
                  viewBox={"0 0 24 24"}
                  fill={"none"}
                  stroke={"currentColor"}
                  strokeWidth={"2.2"}
                  strokeLinecap={"round"}
                  strokeLinejoin={"round"}
                >
                  <path d={"M9 6l6 6-6 6"}></path>
                </svg>
              </a>
              {"\n"}
            </div>
            {"\n"}
            <div
              style={styleOf(
                "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; color: #352637; text-decoration: none; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
              )}
            >
              {"\n"}
              <div
                style={styleOf(
                  "aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #C5DECE",
                )}
              ></div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; padding: 4px 8px 0",
                )}
              >
                {"Academic Reading Pack 05"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 14px; color: #706473",
                )}
              >
                <span>{"12 bài test"}</span>
                <span
                  aria-hidden={"true"}
                  style={styleOf(
                    "width: 4px; height: 4px; border-radius: 50%; background: #B3A9B5",
                  )}
                ></span>
                <span>{"9.3K lượt làm"}</span>
              </div>
              <div
                style={styleOf(
                  "font-size: 14px; line-height: 1.5; color: #706473; padding: 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden",
                )}
              >
                {"Passage luyện theo dạng câu hỏi, có lời giải từng câu"}
              </div>
              {"\n"}
              <a
                href={"ExamDetail.dc.html"}
                style={styleOf(
                  "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                )}
              >
                {"Xem bài test "}
                <svg
                  width={"16"}
                  height={"16"}
                  viewBox={"0 0 24 24"}
                  fill={"none"}
                  stroke={"currentColor"}
                  strokeWidth={"2.2"}
                  strokeLinecap={"round"}
                  strokeLinejoin={"round"}
                >
                  <path d={"M9 6l6 6-6 6"}></path>
                </svg>
              </a>
              {"\n"}
            </div>
            {"\n"}
          </div>
          {"\n"}
        </section>
        {"\n\n"}
        {"\n"}
        <section
          id={"reading"}
          style={styleOf(
            "max-width: 1200px; margin: 0 auto; padding: 36px 24px",
          )}
        >
          {"\n"}
          <div
            style={styleOf(
              "display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 24px",
            )}
          >
            {"\n"}
            <div>
              {"\n"}
              <h2
                style={styleOf(
                  "margin: 0; font-size: 28px; line-height: 1.25; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                )}
              >
                {"Luyện IELTS Reading"}
              </h2>
              {"\n"}
              <p style={styleOf("margin: 4px 0 0; color: #706473")}>
                {
                  "Mỗi đề là trọn kỹ năng Reading: chọn Practice từng Passage hoặc Real Test 60 phút."
                }
              </p>
              {"\n"}
            </div>
            {"\n"}
            <a
              href={"#"}
              style={styleOf(
                "display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 15px; color: #352637; text-decoration: none",
              )}
            >
              {"Xem thêm "}
              <svg
                width={"16"}
                height={"16"}
                viewBox={"0 0 24 24"}
                fill={"none"}
                stroke={"currentColor"}
                strokeWidth={"2.2"}
                strokeLinecap={"round"}
                strokeLinejoin={"round"}
              >
                <path d={"M9 6l6 6-6 6"}></path>
              </svg>
            </a>
            {"\n"}
          </div>
          {"\n"}
          <div
            style={styleOf(
              "display: flex; gap: 28px 20px; overflow-x: auto; scroll-snap-type: x proximity; padding: 4px 4px 12px; margin: -4px",
            )}
          >
            {"\n"}
            <div
              style={styleOf(
                "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
              )}
            >
              {"\n"}
              <div
                style={styleOf(
                  "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #C5DECE",
                )}
              >
                <span
                  style={styleOf(
                    "position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 14px; font-weight: 600; line-height: 1.4; white-space: nowrap",
                  )}
                >
                  {"40 câu"}
                </span>
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; padding: 4px 8px 0",
                )}
              >
                {"Mock Test 2026 Vol 4 · Test 1 · Reading"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 14px; color: #706473; padding: 0 6px",
                )}
              >
                {"Academic · 3.2K lượt làm"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "margin-top: auto; padding: 4px 8px 0; display: flex",
                )}
              >
                {"\n"}
                <a
                  href={"#"}
                  style={styleOf(
                    "display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-weight: 600; text-decoration: none",
                  )}
                >
                  <svg
                    width={"20"}
                    height={"20"}
                    viewBox={"0 0 24 24"}
                    fill={"none"}
                    stroke={v.accent}
                    strokeWidth={"2"}
                  >
                    <circle cx={"12"} cy={"12"} r={"9"}></circle>
                    <path
                      d={"M10 8.5l5 3.5-5 3.5z"}
                      fill={v.accent}
                      strokeLinejoin={"round"}
                    ></path>
                  </svg>
                  {"Làm bài"}
                  <svg
                    width={"12"}
                    height={"12"}
                    viewBox={"0 0 24 24"}
                    fill={"#706473"}
                  >
                    <path d={"M6 9l6 7 6-7z"}></path>
                  </svg>
                </a>
                {"\n"}
              </div>
              {"\n"}
            </div>
            {"\n"}
            <div
              style={styleOf(
                "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
              )}
            >
              {"\n"}
              <div
                style={styleOf(
                  "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #BFD8F7",
                )}
              >
                <span
                  style={styleOf(
                    "position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 14px; font-weight: 600; line-height: 1.4; white-space: nowrap",
                  )}
                >
                  {"40 câu"}
                </span>
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; padding: 4px 8px 0",
                )}
              >
                {"Mock Test 2026 Vol 4 · Test 4 · Reading"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 14px; color: #706473; padding: 0 6px",
                )}
              >
                {"Academic · 5.6K lượt làm"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "margin-top: auto; padding: 4px 8px 0; display: flex",
                )}
              >
                {"\n"}
                <a
                  href={"#"}
                  style={styleOf(
                    "display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-weight: 600; text-decoration: none",
                  )}
                >
                  <svg
                    width={"20"}
                    height={"20"}
                    viewBox={"0 0 24 24"}
                    fill={"none"}
                    stroke={v.accent}
                    strokeWidth={"2"}
                  >
                    <circle cx={"12"} cy={"12"} r={"9"}></circle>
                    <path
                      d={"M10 8.5l5 3.5-5 3.5z"}
                      fill={v.accent}
                      strokeLinejoin={"round"}
                    ></path>
                  </svg>
                  {"Làm bài"}
                  <svg
                    width={"12"}
                    height={"12"}
                    viewBox={"0 0 24 24"}
                    fill={"#706473"}
                  >
                    <path d={"M6 9l6 7 6-7z"}></path>
                  </svg>
                </a>
                {"\n"}
              </div>
              {"\n"}
            </div>
            {"\n"}
            <div
              style={styleOf(
                "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
              )}
            >
              {"\n"}
              <div
                style={styleOf(
                  "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #F7C4B6",
                )}
              >
                <span
                  style={styleOf(
                    "position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 14px; font-weight: 600; line-height: 1.4; white-space: nowrap",
                  )}
                >
                  {"40 câu"}
                </span>
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; padding: 4px 8px 0",
                )}
              >
                {"Mock Test 2026 Vol 4 · Test 5 · Reading"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 14px; color: #706473; padding: 0 6px",
                )}
              >
                {"Academic · 4.1K lượt làm"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "margin-top: auto; padding: 4px 8px 0; display: flex",
                )}
              >
                {"\n"}
                <a
                  href={"#"}
                  style={styleOf(
                    "display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-weight: 600; text-decoration: none",
                  )}
                >
                  <svg
                    width={"20"}
                    height={"20"}
                    viewBox={"0 0 24 24"}
                    fill={"none"}
                    stroke={v.accent}
                    strokeWidth={"2"}
                  >
                    <circle cx={"12"} cy={"12"} r={"9"}></circle>
                    <path
                      d={"M10 8.5l5 3.5-5 3.5z"}
                      fill={v.accent}
                      strokeLinejoin={"round"}
                    ></path>
                  </svg>
                  {"Làm bài"}
                  <svg
                    width={"12"}
                    height={"12"}
                    viewBox={"0 0 24 24"}
                    fill={"#706473"}
                  >
                    <path d={"M6 9l6 7 6-7z"}></path>
                  </svg>
                </a>
                {"\n"}
              </div>
              {"\n"}
            </div>
            {"\n"}
            <div
              style={styleOf(
                "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
              )}
            >
              {"\n"}
              <div
                style={styleOf(
                  "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #C5CEF5",
                )}
              >
                <span
                  style={styleOf(
                    "position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 14px; font-weight: 600; line-height: 1.4; white-space: nowrap",
                  )}
                >
                  {"40 câu"}
                </span>
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; padding: 4px 8px 0",
                )}
              >
                {"IELTS CAM Inspired 19 · Test 1 · Reading"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 14px; color: #706473; padding: 0 6px",
                )}
              >
                {"General Training · 2.7K lượt làm"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "margin-top: auto; padding: 4px 8px 0; display: flex",
                )}
              >
                {"\n"}
                <a
                  href={"#"}
                  style={styleOf(
                    "display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-weight: 600; text-decoration: none",
                  )}
                >
                  <svg
                    width={"20"}
                    height={"20"}
                    viewBox={"0 0 24 24"}
                    fill={"none"}
                    stroke={v.accent}
                    strokeWidth={"2"}
                  >
                    <circle cx={"12"} cy={"12"} r={"9"}></circle>
                    <path
                      d={"M10 8.5l5 3.5-5 3.5z"}
                      fill={v.accent}
                      strokeLinejoin={"round"}
                    ></path>
                  </svg>
                  {"Làm bài"}
                  <svg
                    width={"12"}
                    height={"12"}
                    viewBox={"0 0 24 24"}
                    fill={"#706473"}
                  >
                    <path d={"M6 9l6 7 6-7z"}></path>
                  </svg>
                </a>
                {"\n"}
              </div>
              {"\n"}
            </div>
            {"\n"}
          </div>
          {"\n"}
        </section>
        {"\n\n"}
        {"\n"}
        <section
          id={"listening"}
          style={styleOf(
            "max-width: 1200px; margin: 0 auto; padding: 36px 24px",
          )}
        >
          {"\n"}
          <div
            style={styleOf(
              "display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 24px",
            )}
          >
            {"\n"}
            <div>
              {"\n"}
              <h2
                style={styleOf(
                  "margin: 0; font-size: 28px; line-height: 1.25; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                )}
              >
                {"Luyện IELTS Listening"}
              </h2>
              {"\n"}
              <p style={styleOf("margin: 4px 0 0; color: #706473")}>
                {
                  "Mỗi đề là trọn kỹ năng Listening: chọn Practice từng Section hoặc Real Test, audio phát một lần."
                }
              </p>
              {"\n"}
            </div>
            {"\n"}
            <a
              href={"#"}
              style={styleOf(
                "display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 15px; color: #352637; text-decoration: none",
              )}
            >
              {"Xem thêm "}
              <svg
                width={"16"}
                height={"16"}
                viewBox={"0 0 24 24"}
                fill={"none"}
                stroke={"currentColor"}
                strokeWidth={"2.2"}
                strokeLinecap={"round"}
                strokeLinejoin={"round"}
              >
                <path d={"M9 6l6 6-6 6"}></path>
              </svg>
            </a>
            {"\n"}
          </div>
          {"\n"}
          <div
            style={styleOf(
              "display: flex; gap: 28px 20px; overflow-x: auto; scroll-snap-type: x proximity; padding: 4px 4px 12px; margin: -4px",
            )}
          >
            {"\n"}
            <div
              style={styleOf(
                "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
              )}
            >
              {"\n"}
              <div
                style={styleOf(
                  "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #BFD8F7",
                )}
              >
                <span
                  style={styleOf(
                    "position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 14px; font-weight: 600; line-height: 1.4; white-space: nowrap",
                  )}
                >
                  {"40 câu"}
                </span>
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; padding: 4px 8px 0",
                )}
              >
                {"Mock Test 2026 Vol 4 · Test 1 · Listening"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 14px; color: #706473; padding: 0 6px",
                )}
              >
                {"2.8K lượt làm"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "margin-top: auto; padding: 4px 8px 0; display: flex",
                )}
              >
                {"\n"}
                <a
                  href={"#"}
                  style={styleOf(
                    "display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-weight: 600; text-decoration: none",
                  )}
                >
                  <svg
                    width={"20"}
                    height={"20"}
                    viewBox={"0 0 24 24"}
                    fill={"none"}
                    stroke={v.accent}
                    strokeWidth={"2"}
                  >
                    <circle cx={"12"} cy={"12"} r={"9"}></circle>
                    <path
                      d={"M10 8.5l5 3.5-5 3.5z"}
                      fill={v.accent}
                      strokeLinejoin={"round"}
                    ></path>
                  </svg>
                  {"Làm bài"}
                  <svg
                    width={"12"}
                    height={"12"}
                    viewBox={"0 0 24 24"}
                    fill={"#706473"}
                  >
                    <path d={"M6 9l6 7 6-7z"}></path>
                  </svg>
                </a>
                {"\n"}
              </div>
              {"\n"}
            </div>
            {"\n"}
            <div
              style={styleOf(
                "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
              )}
            >
              {"\n"}
              <div
                style={styleOf(
                  "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #C5CEF5",
                )}
              >
                <span
                  style={styleOf(
                    "position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 14px; font-weight: 600; line-height: 1.4; white-space: nowrap",
                  )}
                >
                  {"40 câu"}
                </span>
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; padding: 4px 8px 0",
                )}
              >
                {"Mock Test 2026 Vol 4 · Test 2 · Listening"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 14px; color: #706473; padding: 0 6px",
                )}
              >
                {"2.1K lượt làm"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "margin-top: auto; padding: 4px 8px 0; display: flex",
                )}
              >
                {"\n"}
                <a
                  href={"#"}
                  style={styleOf(
                    "display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-weight: 600; text-decoration: none",
                  )}
                >
                  <svg
                    width={"20"}
                    height={"20"}
                    viewBox={"0 0 24 24"}
                    fill={"none"}
                    stroke={v.accent}
                    strokeWidth={"2"}
                  >
                    <circle cx={"12"} cy={"12"} r={"9"}></circle>
                    <path
                      d={"M10 8.5l5 3.5-5 3.5z"}
                      fill={v.accent}
                      strokeLinejoin={"round"}
                    ></path>
                  </svg>
                  {"Làm bài"}
                  <svg
                    width={"12"}
                    height={"12"}
                    viewBox={"0 0 24 24"}
                    fill={"#706473"}
                  >
                    <path d={"M6 9l6 7 6-7z"}></path>
                  </svg>
                </a>
                {"\n"}
              </div>
              {"\n"}
            </div>
            {"\n"}
            <div
              style={styleOf(
                "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
              )}
            >
              {"\n"}
              <div
                style={styleOf(
                  "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #C5DECE",
                )}
              >
                <span
                  style={styleOf(
                    "position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 14px; font-weight: 600; line-height: 1.4; white-space: nowrap",
                  )}
                >
                  {"40 câu"}
                </span>
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; padding: 4px 8px 0",
                )}
              >
                {"Mock Test 2026 Vol 4 · Test 4 · Listening"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 14px; color: #706473; padding: 0 6px",
                )}
              >
                {"3.7K lượt làm"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "margin-top: auto; padding: 4px 8px 0; display: flex",
                )}
              >
                {"\n"}
                <a
                  href={"#"}
                  style={styleOf(
                    "display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-weight: 600; text-decoration: none",
                  )}
                >
                  <svg
                    width={"20"}
                    height={"20"}
                    viewBox={"0 0 24 24"}
                    fill={"none"}
                    stroke={v.accent}
                    strokeWidth={"2"}
                  >
                    <circle cx={"12"} cy={"12"} r={"9"}></circle>
                    <path
                      d={"M10 8.5l5 3.5-5 3.5z"}
                      fill={v.accent}
                      strokeLinejoin={"round"}
                    ></path>
                  </svg>
                  {"Làm bài"}
                  <svg
                    width={"12"}
                    height={"12"}
                    viewBox={"0 0 24 24"}
                    fill={"#706473"}
                  >
                    <path d={"M6 9l6 7 6-7z"}></path>
                  </svg>
                </a>
                {"\n"}
              </div>
              {"\n"}
            </div>
            {"\n"}
            <div
              style={styleOf(
                "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
              )}
            >
              {"\n"}
              <div
                style={styleOf(
                  "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #F7C4B6",
                )}
              >
                <span
                  style={styleOf(
                    "position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 14px; font-weight: 600; line-height: 1.4; white-space: nowrap",
                  )}
                >
                  {"40 câu"}
                </span>
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; padding: 4px 8px 0",
                )}
              >
                {"IELTS CAM Inspired 19 · Test 1 · Listening"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 14px; color: #706473; padding: 0 6px",
                )}
              >
                {"1.9K lượt làm"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "margin-top: auto; padding: 4px 8px 0; display: flex",
                )}
              >
                {"\n"}
                <a
                  href={"#"}
                  style={styleOf(
                    "display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-weight: 600; text-decoration: none",
                  )}
                >
                  <svg
                    width={"20"}
                    height={"20"}
                    viewBox={"0 0 24 24"}
                    fill={"none"}
                    stroke={v.accent}
                    strokeWidth={"2"}
                  >
                    <circle cx={"12"} cy={"12"} r={"9"}></circle>
                    <path
                      d={"M10 8.5l5 3.5-5 3.5z"}
                      fill={v.accent}
                      strokeLinejoin={"round"}
                    ></path>
                  </svg>
                  {"Làm bài"}
                  <svg
                    width={"12"}
                    height={"12"}
                    viewBox={"0 0 24 24"}
                    fill={"#706473"}
                  >
                    <path d={"M6 9l6 7 6-7z"}></path>
                  </svg>
                </a>
                {"\n"}
              </div>
              {"\n"}
            </div>
            {"\n"}
          </div>
          {"\n"}
        </section>
        {"\n\n"}
        {"\n"}
        <section
          id={"tu-vung"}
          style={styleOf(
            "max-width: 1200px; margin: 0 auto; padding: 36px 24px",
          )}
        >
          {"\n"}
          <div
            style={styleOf(
              "display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 24px",
            )}
          >
            {"\n"}
            <div>
              {"\n"}
              <h2
                style={styleOf(
                  "margin: 0; font-size: 28px; line-height: 1.25; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                )}
              >
                {"Từ vựng mới"}
              </h2>
              {"\n"}
              <p style={styleOf("margin: 4px 0 0; color: #706473")}>
                {"Từ học thuật theo chủ đề hay gặp trong đề thi gần đây."}
              </p>
              {"\n"}
            </div>
            {"\n"}
            <a
              href="#Vocab"
              style={styleOf(
                "display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 15px; color: #352637; text-decoration: none",
              )}
            >
              {"Xem thêm "}
              <svg
                width={"16"}
                height={"16"}
                viewBox={"0 0 24 24"}
                fill={"none"}
                stroke={"currentColor"}
                strokeWidth={"2.2"}
                strokeLinecap={"round"}
                strokeLinejoin={"round"}
              >
                <path d={"M9 6l6 6-6 6"}></path>
              </svg>
            </a>
            {"\n"}
          </div>
          {"\n"}
          <div
            style={styleOf(
              "display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x proximity; padding: 4px 4px 12px; margin: -4px",
            )}
          >
            {"\n"}
            <div
              style={styleOf(
                "flex: 1 0 240px; scroll-snap-align: start; display: flex; flex-direction: column; gap: 6px; padding: 18px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
              )}
            >
              {"\n"}
              <div
                style={styleOf(
                  "display: flex; justify-content: space-between; align-items: center",
                )}
              >
                <span
                  style={styleOf(
                    "font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #706473",
                  )}
                >
                  {"Environment"}
                </span>
                <button
                  type={"button"}
                  aria-label={"Lưu từ"}
                  style={styleOf(
                    "width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; display: flex; align-items: center; justify-content: center",
                  )}
                >
                  <svg
                    width={"17"}
                    height={"17"}
                    viewBox={"0 0 24 24"}
                    fill={"none"}
                    stroke={"currentColor"}
                    strokeWidth={"2"}
                    strokeLinejoin={"round"}
                  >
                    <path
                      d={
                        "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"
                      }
                    ></path>
                  </svg>
                </button>
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 22px; font-weight: 700; margin-top: 6px; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                )}
              >
                {"mitigate"}
              </div>
              {"\n"}
              <div style={styleOf("font-size: 13px; color: #706473")}>
                {"/ˈmɪt.ɪ.ɡeɪt/ · "}
                <i>{"v"}</i>
              </div>
              {"\n"}
              <div style={styleOf("font-weight: 600")}>
                {"giảm nhẹ, làm dịu"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 13px; color: #706473; background: #F6F4EF; border-radius: 10px; padding: 10px 12px; margin-top: 8px",
                )}
              >
                {"Planting trees can mitigate the effects of urban heat."}
              </div>
              {"\n"}
            </div>
            {"\n"}
            <div
              style={styleOf(
                "flex: 1 0 240px; scroll-snap-align: start; display: flex; flex-direction: column; gap: 6px; padding: 18px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
              )}
            >
              {"\n"}
              <div
                style={styleOf(
                  "display: flex; justify-content: space-between; align-items: center",
                )}
              >
                <span
                  style={styleOf(
                    "font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #706473",
                  )}
                >
                  {"Society"}
                </span>
                <button
                  type={"button"}
                  aria-label={"Lưu từ"}
                  style={styleOf(
                    "width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; display: flex; align-items: center; justify-content: center",
                  )}
                >
                  <svg
                    width={"17"}
                    height={"17"}
                    viewBox={"0 0 24 24"}
                    fill={"none"}
                    stroke={"currentColor"}
                    strokeWidth={"2"}
                    strokeLinejoin={"round"}
                  >
                    <path
                      d={
                        "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"
                      }
                    ></path>
                  </svg>
                </button>
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 22px; font-weight: 700; margin-top: 6px; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                )}
              >
                {"disproportionate"}
              </div>
              {"\n"}
              <div style={styleOf("font-size: 13px; color: #706473")}>
                {"/ˌdɪs.prəˈpɔː.ʃən.ət/ · "}
                <i>{"adj"}</i>
              </div>
              {"\n"}
              <div style={styleOf("font-weight: 600")}>
                {"không cân xứng"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 13px; color: #706473; background: #F6F4EF; border-radius: 10px; padding: 10px 12px; margin-top: 8px",
                )}
              >
                {
                  "Low-income families spend a disproportionate share on rent."
                }
              </div>
              {"\n"}
            </div>
            {"\n"}
            <div
              style={styleOf(
                "flex: 1 0 240px; scroll-snap-align: start; display: flex; flex-direction: column; gap: 6px; padding: 18px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
              )}
            >
              {"\n"}
              <div
                style={styleOf(
                  "display: flex; justify-content: space-between; align-items: center",
                )}
              >
                <span
                  style={styleOf(
                    "font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #706473",
                  )}
                >
                  {"Urban life"}
                </span>
                <button
                  type={"button"}
                  aria-label={"Lưu từ"}
                  style={styleOf(
                    "width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; display: flex; align-items: center; justify-content: center",
                  )}
                >
                  <svg
                    width={"17"}
                    height={"17"}
                    viewBox={"0 0 24 24"}
                    fill={"none"}
                    stroke={"currentColor"}
                    strokeWidth={"2"}
                    strokeLinejoin={"round"}
                  >
                    <path
                      d={
                        "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"
                      }
                    ></path>
                  </svg>
                </button>
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 22px; font-weight: 700; margin-top: 6px; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                )}
              >
                {"infrastructure"}
              </div>
              {"\n"}
              <div style={styleOf("font-size: 13px; color: #706473")}>
                {"/ˈɪn.frəˌstrʌk.tʃər/ · "}
                <i>{"n"}</i>
              </div>
              {"\n"}
              <div style={styleOf("font-weight: 600")}>{"cơ sở hạ tầng"}</div>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 13px; color: #706473; background: #F6F4EF; border-radius: 10px; padding: 10px 12px; margin-top: 8px",
                )}
              >
                {"Rural areas still lack basic digital infrastructure."}
              </div>
              {"\n"}
            </div>
            {"\n"}
          </div>
          {"\n"}
        </section>
        {"\n\n"}
        {"\n"}
        <section
          id={"bai-mau"}
          style={styleOf(
            "max-width: 1200px; margin: 0 auto; padding: 36px 24px",
          )}
        >
          {"\n"}
          <div
            style={styleOf(
              "display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 24px",
            )}
          >
            {"\n"}
            <div>
              {"\n"}
              <h2
                style={styleOf(
                  "margin: 0; font-size: 28px; line-height: 1.25; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                )}
              >
                {"Bài mẫu"}
              </h2>
              {"\n"}
              <p style={styleOf("margin: 4px 0 0; color: #706473")}>
                {
                  "Bài mẫu band 7.5+ theo đề thi thật, kèm dàn ý và mạch ý tưởng."
                }
              </p>
              {"\n"}
            </div>
            {"\n"}
            <a
              href="#SampleLibrary"
              style={styleOf(
                "display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 15px; color: #352637; text-decoration: none",
              )}
            >
              {"Xem thêm "}
              <svg
                width={"16"}
                height={"16"}
                viewBox={"0 0 24 24"}
                fill={"none"}
                stroke={"currentColor"}
                strokeWidth={"2.2"}
                strokeLinecap={"round"}
                strokeLinejoin={"round"}
              >
                <path d={"M9 6l6 6-6 6"}></path>
              </svg>
            </a>
            {"\n"}
          </div>
          {"\n"}
          <FeaturedSamples />
          {"\n"}
        </section>
        {"\n\n"}
        {"\n"}
        <footer
          style={styleOf(
            "border-top: 1.5px solid #D6D4D0; background: #FAF9F5",
          )}
        >
          {"\n"}
          <div
            style={styleOf(
              "max-width: 1200px; margin: 0 auto; padding: 40px 24px 48px; display: flex; flex-wrap: wrap; gap: 28px",
            )}
          >
            {"\n"}
            <div style={styleOf("flex: 1.4 1 280px")}>
              {"\n"}
              <div
                style={styleOf(
                  "display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 18px",
                )}
              >
                <span
                  style={styleOf(
                    "width: 32px; height: 32px; border-radius: 10px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: " +
                      v.accent +
                      "; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; color: " +
                      v.onAccent,
                  )}
                >
                  {"IS"}
                </span>
                <span>{"IELTSpace"}</span>
              </div>
              {"\n"}
              <p
                style={styleOf(
                  "margin: 14px 0 0; font-size: 13px; color: #706473; max-width: 36ch",
                )}
              >
                {
                  "Hệ thống luyện đề IELTS 4 kỹ năng."
                }
              </p>
              {"\n"}
            </div>
            {"\n"}
            <div style={styleOf("flex: 1 1 150px")}>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #706473; margin-bottom: 14px",
                )}
              >
                {"Luyện thi"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "display: flex; flex-direction: column; gap: 10px; font-size: 14px",
                )}
              >
                <a
                  href={"#bo-de"}
                  style={styleOf("color: #4B3D4D; text-decoration: none")}
                >
                  {"Thư viện đề"}
                </a>
                <a
                  href={"#tu-vung"}
                  style={styleOf("color: #4B3D4D; text-decoration: none")}
                >
                  {"Thư viện từ vựng"}
                </a>
                <a
                  href={"#bai-mau"}
                  style={styleOf("color: #4B3D4D; text-decoration: none")}
                >
                  {"Bài mẫu"}
                </a>
              </div>
              {"\n"}
            </div>
            {"\n"}
            <div style={styleOf("flex: 1 1 150px")}>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #706473; margin-bottom: 14px",
                )}
              >
                {"Tài khoản"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "display: flex; flex-direction: column; gap: 10px; font-size: 14px",
                )}
              >
                <a
                  href={"#"}
                  style={styleOf("color: #4B3D4D; text-decoration: none")}
                >
                  {"Đăng ký"}
                </a>
                <a
                  href={"#"}
                  style={styleOf("color: #4B3D4D; text-decoration: none")}
                >
                  {"Đăng nhập"}
                </a>
              </div>
              {"\n"}
            </div>
            {"\n"}
            <div style={styleOf("flex: 1 1 150px")}>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #706473; margin-bottom: 14px",
                )}
              >
                {"Hỗ trợ"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "display: flex; flex-direction: column; gap: 10px; font-size: 14px",
                )}
              >
                <a
                  href={"#faq"}
                  style={styleOf("color: #4B3D4D; text-decoration: none")}
                >
                  {"Câu hỏi thường gặp"}
                </a>
                <a
                  href="#Profile?support=1"
                  style={styleOf("color: #4B3D4D; text-decoration: none")}
                >
                  {"Liên hệ"}
                </a>
              </div>
              {"\n"}
            </div>
            {"\n"}
          </div>
          {"\n"}
        </footer>
        {"\n\n\n"}
      </div>
      {"\n"}
    </>
  );
}
