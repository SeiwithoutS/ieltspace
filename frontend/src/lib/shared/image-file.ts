import type { ChangeEvent } from "react";

export type ImageReadDone = (
  file: File | null,
  url: string | null,
  msg: string,
  ok?: boolean,
) => void;

// Đọc ảnh người dùng chọn từ ô <input type="file">: kiểm tra loại (png/jpeg/webp) và dung lượng (≤ 5 MB),
// đọc thành data URL, đo tỉ lệ để cảnh báo khi lệch xa 3:2.
// done(file, url, msg, ok): lỗi thì url = null và msg là lý do; hợp lệ thì ok = true, msg có thể là lời cảnh báo tỉ lệ.
export function readImage(
  e: ChangeEvent<HTMLInputElement>,
  done: ImageReadDone,
): void {
  const f = e && e.target && e.target.files && e.target.files[0];
  if (!f) {
    return;
  }
  if (!/^image\/(png|jpeg|webp)$/.test(f.type)) {
    done(null, null, "Ảnh phải là JPG, PNG hoặc WebP.");
    return;
  }
  if (f.size > 5 * 1024 * 1024) {
    done(null, null, "Ảnh lớn hơn 5 MB, hãy chọn ảnh nhỏ hơn.");
    return;
  }
  const r = new FileReader();
  r.onload = function () {
    const url = typeof r.result === "string" ? r.result : "";
    const im = new Image();
    im.onload = function () {
      const q = im.width / im.height;
      done(
        f,
        url,
        Math.abs(q - 1.5) > 0.12
          ? "Ảnh " +
              im.width +
              " × " +
              im.height +
              " không đúng tỉ lệ 3:2, sẽ được thu vừa khung bìa trên nền màu."
          : "",
        true,
      );
    };
    im.onerror = function () {
      done(f, url, "");
    };
    im.src = url;
  };
  r.readAsDataURL(f);
  try {
    e.target.value = "";
  } catch {
    // Một số trình duyệt không cho gán lại value của ô file.
  }
}
