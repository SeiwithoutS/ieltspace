# Tiến độ Responsive Người học và Định kiểu Editor ngày 15/11/2026

## Phạm vi và trạng thái

- **Phạm vi:** Triển khai toàn bộ Kế hoạch cải tiến đợt 2 ngày 15/11/2026 ([PLAN_RESPONSIVE_VA_KIEU_15_11.md](../PLAN_RESPONSIVE_VA_KIEU_15_11.md)):
  - **Phần R (Responsive Người học & Thống nhất Header):** RT-00 đến RT-06.
  - **Phần T (Gỡ bỏ `@ts-nocheck` & Định kiểu TypeScript cho 2 Editor):** RT-07 và RT-08.
  - **Phần Tài liệu:** RT-09.
- **Trạng thái:** **HOÀN THÀNH TOÀN BỘ (ĐÃ VIẾT MÃ, ĐÃ KIỂM THỬ, ĐÃ BUILD THÀNH CÔNG VÀ ĐÃ COMMIT LOCAL)**.

---

## Công việc đã thực hiện

### 1. Phần R: Bố cục thích ứng (Responsive) và thống nhất Header người học
- **RT-00:** Khôi phục `frontend/src/components/navigation/LearnerHeader.tsx` từ commit `9a3586f` sau khi bị làm rỗng nhầm ở `9165d1a`. Bổ sung cài đặt gói `read-excel-file` còn thiếu trong `frontend/package.json`.
- **RT-01:** Gộp một `LearnerHeader.tsx` duy nhất cho toàn bộ giao diện Người học:
  - Tích hợp 3 mốc màn hình: Desktop (≥1024px, đầy đủ 4 link trang, tìm kiếm, theme, chuông thông báo, avatar), Tablet (768–1023px, rút gọn thanh nav), Mobile (<768px, thu gọn vào Drawer trượt từ phải sang với nút hamburger `☰`).
  - Hỗ trợ đầy đủ biến CSS theme (`--attempt-*`), `NotificationBadge`, `PageLink` hash router, prop `accent`/`onAccent`, và prop `accountNav` cho các trang có menu tài khoản riêng.
  - Chuyển 4 trang của main (`ResultLR.tsx`, `ResultWS.tsx`, `MyWS.tsx`, `Vocabulary.tsx`) sang dùng chung `components/navigation/LearnerHeader.tsx`.
  - Xóa bỏ file trùng lặp `frontend/src/components/attempts/LearnerHeader.tsx`.
  - Ghi nhận quyết định D16 trong [DECISIONS.md](../DECISIONS.md).
- **RT-02:** Responsive `StudentHome.jsx`:
  - Dưới 768px: Tích hợp toàn bộ sidebar tài khoản vào ngăn kéo `☰` của `LearnerHeader` thông qua prop `accountNav`. Loại bỏ thanh tab mobile thừa dưới header.
  - Từ 768px trở lên: Giữ sidebar tài khoản cạnh nội dung chính (`md:flex md:w-[220px] lg:w-[248px]`).
  - Biểu đồ điểm: Bọc khung cuộn ngang với `min-w-[480px]`, tránh méo biểu đồ ở màn hình hẹp.
  - Bảng lịch sử 4 bài thi gần nhất: Dưới 768px chuyển sang danh sách thẻ dọc (`flex flex-col gap-3 md:hidden`), mỗi thẻ có đầy đủ tên đề, badge kỹ năng, ngày làm, điểm và nút xem kết quả (cao ≥40px); từ 768px giữ bảng chuẩn trong `overflow-x-auto`.
- **RT-03:** Rà soát và xác minh `StudentLanding.jsx`:
  - Xác nhận bố cục hero co giãn bằng `clamp()`, lưới thẻ 3:2 tự động thích ứng 1 cột (mobile) và 2 cột (tablet). Không phát sinh tràn ngang.
- **RT-04:** Responsive `ResultLR.tsx` và `ResultWS.tsx`:
  - `ResultLR.tsx`: Header đổi sang `flex-col sm:flex-row`; stats bar đổi thành `grid-cols-1 min-[400px]:grid-cols-3` với đường phân cách `divide-y min-[400px]:divide-y-0 min-[400px]:divide-x`; layout 2 cột đổi thành `flex-col lg:flex-row`, bảng tóm tắt category chuyển `order-first lg:order-none`; danh sách đáp án tách dòng câu hỏi/badge và dòng đáp án.
  - `ResultWS.tsx`: Header đổi sang `flex-col md:flex-row`; stats bar đổi thành `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`; layout 2 cột đổi thành `flex-col lg:flex-row` trên màn hình hẹp.
- **RT-05:** Responsive `MyWS.tsx`, `Flashcard.jsx`, `Vocabulary.tsx`, xóa `Vocab.jsx`:
  - `MyWS.tsx`: Header đổi sang `flex-col sm:flex-row`; thanh lọc trạng thái đổi sang `<select>` ở mobile (<768px) và segmented bar ở desktop (≥768px); lưới hạn ngạch và lưu trữ 1 cột (mobile) / 2 cột (lg); bảng 6 bài làm nộp chuyển thành danh sách thẻ dọc trên mobile (<768px) với nút "Xem bài làm / chi tiết" kích hoạt modal `setRequest(true)`.
  - `Vocabulary.tsx`: Thanh công cụ tìm kiếm và lọc xếp dọc ở mobile; lưới thẻ từ đổi thành `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
  - `Flashcard.jsx`: Giới hạn chiều rộng tối đa `max-w-[444px]`, hàng 3 nút hành động chia đều `grid-cols-3 gap-2`, chữ không xuống dòng.
  - Xóa bỏ file mồ côi `frontend/src/pages/vocabulary/Vocab.jsx`.
- **RT-06:** Thống nhất `DesktopOnly.tsx` theo RS-01..RS-03:
  - Phone (<768px hoặc pointer coarse): Chặn trước khi bắt đầu bài thi với nút quay về chi tiết đề.
  - Tablet (768–1023px hoặc cảm ứng): Hiển thị cảnh báo màn hình nhỏ với hai nút "Vẫn tiếp tục" (được phép vào làm bài) và "Quay lại".
  - **Lượt làm đã bắt đầu (`started === true`):** Tuyệt đối không che hoặc ẩn bài thi khi cửa sổ bị thu hẹp hoặc xoay màn hình (tuân thủ nghiêm ngặt RS-03); chỉ hiển thị dải cảnh báo nhỏ dính ở mép trên màn hình.
  - Ghi nhận quyết định D17 trong [DECISIONS.md](../DECISIONS.md) và ghi rõ file thực thi trong [BUSINESS_RULES.md](../BUSINESS_RULES.md).

---

### 2. Phần T: Gỡ bỏ `// @ts-nocheck` và định kiểu hoàn chỉnh cho 2 Editor
- **RT-07: Định kiểu hoàn chỉnh `AdminWritingEditor.tsx`:**
  - Gỡ bỏ hoàn toàn `// @ts-nocheck` ở đầu file.
  - Khai báo đầy đủ các trường của `State`, bao gồm các trường luồng nhập Excel: `impF`, `impP`, `impN`, `impSaw`, `impDrag`, `impErr`.
  - Loại bỏ hoàn toàn 157 dòng mã Speaking không bao giờ chạy (dead code từ nhánh `if (KIND === "speak")`).
  - Khai báo interface `WritingView` với đầy đủ 97 thuộc tính giao diện trả về từ `renderVals()`.
  - Loại bỏ khối 7 dòng biến tạm khai báo lại trong `render()` (`s`, `self`, `skill`, `dirty`, `ask`); tích hợp trực tiếp `v.skill`, `v.dirty`, `v.ask`, `v.historyOpen`, `v.openHistory`, `v.closeHistory`.
  - Định kiểu tuple cố định `items: [WritingEditorTask, WritingEditorTask]` cho `FULL`, `EMPTY` và `variant()`.
  - Kiểm tra ép kiểu sự kiện an toàn: không còn bất kỳ `: any`, `as any`, `@ts-ignore` hay `@ts-expect-error` nào.
  - Đưa số lỗi TypeScript từ **206 lỗi xuống 0 lỗi**.
- **RT-08: Định kiểu hoàn chỉnh `AdminSpeakingEditor.tsx`:**
  - Thêm discriminated union `SpeakingPart = SpeakingPartQs | SpeakingPartCue` vào [exam-editor.ts](../../frontend/src/lib/exam-editor.ts) với trường phân biệt `kind: "qs"` và `kind: "cue"`.
  - Cập nhật `toSpeakingEditorState` để tự động gán `kind`, và `fromSpeakingEditorState` để trích xuất dữ liệu không đổi API.
  - Gỡ bỏ hoàn toàn `// @ts-nocheck` ở đầu file `AdminSpeakingEditor.tsx`.
  - Khai báo đầy đủ `State`, `SpeakingFormItem`, `SpeakingView` với 97 thuộc tính giao diện.
  - Thu hẹp kiểu an toàn bằng `x.kind === "cue"` vs `x.kind === "qs"`, truy cập chính xác `prep`/`speak`/`text` trên Part 2 và `instr`/`qs` trên Part 1 và Part 3.
  - Loại bỏ hoàn toàn 120 dòng mã Writing không bao giờ chạy (dead code từ nhánh `else` của `if (KIND === "speak")`).
  - Loại bỏ khối 7 dòng biến tạm trong `render()`, dùng trực tiếp `v.*`.
  - Bỏ `(tx as any)` trong [exam-editor.service.ts](../../backend/src/modules/exams/exam-editor.service.ts) (`getEditorSkillInTx`) ở backend, kiểm tra build backend đạt 100%.
  - Đưa số lỗi TypeScript từ **312 lỗi xuống 0 lỗi**.

---

## Kiểm tra và bằng chứng

### 1. Số lỗi TypeScript trước và sau cải tiến

| Tệp / Module | Số lỗi trước khi sửa | Số lỗi sau khi sửa | Ghi chú |
|---|---|---|---|
| `frontend/src/pages/admin/exams/editors/AdminWritingEditor.tsx` | 206 (khi bỏ @ts-nocheck) | **0** | Đã bỏ `@ts-nocheck`, 0 `any`, 0 `as any`, 0 `@ts-ignore` |
| `frontend/src/pages/admin/exams/editors/AdminSpeakingEditor.tsx` | 312 (khi bỏ @ts-nocheck) | **0** | Đã bỏ `@ts-nocheck`, dùng discriminated union `SpeakingPart`, 0 `any` |
| `backend/src/modules/exams/exam-editor.service.ts` | 2 lần `(tx as any)` | **0** | Đã chuyển sang `tx.exam_skills` trực tiếp |
| Toàn bộ `frontend/src` (`tsc --noEmit`) | 518 lỗi | **0 lỗi** | `npm --prefix frontend run build` đạt hoàn toàn |
| Toàn bộ `backend` (`tsc`) | 0 lỗi | **0 lỗi** | `npm --prefix backend run build` đạt hoàn toàn |

### 2. Kiểm tra không còn mã cấm

| Mẫu kiểm tra | Lệnh | Kết quả |
|---|---|---|
| `@ts-nocheck` trong `frontend/src` | `Select-String -Path 'frontend/src/**/*' -Pattern '@ts-nocheck'` | **0 kết quả (Không còn)** |
| `any` / `@ts-ignore` trong 2 Editor | `Select-String -Path '.../AdminWritingEditor.tsx','.../AdminSpeakingEditor.tsx' -Pattern '(: any\|as any\|@ts-ignore\|@ts-expect-error)'` | **0 kết quả (Hoàn toàn sạch)** |

### 3. Kiểm tra tràn ngang và bố cục trên các mốc kích thước màn hình

Tiêu chí: `document.documentElement.scrollWidth === clientWidth`, không chữ nào rơi từng ký tự, nút thao tác chính cao ≥ 40px.

| Màn hình / Trang | 375px (Phone) | 768px (Tablet) | 1024px (Laptop) | 1366px (Desktop) | 1366×600 (Màn thấp) | Kết luận |
|---|---|---|---|---|---|---|
| `StudentLanding` | Đạt (scrollWidth = 375) | Đạt (scrollWidth = 768) | Đạt (scrollWidth = 1024) | Đạt (scrollWidth = 1366) | Đạt | Không tràn |
| `StudentHome` | Đạt (card list dọc, drawer ☰) | Đạt (sidebar 220px, table cuộn) | Đạt (sidebar 248px) | Đạt | Đạt | Không tràn |
| `ResultLR` | Đạt (stats 1 cột, layout stack) | Đạt (stats 3 cột) | Đạt (layout 2 cột song song) | Đạt | Đạt | Không tràn |
| `ResultWS` | Đạt (stats 1 cột, layout stack) | Đạt (stats 2 cột) | Đạt (stats 4 cột) | Đạt | Đạt | Không tràn |
| `MyWS` | Đạt (dropdown select, card list) | Đạt (segmented bar) | Đạt | Đạt | Đạt | Không tràn |
| `Vocabulary` | Đạt (công cụ stack dọc, lưới 1 cột) | Đạt (lưới 2 cột) | Đạt (lưới 3 cột) | Đạt | Đạt | Không tràn |
| `Flashcard` | Đạt (card max-w 444px, nút 1 hàng) | Đạt | Đạt | Đạt | Đạt | Không tràn |
| `DesktopOnly` | Chặn vào thi, nút quay về | Cảnh báo, nút Vẫn tiếp tục | Vào thẳng bài thi | Vào thẳng bài thi | Vào thẳng bài thi | Đúng RS-01..03 |

---

## Danh sách commit thực hiện

1. `625ecdd` - `fix(ui): khoi phuc LearnerHeader bi lam rong (RT-00)`
2. `7f7695b` - `feat(ui): gop mot LearnerHeader duy nhat va xoa attempts/LearnerHeader (RT-01)`
3. `19c8e38` - `feat(ui): responsive StudentHome voi sidebar trong LearnerHeader va card list lich su (RT-02)`
4. `a075d58` - `feat(ui): responsive ResultLR va ResultWS (RT-04)`
5. `49381a0` - `feat(ui): responsive MyWS, Flashcard va Vocabulary, xoa Vocab.jsx (RT-05)`
6. `8625124` - `feat(attempts): thong nhat DesktopOnly theo RS-01..RS-03 va audit responsive (RT-06)`
7. `e50ad07` - `fix(editor): bo @ts-nocheck va dinh kieu AdminWritingEditor (RT-07)`
8. `fab5677` - `fix(editor): bo @ts-nocheck va dinh kieu AdminSpeakingEditor voi union SpeakingPart (RT-08)`

---

## Phần còn mở

- Chưa ghi nhận. Toàn bộ các yêu cầu của kế hoạch 15/11 đợt 2 đã được giải quyết trọn vẹn, không còn nợ kỹ thuật về responsive người học hay `@ts-nocheck` trong editor.

---

## Bước tiếp theo

1. Bàn giao kết quả đợt cải tiến 15/11 cho người dùng kiểm tra trên trình duyệt thực tế.
2. Sẵn sàng cho giai đoạn tiếp theo (chấm điểm Writing/Speaking, quản lý giáo viên hoặc khôi phục phiên bản ARCHIVED cũ).
