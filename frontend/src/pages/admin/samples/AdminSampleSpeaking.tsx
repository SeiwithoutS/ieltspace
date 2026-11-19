import SampleEditor from "./SampleEditor";
import type {
  SampleEditorPageProps,
} from "../../../lib/samples/sample-types";

export default function AdminSampleSpeaking(
  props: SampleEditorPageProps,
) {
  return <SampleEditor {...props} skill="SPEAKING" />;
}
