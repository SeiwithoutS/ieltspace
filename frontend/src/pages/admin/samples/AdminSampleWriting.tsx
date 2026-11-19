import SampleEditor from "./SampleEditor";
import type {
  SampleEditorPageProps,
} from "../../../lib/sample-types";

export default function AdminSampleWriting(
  props: SampleEditorPageProps,
) {
  return <SampleEditor {...props} skill="WRITING" />;
}
