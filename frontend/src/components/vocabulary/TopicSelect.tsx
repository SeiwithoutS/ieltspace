import { topics, type Topic } from "../../data/vocabulary";

export function TopicSelect({
  value,
  onChange,
}: {
  value: Topic;
  onChange: (t: Topic) => void;
}) {
  return (
    <select
      aria-label="Bộ từ vựng"
      value={value}
      onChange={(e) => onChange(e.target.value as Topic)}
    >
      {Object.entries(topics).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  );
}
